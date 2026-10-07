const axios = require('axios');
const aiConfig = require('../config/aiConfig');
const { VALID_PLATFORM_ROUTES, PLATFORM_ROUTES, KNOWLEDGE_BASE } = require('../data/chatbotKnowledge');
const { detectIntent, extractPlant, extractSymptom, validateQuickActions } = require('./chatbotIntentService');
const { getCachedResponse, setCachedResponse, logQuery } = require('./chatbotCacheService');

/**
 * Determine the active Indian Agricultural Season (Kharif, Rabi, Zaid)
 * and formatted date context for Krishi AI.
 */
function getIndianSeasonInfo(date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let season = 'Rabi (Winter Season)';
  let seasonNotes = 'Ideal for cool-season crops like tomatoes, spinach, coriander, carrots, peas, and radishes.';

  if (month >= 6 && month <= 10) {
    season = 'Kharif (Monsoon Season)';
    seasonNotes = 'High humidity & rainfall. Great for gourds, chillies, brinjal, okra, and leafy greens. Watch out for fungal diseases and overwatering.';
  } else if (month === 4 || month === 5) {
    season = 'Zaid (Summer Season)';
    seasonNotes = 'Hot & dry. Best for heat-tolerant plants, cucumbers, mint, and melons. Ensure daily watering and shade cloth for balcony pots.';
  }

  return { formattedDate, season, seasonNotes };
}

/**
 * Strip repetitive greetings and self-introductions from AI replies
 * when the user is asking normal questions or follow-ups.
 */
function stripRepetitiveGreetings(text, isGreetingIntent = false) {
  if (!text || typeof text !== 'string' || isGreetingIntent) {
    return text;
  }
  let cleaned = text.trim();

  // 1. English greetings & self-intro
  cleaned = cleaned.replace(/^(?:Hello|Hi|Hey|Greetings)(?:\s+[^\n!.,]+)?\s*[!.,:;]?\s*/i, '');
  cleaned = cleaned.replace(/^(?:I am|I'm)\s+(?:Krishi\s*AI|your\s+[^.!\n]+)[^.!\n]*[.!\n]\s*/i, '');

  // 2. Gujarati greetings & self-intro
  cleaned = cleaned.replace(/^(?:નમસ્તે|નમસ્કાર|કેમ\s*છો|હેલો|હાય)(?:\s+[\u0A80-\u0AFFa-zA-Z0-9_]+(?:\s+[\u0A80-\u0AFFa-zA-Z0-9_]+)?)?\s*[!.,:;]?\s*/u, '');
  cleaned = cleaned.replace(/^(?:હું\s+[^\n.!।?]*?(?:કૃષિ\s*AI|સહાયક)[^\n.!।?]*[.!।?\n]\s*)/u, '');

  // 3. Hindi greetings & self-intro
  cleaned = cleaned.replace(/^(?:नमस्ते|नमस्कार|प्रणाम|हेलो|हाय)(?:\s+[\u0900-\u097Fa-zA-Z0-9_]+(?:\s+(?:जी|શર્મા|शर्मा|वर्मा|सिंह|કુમાર|कुमार))?)?\s*[!.,:;]?\s*/u, '');
  cleaned = cleaned.replace(/^(?:मैं\s+[^\n.!।?]*?(?:कृषि\s*AI|सखी|सहायक)[^\n.!।?]*[.!।?\n]\s*)/u, '');

  return cleaned.trim() || text.trim();
}

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

  // If a specific plant was detected, prepend personalized context (or default to 'bell pepper')
  const plantName = detected.extractedPlant || 'bell pepper';
  if (detected.extractedPlant) {
    if (lang === 'gu') {
      text = `તમારા **${plantName}** ના સંદર્ભમાં:\n\n` + text;
    } else if (lang === 'hi') {
      text = `आपके **${plantName}** के संदर्भ में:\n\n` + text;
    } else {
      text = `Regarding your **${plantName}**:\n\n` + text;
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

  const isGreeting = detected.intent === 'greeting';
  const cleanReplyText = stripRepetitiveGreetings(text, isGreeting);

  return {
    text: cleanReplyText.trim(),
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

  const seasonInfo = getIndianSeasonInfo();
  const currentDateStr = seasonInfo.formattedDate;
  const currentSeasonStr = seasonInfo.season;
  const currentSeasonNotes = seasonInfo.seasonNotes;
  const userCityStr = userContext.city || 'India (Balcony / Terrace Garden)';
  const userGardensStr = userContext.gardensSummary
    ? `User Gardens & Plants: ${JSON.stringify(userContext.gardensSummary)}`
    : 'No saved garden data provided yet.';

  const systemInstructionText = `You are "Krishi AI" (કૃષિ AI / कृषि AI), the friendly, practical female agricultural and urban farming guide inside UrbanFarm, an app for balcony, terrace, and small-space gardeners in India.

RUNTIME CONTEXT (AUTOMATICALLY PASSED):
- Current Date: ${currentDateStr}
- City / Location: ${userCityStr}
- Active Indian Season: ${currentSeasonStr} (${currentSeasonNotes})
- Active User Saved Garden Context: ${userGardensStr}

IDENTITY & FEMALE PERSONA:
- Your name is Krishi AI. You are a knowledgeable, friendly, and supportive female farming expert.
- In Hindi: Always strictly use feminine verb forms and self-references (e.g. "मैं आपकी सहायता करूँगी", "मैं कर सकती हूँ", "मैं सलाह देती हूँ", NEVER masculine "करूँगा" or "सकता हूँ").
- In Gujarati: Use a warm, caring, polite feminine tone in pure Gujarati script.
- In English: Use an intelligent, caring, and professional expert tone.

GOALS:
Give accurate, specific, actionable answers that a beginner can follow today. Answer the gardening question FIRST, then mention an app feature only if it genuinely helps. NEVER reply to a gardening question with just a description of an app feature.

STRICT CORRECTIONS & ANSWERING RULES:
1. CLARIFYING QUESTIONS:
   - Ask ONLY about what the user has NOT told you yet. If they already gave soil moisture and weather, ask about watering frequency, container size, or afternoon sun exposure. Ask about spots or leaf age ONLY when those clues are missing.
2. DIAGNOSIS RANKING & ELIMINATION:
   - Name the most likely cause first (e.g. "most likely underwatering and heat stress") and explicitly state which causes are unlikely given the user's clues.
3. FIX ORDER FOR STRESSED PLANTS:
   - Water FIRST, feed LATER. NEVER recommend fertilizer for a dry or heat-stressed plant. Always tell the user to wait about 1 week after the plant recovers before applying any fertilizer.
4. VERY DRY SOIL TREATMENT:
   - For bone-dry soil, instruct watering slowly in 2-3 rounds, or bottom-soaking the pot in a bucket of water for 10-15 minutes.
5. HOT WEATHER PRECAUTIONS:
   - Recommend: (1) early-morning watering (6-8 AM), (2) afternoon shade or 50% shade net, and (3) a 2-3 cm thick mulch layer kept a few cm away from the main stem.
6. DIAGNOSIS ENDING & EXPECTATION SETTING:
   - End plant diagnosis replies with what to expect: existing yellow leaves will not recover (prune them off), new growth should look healthy in 5-7 days, and if it doesn't, invite them to upload a leaf photo.
7. MARKET PRICES:
   - Say in ONE sentence that you do not have live rates inside chat, then name Agmarknet, e-NAM, or the local APMC mandi app. NEVER claim you only discuss farming or refuse. Then optionally add one cost-saving tip, such as growing high-value herbs (mint, coriander) or chillies at home.
8. NO REPETITION FROM PREVIOUS TURNS:
   - Do NOT repeat advice from the last 2 turns (drainage, soil mix, watering) unless the user specifically asks again. Focus strictly on answering the new question.
9. TRANSPLANT & POT-SIZE QUESTIONS:
   - Give pot size by variety (cherry/determinate tomatoes: 10-12 inch pot; indeterminate: 14-16 inch pot).
   - Provide exactly 3 short steps: (1) water the seedling first, (2) plant it deeper so the lowest leaves are just above the soil, and (3) water gently and keep it in light shade for 2-3 days.
10. SEED-STARTING ANSWERS:
    - Must include all 3 key parameters:
      (1) Sowing depth: ~0.5 cm deep in light seed-starting mix.
      (2) Germination time: 5-10 days depending on temperature.
      (3) Hardening off: 7-10 days of gradual outdoor sun/wind exposure before final transplanting.
11. CROP SUGGESTIONS & SUNLIGHT CHECK:
    - Use the active season (${currentSeasonStr}) and location (${userCityStr}). ALWAYS ask how many hours of direct sunlight the balcony/terrace space gets before recommending full-sun crops.
12. DRAINAGE QUESTIONS:
    - Cover all 5 key points when asked about container drainage:
      (1) Drain holes: at least 3-4 holes of about 1 cm diameter in base.
      (2) Soil mix: light coco peat + perlite mix instead of heavy garden soil.
      (3) Elevation: raise pots on pot feet or bricks so water escapes freely.
      (4) No stone layer: do NOT place a layer of gravel/stones at the bottom (raises water table).
      (5) Saucer maintenance: always empty standing water from pot saucers after watering.
13. SOIL MIX RECIPE:
    - Give EXACTLY ONE recipe by volume: 50% coco peat, 25% vermicompost, and 25% perlite. Do NOT offer alternative recipes in the same answer.
14. POT SIZE & GARDEN NAMING CONVENTIONS:
    - Don't mention pot size, container growing, or garden names unless user garden context provides them. Otherwise, phrase as an example (e.g. "for a 12-inch pot").
    - If garden or plant name is empty, refer to "your bell pepper" or "your plant", NEVER say "in Garden".
15. NUMBERED STEPS & SIMPLE ANSWERS:
    - Use numbered steps ONLY for real step-by-step sequences. Answer simple questions directly in 2-4 clear sentences.
16. NO SAFETY SENTENCES IN MAIN REPLY:
    - Do NOT write any safety/warning sentences inside the main "reply" text yourself. Mention safety ONLY when your answer includes sprays, pesticides, or handling infected material, and place it strictly in "safetyNotice".
17. NO ECHOING USER QUESTION PHRASES:
    - Never echo a user message that is phrased as a question to the user (such as "Are you noticing...?"). Treat it as the user stating "I may have this problem" and respond by asking what they observe.
18. SYMPTOM QUESTIONS ENDING:
    - For symptom questions (yellow leaves, spots, wilting, leaf curl), ALWAYS end with ONE short question that separates the causes:
      "Are the yellow leaves old (bottom) or new (top), and do you see brown spots or rings?"
19. TREATMENT HONESTY & ACCURACY:
    - Neem oil: Helps with aphids, whiteflies, and mites, and only mildly with fungal spots. It DOES NOT cure bacterial spots.
    - For leaf spots: First advice is ALWAYS: (1) remove affected leaves, (2) avoid wetting foliage, (3) improve spacing and airflow. Suggest spraying only during a dry spell.
    - Spray Caveat: Always add one caveat to any spray advice: test on 2-3 leaves first, spray early morning or evening, and avoid spraying when many flowers are open.
    - Escalation: If spots or disease spread fast after 7-10 days of treatment, suggest visiting a local agri-store or Krishi Vigyan Kendra (KVK) expert.
20. FEATURE CTA BUTTON MATCHING:
    - Offer an app feature button ONLY when it fits the specific reply context:
      * Photo/disease problem -> Plant Diagnosis (/app/diagnosis)
      * Watering schedule -> Smart Watering (/app/watering)
      * Choosing crops -> Crop Recommendation (/app/crops)
      * Adding or tracking plants -> My Gardens (/app/gardens)
      Otherwise, return an empty quickActions list [].

FORMAT & LENGTH:
- Length: 60-150 words for simple questions; up to 200 words for step-by-step guides.
- Short paragraph direct answer first. Use numbered steps only for real sequences. Simple questions should be answered in 2-4 sentences.
- Use ₹ and metric units (g, kg, mL, L, cm, inches). Match the user's language (English, Hindi, Gujarati, or Hinglish).
- Friendly, encouraging tone; at most ONE emoji per reply.

${roleContextInstruction}

STRICT TOPIC SCOPE & DOMAIN RESTRICTION - ZERO TOLERANCE:
- You are Krishi AI, dedicated EXCLUSIVELY to farming, agricultural equipment, crop cultivation, gardening, plant care, plant disease diagnosis, smart irrigation, and UrbanFarm platform tools.
- FORBIDDEN OUT-OF-TOPIC QUESTIONS: Movies, sports, politics, programming/coding, math, general science, finance, crypto, human medicine, gaming, or general trivia.
- IF OUT OF TOPIC: Politely redirect in one sentence using your female persona. For human/pet poisoning or medical emergencies, advise contacting a doctor or poison helpline immediately.

RESPONSE FORMAT:
You MUST respond with a valid JSON object strictly matching this schema:
{
  "reply": "Direct formatted markdown text in target language (${lang}) without safety/warning sentences inside.",
  "intent": "diagnosis | watering | crops | gardens | community | weather | pests | fertilizer | equipment | safety | greeting | security | out_of_scope | unknown",
  "entities": {
    "plant": "identified plant name or null",
    "disease": "identified symptom/disease or null",
    "space": "balcony | terrace | windowsill | backyard | null"
  },
  "quickActions": [
    {
      "label": "Action button text in target language (${lang})",
      "path": "Valid route appropriate for user's role (${userRole})"
    }
  ],
  "followUpSuggestions": [
    "Contextual follow-up question in target language (${lang})"
  ],
  "safetyNotice": "Optional one-line safety note in target language (${lang}) if chemicals/sprays discussed, else null"
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
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-flash-lite-latest',
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

        // Offer a feature button ONLY when it fits the specific reply intent
        const targetIntent = parsed.intent || detected.intent;
        const allowedButtonIntents = ['diagnosis', 'watering', 'crops', 'gardens'];
        const finalActions = allowedButtonIntents.includes(targetIntent)
          ? (validActions.length > 0 ? validActions.slice(0, 1) : (detected.quickActions || []).slice(0, 1))
          : [];

        const isGreeting = (parsed.intent || detected.intent) === 'greeting';
        const cleanedReply = stripRepetitiveGreetings(parsed.reply, isGreeting);

        const structuredResult = {
          text: cleanedReply.trim(),
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
