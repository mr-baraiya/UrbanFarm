const axios = require('axios');
const aiConfig = require('../config/aiConfig');
const { VALID_PLATFORM_ROUTES, PLATFORM_ROUTES, KNOWLEDGE_BASE } = require('../data/chatbotKnowledge');
const { detectIntent, extractPlant, extractSymptom, validateQuickActions } = require('./chatbotIntentService');
const { getCachedResponse, setCachedResponse, logQuery } = require('./chatbotCacheService');

/**
 * Build rich rule-based fallback response from local verified knowledge base
 */
function buildRichFallbackResponse(message, lang, detected, userContext = { role: 'guest' }) {
  const role = (userContext?.role || 'guest').toLowerCase();
  const lowerMsg = String(message || '').toLowerCase();

  // Check if message asks about admin functions
  const isAdminQuery = lowerMsg.match(/(admin|add user|delete user|audit log|export csv|guest lead|system setting|user management)/i);
  if (isAdminQuery && role !== 'admin') {
    const text = lang === 'gu'
      ? '⚠️ **વહીવટી સુરક્ષા સૂચના**: વપરાશકર્તાઓ ઉમેરવા, ઓડિટ લોગ જોવા અથવા સિસ્ટમ ડેટા એક્સપોર્ટ કરવા જેવા એડમિન કાર્યો માટે એડમિનિસ્ટ્રેટર (Administrator) એક્સેસ જરૂરી છે. જો તમે સિસ્ટમ એડમિન છો, તો કૃપા કરીને એડમિન એકાઉન્ટ વડે સાઇન ઇન કરો.'
      : lang === 'hi'
      ? '⚠️ **प्रशासनिक सुरक्षा सूचना**: नए उपयोगकर्ता जोड़ना, ऑडिट लॉग देखना या सिस्टम डेटा निर्यात करना केवल एडमिन (Administrator) के लिए उपलब्ध है। यदि आप एडमिन हैं, तो कृपया एडमिन खाते से साइन इन करें।'
      : '⚠️ **Administrative Security Notice**: Accessing administrative controls (such as user management, audit logs, or system data export) requires Administrator privileges. If you are an admin, please sign in with your admin account.';

    return {
      text,
      intent: 'security',
      confidence: 1.0,
      entities: { plant: null, disease: null, space: null },
      quickActions: [{ label: lang === 'gu' ? 'સંપર્ક કરો' : lang === 'hi' ? 'संपर्क करें' : 'Contact Support', path: '/contact' }],
      followUpSuggestions: [
        lang === 'gu' ? 'મદદ જોઈતી હોય તો ક્યાં સંપર્ક કરવો?' : lang === 'hi' ? 'सहायता के लिए कहाँ संपर्क करें?' : 'How to contact support?'
      ],
      safetyNotice: null,
      source: 'fallback'
    };
  }

  const kbGroup = KNOWLEDGE_BASE[detected.intent] || KNOWLEDGE_BASE.general;
  const kbData = kbGroup[lang] || kbGroup.en;

  let text = kbData.steps;

  // If a specific plant was detected, prepend personalized context
  if (detected.extractedPlant) {
    if (lang === 'gu') {
      text = `તમારા **${detected.extractedPlant}** ના સંદર્ભમાં:\n\n` + text;
    } else if (lang === 'hi') {
      text = `आपके **${detected.extractedPlant}** के संदर्भ में:\n\n` + text;
    } else {
      text = `Regarding your **${detected.extractedPlant}**:\n\n` + text;
    }
  }

  // If safety intent, append critical warning
  let safetyNotice = null;
  if (detected.intent === 'safety' || detected.intent === 'pests') {
    safetyNotice = lang === 'gu'
      ? '⚠️ સાવચેતી: રાસાયણિક દવાઓનું મિશ્રણ ક્યારેય ન કરવું. હંમેશાં હાથમોજાં અને માસ્ક પહેરવા.'
      : lang === 'hi'
      ? '⚠️ सावधानी: रसायनों का अनियंत्रित मिश्रण कभी न करें। हमेशा दस्ताने और मास्क का प्रयोग करें।'
      : '⚠️ Safety Notice: Never combine unverified chemicals. Always wear protective gloves and a face mask.';
  }

  return {
    text: text.trim(),
    intent: detected.intent,
    confidence: detected.confidence,
    entities: {
      plant: detected.extractedPlant,
      symptom: detected.extractedSymptom
    },
    quickActions: detected.quickActions || [{ label: kbData.quickActionLabel, path: detected.route }],
    followUpSuggestions: kbData.followUps || [],
    safetyNotice,
    source: 'fallback'
  };
}

/**
 * Generate AI chatbot response using Gemini API with structured JSON output,
 * role-aware context & security guardrails, retry mechanism, and rich offline fallback.
 */
exports.generateChatbotResponse = async (userMessage, language = 'en', history = [], userContext = { role: 'guest', name: null }) => {
  const startTime = Date.now();
  const lang = ['gu', 'hi'].includes(language) ? language : 'en';
  const cleanMessage = String(userMessage || '').trim();
  const userRole = (userContext?.role || 'guest').toLowerCase();
  const userName = userContext?.name || null;

  // 1. Intent & Entity Detection from input + previous history
  const detected = detectIntent(cleanMessage, lang, history);
  const isSecurityQuery = detected.intent === 'security' || /(admin|add user|delete user|audit log|export csv|guest lead|system setting|user management)/i.test(cleanMessage);

  // 1b. Strict Domain Interception: Intercept off-topic questions immediately (Zero Tolerance)
  if (detected.intent === 'out_of_scope' && !isSecurityQuery) {
    const refusalResult = buildRichFallbackResponse(cleanMessage, lang, detected, userContext);
    logQuery({
      message: cleanMessage,
      language: lang,
      intent: 'out_of_scope',
      source: 'domain_guardrail',
      latencyMs: Date.now() - startTime
    });
    return refusalResult;
  }

  // 2. Check in-memory cache for repeated common questions (only for standard queries)
  if (!isSecurityQuery) {
    const cached = getCachedResponse(cleanMessage, lang, detected.extractedPlant);
    if (cached) {
      logQuery({
        message: cleanMessage,
        language: lang,
        intent: detected.intent,
        source: 'cache',
        latencyMs: Date.now() - startTime
      });
      return cached;
    }
  }

  const apiKey = aiConfig.gemini.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Gemini API key not found, using rich local knowledge base');
    const fallbackResult = buildRichFallbackResponse(cleanMessage, lang, detected, userContext);
    logQuery({
      message: cleanMessage,
      language: lang,
      intent: detected.intent,
      source: 'fallback',
      latencyMs: Date.now() - startTime
    });
    return fallbackResult;
  }

  // 3. Build Role-Aware System Instruction for Gemini
  let roleContextInstruction = '';
  if (userRole === 'admin') {
    roleContextInstruction = `
CURRENT USER ROLE: ADMIN (Platform Administrator ${userName ? '(' + userName + ')' : ''})
- The active user is an authenticated Platform Administrator.
- ACCESSIBLE ADMIN ROUTES: /admin/dashboard, /admin/users, /admin/gardens, /admin/moderation, /admin/leads, /admin/audit, /admin/settings, and standard app routes.
- GUIDANCE INSTRUCTIONS:
  1. You can fully assist with all administrative tasks: adding/editing users, viewing audit logs, exporting CSV/ZIP backups, moderating community posts, managing guest leads, checking API health.
  2. Provide step-by-step guidance for using Admin Panel sections (/admin/*).
  3. Include quickActions targeting /admin/* routes when relevant (e.g. /admin/users, /admin/settings, /admin/audit).`;
  } else if (userRole === 'user') {
    roleContextInstruction = `
CURRENT USER ROLE: USER (Registered Urban Farmer ${userName ? '(' + userName + ')' : ''})
- The active user is a logged-in standard user.
- ACCESSIBLE APPLICATION ROUTES: /app/dashboard, /app/gardens, /app/plants, /app/diagnosis, /app/watering, /app/crops, /app/community, /app/profile, /contact.
- GUIDANCE INSTRUCTIONS & SECURITY GUARDRAILS:
  1. Guide them on managing their balcony/terrace gardens, diagnosing plant diseases, scheduling watering, using Crop AI, and posting in the community.
  2. STRICT SECURITY GUARDRAIL: If this user asks how to perform Administrator functions (e.g., "how to delete another user", "how to export database audit logs", "how to change user roles", "how to view guest leads", "how to access admin panel"):
     - Inform them politely in target language (${lang}) that administrative functions are strictly restricted to Platform Administrators (/admin/*).
     - DO NOT provide step-by-step instructions as if they can access admin controls.
     - Direct them to contact support (/contact) if they need administrative assistance.`;
  } else {
    roleContextInstruction = `
CURRENT USER ROLE: GUEST (Unauthenticated Visitor)
- The active user is NOT logged in (Browsing as Guest).
- ACCESSIBLE ROUTES: Public pages (/contact, /login, /register, Home, About, Features).
- GUIDANCE INSTRUCTIONS & STRICT SECURITY GUARDRAILS:
  1. Answer general urban agriculture questions, explain platform features, and answer public FAQs.
  2. IF GUEST ASKS HOW TO USE PERSONAL FARM TOOLS (e.g., "how to add a plant to my garden", "how to track watering"): Explain the feature concept and inform them politely that saving gardens requires signing in or registering for an account. Suggest quickActions to /contact or registration.
  3. CRITICAL SECURITY GUARDRAIL (ADMIN QUESTIONS): If a GUEST asks how an admin adds a user, how to access admin settings, how to view audit logs, how to export backend logs, or how to moderate posts:
     - YOU MUST NOT provide step-by-step instructions for executing admin commands as if the guest has access!
     - Explain clearly and politely in target language (${lang}):
       a) "Performing administrative actions (such as managing users, viewing audit logs, or system settings) requires a registered Administrator account."
       b) "If you are an administrator, please Sign In with your admin credentials to access the Admin Panel."
       c) "If you are a visitor, you can Register for a farmer account to start tracking your urban gardens."
     - Offer quickAction options to Sign In or Register (/contact or public links).`;
  }

  let langPersona = 'Respond in warm, clear, professional English as a female agricultural guide.';
  let langRequirement = 'Language Requirement: Respond completely in English.';
  if (lang === 'gu') {
    langPersona = 'તમારે સંપૂર્ણ જવાબ ફક્ત શુદ્ધ, સરળ અને પ્રેમાળ ગુજરાતી લિપિમાં (Gujarati language & script) આપવાનો છે. તમે એક પ્રવીણ સ્ત્રી કૃષિ સહાયક (કૃષિ AI) છો, તેથી હંમેશાં સ્ત્રીવાચક વાક્યપ્રયોગ કરો (જેમ કે: "હું તમારી સહાયક છું", "હું મદદ કરી શકું છું"). કોઈપણ સંજોગોમાં અંગ્રેજી કે હિન્દીમાં જવાબ આપવો નહીં.';
    langRequirement = 'CRITICAL LANGUAGE DIRECTIVE: The user has selected GUJARATI (ગુજરાતી). You MUST generate all text fields ("reply", quickAction labels, followUpSuggestions, safetyNotice) STRICTLY in Gujarati (ગુજરાતી) script. Do NOT respond in English or Hindi.';
  } else if (lang === 'hi') {
    langPersona = 'आपको पूरा उत्तर केवल सरल, स्पष्ट और आदरणीय हिन्दी भाषा (Hindi language in Devanagari script) में देना है। आप एक महिला कृषि विशेषज्ञ (कृषि AI) हैं, इसलिए हमेशा स्त्रीलिंग क्रियाओं और सर्वनामों का ही उपयोग करें (जैसे: "मैं कर सकती हूँ", "मैं सहायता करूँगी", "सलाह देती हूँ", आदि। कभी भी पुल्लिंग जैसे "करऊंगा" या "सकता हूँ" न लिखें)। किसी भी परिस्थिति में अंग्रेजी या गुजराती में उत्तर न दें।';
    langRequirement = 'CRITICAL LANGUAGE DIRECTIVE: The user has selected HINDI (हिन्दी). You MUST generate all text fields ("reply", quickAction labels, followUpSuggestions, safetyNotice) STRICTLY in Hindi (Devanagari script). Do NOT respond in English or Gujarati.';
  }

  const systemInstructionText = `You are "Krishi AI" (કૃષિ AI / कृषि AI), an intelligent, caring female agricultural and urban farming expert for the UrbanFarm web application.

IDENTITY & FEMALE PERSONA:
- Your name is Krishi AI. You are a knowledgeable, friendly, and supportive female farming expert.
- In Hindi: Always strictly use feminine verb forms and self-references (e.g. "मैं आपकी सहायता करूँगी", "मैं कर सकती हूँ", "मैं एक AI कृषि सखी हूँ", NEVER "करूँगा" or "सकता हूँ").
- In Gujarati: Introduce yourself as "કૃષિ AI, તમારી કૃષિ સહાયક" with a warm, caring, polite feminine tone.
- In English: Introduce yourself as "Krishi AI", your intelligent AI farming guide.

${roleContextInstruction}

PLATFORM GROUNDING & ACTUAL FEATURES:
You represent the UrbanFarm platform. The real routes in the application are:
1. AI Plant Disease Diagnosis: /app/diagnosis
2. Smart Weather-Based Watering: /app/watering
3. My Gardens & Plant Tracker: /app/gardens
4. AI Crop Recommendation: /app/crops
5. Community Hub: /app/community
6. Contact & Support: /contact
7. Admin Tools (Admin Role Only): /admin/dashboard, /admin/users, /admin/gardens, /admin/moderation, /admin/leads, /admin/audit, /admin/settings.
NEVER invent non-existent features, fake payment checkouts, drone delivery, or in-person farm visits.

STRICT TOPIC SCOPE & DOMAIN RESTRICTION - ZERO TOLERANCE:
- You are Krishi AI, an AI assistant dedicated EXCLUSIVELY to farming, agricultural machinery & equipment, crop cultivation, gardening, plant care, plant disease diagnosis, smart irrigation, and UrbanFarm platform tools.
- ALLOWED DOMAINS ONLY:
  1. Agriculture & farming: crops, plants, soil, fertilizers, compost, pests, plant diseases, pruning, harvesting, sowing.
  2. Agricultural tools, equipment & machinery: tractors, tillers, rotavators, cultivators, ploughs, sprayers, knapsack sprayers, drip irrigation kits, sprinklers, water pumps, shears, secateurs, spades, hoes, soil moisture/pH meters, shade nets, grow bags.
  3. Platform features: plant disease diagnosis (/app/diagnosis), smart watering (/app/watering), garden management (/app/gardens), crops (/app/crops), community (/app/community), contact (/contact).
- STRICTLY FORBIDDEN OUT-OF-TOPIC QUESTIONS:
  Movies, cinema, sports (cricket, IPL, football, matches), entertainment, songs, politics, government elections, programming/coding (Python, JavaScript, etc.), math, general science, finance, crypto, human health/medicine, non-agricultural machinery, gaming, relationships, or general trivia.
- IF A USER ASKS ANY QUESTION OUTSIDE FARMING AND FARMING EQUIPMENT:
  1. ZERO TOLERANCE DIRECTIVE: DO NOT ANSWER THE QUESTION OR PROVIDE ANY FACTS, CODE, TRIVIA, OR OFF-TOPIC INFORMATION!
  2. Politely refuse in the target language (${lang}) using your caring female persona.
  3. State clearly that you are Krishi AI, dedicated exclusively to farming and farming equipment, and offer to assist them with their crops, garden, or farming tools.
  4. Return "intent": "out_of_scope" and provide quickActions pointing to /app/gardens and /app/diagnosis.

SAFETY GUARDRAILS:
1. Always prioritize organic and biological solutions (Neem oil spray, compost tea, companion planting, bio-fungicides) over synthetic chemicals.
2. STRICT WARNING: Never advise mixing different commercial pesticides or fertilizers together.
3. Recommend protective gloves, masks, and safe storage away from children/pets whenever garden sprays are mentioned.
4. For severe disease outbreaks or doubtful chemical applications, advise consulting a local agronomist.

RESPONSE FORMAT:
You MUST respond with a valid JSON object strictly matching this schema:
{
  "reply": "Formatted markdown text in the target language (${lang}) respecting the user's role (${userRole}) and language guidelines.",
  "intent": "diagnosis | watering | crops | gardens | community | weather | pests | fertilizer | equipment | safety | greeting | security | out_of_scope | unknown",
  "entities": {
    "plant": "identified plant name or null",
    "disease": "identified symptom/disease or null",
    "space": "balcony | terrace | windowsill | backyard | null"
  },
  "quickActions": [
    {
      "label": "Action button text in target language (${lang})",
      "path": "Valid route appropriate for the user's role (${userRole})"
    }
  ],
  "followUpSuggestions": [
    "Contextual follow-up question 1 in target language (${lang})",
    "Contextual follow-up question 2 in target language (${lang})"
  ],
  "safetyNotice": "Optional safety note in target language (${lang}) if chemicals/fertilizers discussed, else null"
}

${langPersona}
${langRequirement}`;

  // 4. Format conversation history for Gemini context continuity
  const geminiContents = [];

  // Add past conversation context (up to last 8 messages)
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-8).forEach((item) => {
      const text = item.text || item.content || '';
      if (!text) return;

      if (item.sender === 'user' || item.role === 'user') {
        geminiContents.push({ role: 'user', parts: [{ text }] });
      } else if (item.sender === 'bot' || item.role === 'model') {
        geminiContents.push({ role: 'model', parts: [{ text }] });
      }
    });
  }

  // Prepend explicit target language prompt to ensure output language is respected
  const userMessageWithLang = lang === 'gu'
    ? `[સૂચના: જવાબ ફક્ત ગુજરાતીમાં જ આપો / Output Language: Gujarati]\n${cleanMessage}`
    : lang === 'hi'
    ? `[निर्देश: उत्तर केवल हिन्दी में दें / Output Language: Hindi]\n${cleanMessage}`
    : cleanMessage;

  // Append active user query
  geminiContents.push({
    role: 'user',
    parts: [{ text: userMessageWithLang }]
  });

  // Candidate models in priority order
  const candidateModels = Array.from(new Set([
    aiConfig.gemini?.model,
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-pro-latest'
  ])).filter(Boolean);

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  // 5. Execute Gemini call with fallback across candidate models
  let rawResponseText = null;

  for (const modelCandidate of candidateModels) {
    if (rawResponseText) break;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 6000 // 6 second max per attempt
        });

        rawResponseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawResponseText) break;
      } catch (err) {
        const status = err.response?.status;
        console.warn(`[KrishiAI] Gemini (${modelCandidate}) attempt ${attempt} failed: ${status || err.message}`);
        // If 503 unavailable, 429 quota, 404 not found, or 400 bad payload, skip to next model immediately
        if (status === 503 || status === 429 || status === 404 || status === 400) {
          break;
        }
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 400));
        }
      }
    }
  }

  // 6. If Gemini succeeded, parse structured JSON response
  if (rawResponseText) {
    try {
      let cleaned = rawResponseText.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      }
      const parsed = JSON.parse(cleaned);

      if (parsed.reply && typeof parsed.reply === 'string') {
        // Validate quick action routes against platform whitelist
        const validActions = validateQuickActions(parsed.quickActions);

        // If Gemini omitted quick actions, supply verified ones based on intent
        const finalActions = validActions.length > 0
          ? validActions
          : detected.quickActions;

        const structuredResult = {
          text: parsed.reply.trim(),
          intent: parsed.intent || detected.intent,
          confidence: detected.confidence,
          entities: {
            plant: parsed.entities?.plant || detected.extractedPlant,
            disease: parsed.entities?.disease || detected.extractedSymptom,
            space: parsed.entities?.space || null
          },
          quickActions: finalActions,
          followUpSuggestions: Array.isArray(parsed.followUpSuggestions) && parsed.followUpSuggestions.length > 0
            ? parsed.followUpSuggestions.slice(0, 3)
            : detected.followUpSuggestions,
          safetyNotice: parsed.safetyNotice || null,
          source: 'gemini'
        };

        // Cache successful response
        setCachedResponse(cleanMessage, lang, detected.extractedPlant, structuredResult);

        logQuery({
          message: cleanMessage,
          language: lang,
          intent: structuredResult.intent,
          source: 'gemini',
          latencyMs: Date.now() - startTime
        });

        return structuredResult;
      }
    } catch (parseError) {
      console.warn('[KrishiAI] Gemini JSON parse failed, extracting clean text fallback:', parseError.message);
    }
  }

  // 7. Fallback to rich local knowledge base if Gemini failed
  console.warn('[KrishiAI] Gemini unavailable or invalid response, serving verified knowledge base fallback');
  const fallbackResult = buildRichFallbackResponse(cleanMessage, lang, detected, userContext);

  logQuery({
    message: cleanMessage,
    language: lang,
    intent: detected.intent,
    source: 'fallback',
    latencyMs: Date.now() - startTime
  });

  return fallbackResult;
};
