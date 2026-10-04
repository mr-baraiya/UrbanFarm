/**
 * Intent Detection & Context Understanding Service for Krishi AI
 * Multi-lingual N-Gram scoring, entity extraction, and follow-up context resolution.
 */

const { VALID_PLATFORM_ROUTES, PLATFORM_ROUTES, KNOWLEDGE_BASE } = require('../data/chatbotKnowledge');

// Common agricultural plant dictionaries
const COMMON_PLANTS = [
  { name: 'Tomato', aliases: ['tomato', 'tomatoes', 'ટામેટાં', 'ટામેટા', 'ટમેટા', 'टमाटर'] },
  { name: 'Chilli', aliases: ['chilli', 'chili', 'peppers', 'મરચાં', 'મરચી', 'મરચા', 'मिर्च', 'मिर्ची'] },
  { name: 'Tulsi', aliases: ['tulsi', 'basil', 'તુલસી', 'तुलसी'] },
  { name: 'Rose', aliases: ['rose', 'roses', 'ગુલાબ', 'गुलाब'] },
  { name: 'Spinach', aliases: ['spinach', 'palak', 'પાલક', 'पालक'] },
  { name: 'Coriander', aliases: ['coriander', 'cilantro', 'ધાણા', 'કોથમીર', 'धनिया'] },
  { name: 'Mint', aliases: ['mint', 'pudina', 'ફુદીનો', 'પુદીના', 'पुदीना'] },
  { name: 'Brinjal', aliases: ['brinjal', 'eggplant', 'aubergine', 'રીંગણા', 'રીંગણ', 'બેંગન', 'बैंगन'] },
  { name: 'Lemon', aliases: ['lemon', 'lime', 'લીંબુ', 'લીંબુડી', 'नींबू'] },
  { name: 'Aloe Vera', aliases: ['aloe', 'aloe vera', 'કુવારપાઠું', 'एलोवेरा', 'घृतकुमारी'] },
  { name: 'Methi', aliases: ['methi', 'fenugreek', 'મેથી', 'मेथी'] },
  { name: 'Cucumber', aliases: ['cucumber', 'કાકડી', 'खीरा'] },
  { name: 'Curry Leaves', aliases: ['curry leaves', 'kadi patta', 'મીઠો લીમડો', 'કઢી પત્તા', 'कढ़ी पत्ता'] },
];

// Common plant symptoms and conditions
const SYMPTOMS = [
  { symptom: 'yellow_leaves', patterns: ['yellow', 'yellowing', 'પીળા', 'પીળાશ', 'પીળા પાન', 'पीले', 'पीली', 'पीलापन'] },
  { symptom: 'leaf_curl', patterns: ['curl', 'curling', 'વળેલા', 'ગોળ વળેલા', 'કુકડાવ', 'मुड़ना', 'सिकुड़न', 'मरोड़'] },
  { symptom: 'leaf_spots', patterns: ['spots', 'black spots', 'brown spots', 'ડાઘા', 'કાળા ડાઘ', 'ધાબા', 'धब्बे', 'काले धब्बे'] },
  { symptom: 'wilting', patterns: ['wilt', 'wilting', 'drooping', 'કરમાય', 'ચીમળાઈ', 'સુકાઈ', 'मुरझाना', 'सूखना'] },
  { symptom: 'powdery_mildew', patterns: ['white powder', 'powder', 'mildew', 'સફેદ પાવડર', 'સફેદ છારી', 'सफेद पाउडर', 'फफूंद'] },
  { symptom: 'leaf_holes', patterns: ['holes', 'chewed', 'કાણાં', 'કાણા', 'છિદ્ર', 'छेद', 'पत्ते कटे'] }
];

// Contextual follow-up markers
const FOLLOW_UP_PATTERNS = [
  'next', 'what next', 'what should i do next', 'how to fix', 'how to treat',
  'how much', 'is it safe', 'can i use', 'after this', 'then',
  'પછી શું', 'ત્યારબાદ', 'હવે શું કરવું', 'કેવી રીતે મટાડવું', 'કેટલું આપવું',
  'इसके बाद', 'आगे क्या करें', 'अब क्या करना होगा', 'कैसे ठीक करें', 'कितना देना है'
];

/**
 * Extract plant entities from message
 */
function extractPlant(text) {
  const lower = (text || '').toLowerCase();
  for (const plant of COMMON_PLANTS) {
    if (plant.aliases.some(alias => lower.includes(alias))) {
      return plant.name;
    }
  }
  return null;
}

/**
 * Extract symptom entities from message
 */
function extractSymptom(text) {
  const lower = (text || '').toLowerCase();
  for (const item of SYMPTOMS) {
    if (item.patterns.some(pat => lower.includes(pat))) {
      return item.symptom;
    }
  }
  return null;
}

/**
 * Detect primary intent with multi-lingual pattern scoring
 */
function detectIntent(text, language = 'en', history = []) {
  const lower = (text || '').toLowerCase().trim();
  const lang = ['gu', 'hi'].includes(language) ? language : 'en';

  // Check for greetings first
  const greetingPatterns = [
    'hello', 'hi', 'hey', 'namaste', 'kem cho', 'good morning', 'good evening',
    'નમસ્તે', 'કેમ છો', 'નમસ્કાર', 'હેલો', 'હાય',
    'नमस्ते', 'प्रणाम', 'नमस्कार', 'हेलो', 'हाय'
  ];
  if (greetingPatterns.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return {
      intent: 'greeting',
      confidence: 0.95,
      route: PLATFORM_ROUTES.diagnosis,
      quickActions: [
        { label: lang === 'gu' ? 'રોગ નિદાન' : lang === 'hi' ? 'रोग निदान' : 'AI Plant Diagnosis', path: PLATFORM_ROUTES.diagnosis },
        { label: lang === 'gu' ? 'સ્માર્ટ વોટરિંગ' : lang === 'hi' ? 'स्मार्ट सिंचाई' : 'Smart Watering', path: PLATFORM_ROUTES.watering },
        { label: lang === 'gu' ? 'મારા બગીચાઓ' : lang === 'hi' ? 'मेरे बगीचे' : 'My Gardens', path: PLATFORM_ROUTES.gardens }
      ]
    };
  }

  // Check if this is a follow-up to a previous topic
  const isFollowUp = FOLLOW_UP_PATTERNS.some(fp => lower.includes(fp));
  let contextIntent = null;
  let contextPlant = null;

  if (Array.isArray(history) && history.length > 0) {
    // Scan recent messages backwards for context
    for (let i = history.length - 1; i >= 0; i--) {
      const pastText = (history[i].text || history[i].content || '').toLowerCase();
      if (!contextPlant) {
        contextPlant = extractPlant(pastText);
      }
      if (!contextIntent) {
        if (pastText.includes('diagnos') || pastText.includes('disease') || pastText.includes('રોગ') || pastText.includes('रोग')) {
          contextIntent = 'diagnosis';
        } else if (pastText.includes('water') || pastText.includes('પાણી') || pastText.includes('पानी')) {
          contextIntent = 'watering';
        } else if (pastText.includes('crop') || pastText.includes('પાક') || pastText.includes('फसल')) {
          contextIntent = 'crops';
        } else if (pastText.includes('pest') || pastText.includes('neem') || pastText.includes('જીવાત') || pastText.includes('कीट')) {
          contextIntent = 'pests';
        }
      }
      if (contextIntent && contextPlant) break;
    }
  }

  // Scoring matrix for various domains
  const scores = {
    diagnosis: 0,
    watering: 0,
    gardens: 0,
    crops: 0,
    community: 0,
    weather: 0,
    pests: 0,
    fertilizers: 0,
    safety: 0
  };

  // 1. Disease & Diagnosis keywords
  if (lower.match(/(diagnos|disease|sick|fungus|blight|rot|spot|leaf\s*check|રોગ|નિદાન|બીમારી|બગડી|સડો|रोग|निदान|बीमार|पत्ता\s*खराब|सड़न)/i)) {
    scores.diagnosis += 5;
  }
  if (extractSymptom(lower)) {
    scores.diagnosis += 3;
  }

  // 2. Watering & Irrigation
  if (lower.match(/(water|watering|irrigation|schedule|moisture|dry\s*soil|પાણી|સિંચાઈ|ભેજ|સુકાઈ|पानी|सिंचाई|नमी|सूखी\s*मिट्टी)/i)) {
    scores.watering += 5;
  }

  // 3. Gardens & Containers
  if (lower.match(/(garden|my\s*garden|add\s*plant|pot|container|balcony|terrace|raised\s*bed|બગીચો|કુંડુ|ધાબું|બાલ્કની|बगीचा|गमला|छत|बालकनी|पौधा\s*लगाना)/i)) {
    scores.gardens += 4;
  }

  // 4. Crops & Seasonal Recommendations
  if (lower.match(/(crop|recommend|season|summer|winter|monsoon|grow|vegetable|harvest|પાક|ઋતુ|શાકભાજી|વાવણી|લણણી|ફસલ|फसल|मौसम|सब्जी|बुवाई|कटाई)/i)) {
    scores.crops += 4;
  }

  // 5. Community & Sharing
  if (lower.match(/(communit|forum|post|share\s*harvest|discussion|like|comment|કમ્યુનિટી|પોસ્ટ|શેર|ચર્ચા|कम्युनिटी|पोस्ट|शेयर|चर्चा)/i)) {
    scores.community += 5;
  }

  // 6. Weather
  if (lower.match(/(weather|temperature|forecast|rain|heat|humidity|sunlight|હવામાન|વરસાદ|તાપમાન|ગરમી|તડકો|मौसम|तापमान|बारिश|वर्षा|धूप|गर्मी)/i)) {
    scores.weather += 4;
    scores.watering += 2; // Weather strongly links to watering
  }

  // 7. Pests & Bugs
  if (lower.match(/(pest|bug|insect|aphid|mealybug|mite|caterpillar|worm|neem|spray|જીવાત|ઈયળ|માખી|કીડા|લીમડો|કીट|माहू|मिलीबग|कीड़ा|इल्ली|नीम)/i)) {
    scores.pests += 5;
  }

  // 8. Fertilizers & Soil Nutrition
  if (lower.match(/(fertiliz|compost|nutrient|vermicompost|manure|npk|epsom|banana\s*peel|soil\s*food|ખાતર|અળસિયા|પોષક|છાણીયું|खाद|उर्वरक|केंचुआ|गोबर|पोषण)/i)) {
    scores.fertilizers += 5;
  }

  // 9. Safety & Chemical Warnings
  if (lower.match(/(chemical|poison|toxic|safe|harmful|danger|mix\s*pesticide|ઝેર|કેમિકલ|નુકસાન|સુરક્ષા|દવા|रसायन|जहर|विषाक्त|खतरा|सुरक्षा|कीटनाशक)/i)) {
    scores.safety += 5;
  }

  // If follow-up question and scores are low, inherit context
  if (isFollowUp && contextIntent && Math.max(...Object.values(scores)) < 3) {
    scores[contextIntent] = (scores[contextIntent] || 0) + 4;
  }

  // Find top scoring intent
  let topIntent = 'general';
  let maxScore = 0;
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topIntent = intent;
    }
  }

  if (maxScore < 2) {
    // If user text is completely outside agriculture and UrbanFarm
    if (lower.match(/(movie|cricket|song|football|politics|bitcoin|crypto|fashion|car|finance)/i)) {
      return {
        intent: 'unknown',
        confidence: 0.9,
        route: PLATFORM_ROUTES.diagnosis,
        quickActions: [
          { label: lang === 'gu' ? 'કૃષિ સેવાઓ' : lang === 'hi' ? 'कृषि सेवाएं' : 'Farming Services', path: PLATFORM_ROUTES.diagnosis }
        ]
      };
    }
    topIntent = 'general';
  }

  // Map intent to route and quick actions
  const routeMap = {
    diagnosis: PLATFORM_ROUTES.diagnosis,
    watering: PLATFORM_ROUTES.watering,
    gardens: PLATFORM_ROUTES.gardens,
    crops: PLATFORM_ROUTES.crops,
    community: PLATFORM_ROUTES.community,
    weather: PLATFORM_ROUTES.watering,
    pests: PLATFORM_ROUTES.diagnosis,
    fertilizers: PLATFORM_ROUTES.gardens,
    safety: PLATFORM_ROUTES.contact,
    general: PLATFORM_ROUTES.diagnosis
  };

  const primaryRoute = routeMap[topIntent] || PLATFORM_ROUTES.diagnosis;
  const kbData = KNOWLEDGE_BASE[topIntent] ? KNOWLEDGE_BASE[topIntent][lang] : KNOWLEDGE_BASE.general[lang];

  return {
    intent: topIntent,
    confidence: Math.min(1.0, 0.5 + maxScore * 0.1),
    route: primaryRoute,
    extractedPlant: extractPlant(lower) || contextPlant,
    extractedSymptom: extractSymptom(lower),
    quickActions: [
      {
        label: kbData.quickActionLabel || (lang === 'gu' ? 'ખોલો' : lang === 'hi' ? 'खोलें' : 'Open Feature'),
        path: primaryRoute
      }
    ],
    followUpSuggestions: kbData.followUps || []
  };
}

/**
 * Validate that an array of quick actions contains only valid platform routes
 */
function validateQuickActions(actions) {
  if (!Array.isArray(actions)) return [];
  return actions
    .filter(act => act && typeof act.path === 'string' && VALID_PLATFORM_ROUTES.includes(act.path.trim()))
    .map(act => ({
      label: String(act.label || 'View Feature').trim(),
      path: act.path.trim()
    }))
    .slice(0, 3);
}

module.exports = {
  detectIntent,
  extractPlant,
  extractSymptom,
  validateQuickActions,
  COMMON_PLANTS,
  VALID_PLATFORM_ROUTES,
};
