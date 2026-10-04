const axios = require('axios');
const aiConfig = require('../config/aiConfig');
const { VALID_PLATFORM_ROUTES, PLATFORM_ROUTES, KNOWLEDGE_BASE } = require('../data/chatbotKnowledge');
const { detectIntent, extractPlant, extractSymptom, validateQuickActions } = require('./chatbotIntentService');
const { getCachedResponse, setCachedResponse, logQuery } = require('./chatbotCacheService');

/**
 * Build rich rule-based fallback response from local verified knowledge base
 */
function buildRichFallbackResponse(message, lang, detected) {
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
 * context awareness, retry mechanism, and rich offline fallback.
 */
exports.generateChatbotResponse = async (userMessage, language = 'en', history = []) => {
  const startTime = Date.now();
  const lang = ['gu', 'hi'].includes(language) ? language : 'en';
  const cleanMessage = String(userMessage || '').trim();

  // 1. Intent & Entity Detection from input + previous history
  const detected = detectIntent(cleanMessage, lang, history);

  // 2. Check in-memory cache for repeated common questions
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

  const apiKey = aiConfig.gemini.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ Gemini API key not found, using rich local knowledge base');
    const fallbackResult = buildRichFallbackResponse(cleanMessage, lang, detected);
    logQuery({
      message: cleanMessage,
      language: lang,
      intent: detected.intent,
      source: 'fallback',
      latencyMs: Date.now() - startTime
    });
    return fallbackResult;
  }

  // 3. Build System Instruction for Gemini with strict language guarantee
  let langPersona = 'Respond in warm, clear, professional English as a female agricultural guide.';
  let langRequirement = 'Language Requirement: Respond completely in English.';
  if (lang === 'gu') {
    langPersona = 'તમારે સંપૂર્ણ જવાબ ફક્ત શુદ્ધ, સરળ અને પ્રેમાળ ગુજરાતી લિપિમાં (Gujarati language & script) આપવાનો છે. તમે એક પ્રવીણ સ્ત્રી કૃષિ સહાયક (કૃષિ AI) છો, તેથી હંમેશાં સ્ત્રીવાચક વાક્યપ્રયોગ કરો (જેમ કે: "હું તમારી સહાયક છું", "હું મદદ કરી શકું છું"). કોઈપણ સંજોગોમાં અંગ્રેજી કે હિન્દીમાં જવાબ આપવો નહીં.';
    langRequirement = 'CRITICAL LANGUAGE DIRECTIVE: The user has selected GUJARATI (ગુજરાતી). You MUST generate all text fields ("reply", quickAction labels, followUpSuggestions, safetyNotice) STRICTLY in Gujarati (ગુજરાતી) script. Do NOT respond in English or Hindi.';
  } else if (lang === 'hi') {
    langPersona = 'आपको पूरा उत्तर केवल सरल, स्पष्ट और आदरणीय हिन्दी भाषा (Hindi language in Devanagari script) में देना है। आप एक महिला कृषि विशेषज्ञ (कृषि AI) हैं, इसलिए हमेशा स्त्रीलिंग क्रियाओं और सर्वनामों का ही उपयोग करें (जैसे: "मैं कर सकती हूँ", "मैं सहायता करूँगी", "सलाह देती हूँ", आदि। कभी भी पुल्लिंग जैसे "करूंगा" या "सकता हूँ" न लिखें)। किसी भी परिस्थिति में अंग्रेजी या गुजराती में उत्तर न दें।';
    langRequirement = 'CRITICAL LANGUAGE DIRECTIVE: The user has selected HINDI (हिन्दी). You MUST generate all text fields ("reply", quickAction labels, followUpSuggestions, safetyNotice) STRICTLY in Hindi (Devanagari script). Do NOT respond in English or Gujarati.';
  }

  const systemInstructionText = `You are "Krishi AI" (કૃષિ AI / कृषि AI), an intelligent, caring female agricultural and urban farming expert for the UrbanFarm web application.

IDENTITY & FEMALE PERSONA:
- Your name is Krishi AI. You are a knowledgeable, friendly, and supportive female farming expert.
- In Hindi: Always strictly use feminine verb forms and self-references (e.g. "मैं आपकी सहायता करूँगी", "मैं कर सकती हूँ", "मैं एक AI कृषि सखी हूँ", NEVER "करूँगा" or "सकता हूँ").
- In Gujarati: Introduce yourself as "કૃષિ AI, તમારી કૃષિ સહાયક" with a warm, caring, polite feminine tone.
- In English: Introduce yourself as "Krishi AI", your intelligent AI farming guide.

PLATFORM GROUNDING & ACTUAL FEATURES:
You represent the UrbanFarm platform. The ONLY real routes in the application are:
1. AI Plant Disease Diagnosis: /app/diagnosis (Users upload photos of sick leaves to detect diseases, confidence score, and get organic cures)
2. Smart Weather-Based Watering: /app/watering (Calculates 7-day irrigation schedule linked to local weather)
3. My Gardens & Plant Tracker: /app/gardens (Add balcony/terrace gardens and track individual plants)
4. AI Crop Recommendation: /app/crops (Suggests high-yield urban crops based on season, soil, and space)
5. Community Hub: /app/community (Share harvest photos, discuss with urban farmers, exchange gardening tips)
6. Contact & Support: /contact (Get in touch with the platform agronomist team)
NEVER invent non-existent features, fake payment checkouts, drone delivery, or in-person farm visits.

SAFETY GUARDRAILS:
1. Always prioritize organic and biological solutions (Neem oil spray, compost tea, companion planting, bio-fungicides) over synthetic chemicals.
2. STRICT WARNING: Never advise mixing different commercial pesticides or fertilizers together.
3. Recommend protective gloves, masks, and safe storage away from children/pets whenever garden sprays are mentioned.
4. For severe disease outbreaks or doubtful chemical applications, advise consulting a local agronomist.

RESPONSE FORMAT:
You MUST respond with a valid JSON object strictly matching this schema:
{
  "reply": "Formatted markdown text in the target language (${lang}) with friendly feminine tone, concise bullet points or steps.",
  "intent": "diagnosis | watering | crops | gardens | community | weather | pests | fertilizer | safety | greeting | unknown",
  "entities": {
    "plant": "identified plant name or null",
    "disease": "identified symptom/disease or null",
    "space": "balcony | terrace | windowsill | backyard | null"
  },
  "quickActions": [
    {
      "label": "Action button text in target language (${lang})",
      "path": "Must be one of /app/diagnosis, /app/watering, /app/gardens, /app/crops, /app/community, /contact"
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

  // Candidate models in priority order: configured model, gemini-3.6-flash, gemini-3.8-flash, gemini-flash-latest
  const candidateModels = Array.from(new Set([
    aiConfig.gemini?.model,
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ])).filter(Boolean);

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstructionText }]
    },
    contents: geminiContents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2500,
      response_mime_type: 'application/json'
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
          timeout: 10000 // 10 second timeout
        });

        rawResponseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawResponseText) break;
      } catch (err) {
        console.warn(`[KrishiAI] Gemini (${modelCandidate}) attempt ${attempt} failed: ${err.response?.status || err.message}`);
        // If 429 quota or 404, don't waste 2nd retry on same model; break to try next candidate model immediately
        if (err.response?.status === 429 || err.response?.status === 404) {
          break;
        }
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 800));
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
  const fallbackResult = buildRichFallbackResponse(cleanMessage, lang, detected);

  logQuery({
    message: cleanMessage,
    language: lang,
    intent: detected.intent,
    source: 'fallback',
    latencyMs: Date.now() - startTime
  });

  return fallbackResult;
};
