/**
 * Intent Detection & Context Understanding Service for Krishi AI
 * Multi-lingual N-Gram scoring, entity extraction, follow-up context resolution,
 * and strict agricultural domain boundaries.
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
 * Check if a query belongs to farming, agriculture, crop cultivation,
 * gardening, agricultural tools & machinery, or UrbanFarm platform features.
 */
function isFarmingOrEquipmentQuery(text) {
  const lower = (text || '').toLowerCase().trim();
  if (!lower) return false;

  // 1. Direct plant or symptom match
  if (extractPlant(lower) || extractSymptom(lower)) return true;

  // 2. Comprehensive Agricultural & Farming Equipment vocabulary (EN, GU, HI)
  const AGRI_EQUIPMENT_REGEX = /(farm|farmer|farming|plant|crop|grow|seed|seedling|soil|fertiliz|compost|manure|pest|insect|aphid|disease|leaf|leaves|root|stem|flower|fruit|vegetable|harvest|sow|sowing|yield|garden|gardening|terrace|balcony|irrigation|water|watering|drip|sprayer|knapsack|tractor|tiller|rotavator|cultivator|plough|plow|prun|shear|secateur|khurpi|spade|shovel|rake|hoe|dibber|pot|potting|coco\s*peat|vermicompost|fungus|blight|mildew|weather|rain|sunlight|shade\s*net|grow\s*bag|hydroponic|organic|agri|agriculture|agronomist|pesticide|herbicide|fungicide|bio-fertilizer|trellis|polyhouse|greenhouse|mulch|mulching|lopper|mower|weeder|thresher|harvester|borewell|sprinkler|pipe|hose|nozzle|pump|ph\s*meter|moisture\s*meter|seed\s*drill|seedling\s*tray|ખેત|ખેતી|ખેડૂત|પાક|છોડ|બીજ|વાવણી|લણણી|જમીન|માટી|ખાતર|જીવાત|રોગ|પાન|પાંદડા|ડાળી|ફળ|શાકભાજી|બગીચો|ધાબું|બાલ્કની|કુંડુ|સિંચાઈ|ટપક|ટ્રેક્ટર|ઓજાર|સાધન|પંપ|સ્પ્રેયર|કાતર|સિકેટર્સ|પાવડો|કોદાળી|ત્રિકમ|ખુરપી|પંજેટી|ઝારી|લીમડો|અર્ક|ખેતીવાડી|ખેતઓજાર|હળ|પ્લાઉ|રોટાવેટર|ટિલર|કલ્ટીવેટર|ઓરણી|સીડ\s*ડ્રીલ|શેડ\s*નેટ|ગ્રો\s*બેગ|ખેત|खेत|खेती|किसान|फसल|पौधा|पौधे|बीज|बुवाई|कटाई|मिट्टी|खाद|उर्वरक|कीट|कीड़ा|रोग|पत्ता|पत्ते|फल|सब्जी|बगीचा|छत|गमला|सिंचाई|ड्रिप|फव्वारा|ट्रैक्टर|औजार|उपकरण|पंप|स्प्रेयर|कैंची|सिकेटर|फावड़ा|कुदाल|खुरपी|हजारी|नीम|कृषि|हल|यंत्र|मशीन|रोटावेटर|टिलर|कल्टीवेटर|सीड\s*ड्रिल|शेड\s*नेट|ग्रो\s*बैग|खरपतवार|दवा\s*छिड़काव)/i;

  if (lower.match(AGRI_EQUIPMENT_REGEX)) return true;

  // 3. Platform navigation / feature names
  const PLATFORM_REGEX = /(urbanfarm|diagnosis|watering|garden|crop\s*recommend|community|support|contact|sign\s*in|login|register|admin|અર્બનફાર્મ|નિદાન|વોટરિંગ|બગીચો|અર્બન|अर्बनफार्म|निदान|सिंचाई|बगीचा)/i;

  return Boolean(lower.match(PLATFORM_REGEX));
}

// Explicit strictly non-agricultural/non-equipment patterns (Zero tolerance)
const STRICT_OUT_OF_SCOPE_REGEX = /\b(movie|movies|film|films|actor|actors|actress|actresses|bollywood|hollywood|cinema|song|songs|singer|singers|music|dance|celebrity|celebrities|cricket\s*match|cricket\s*score|cricket\s*player|cricket\s*team|cricketer|ipl|world\s*cup|football|tennis|badminton|sports?\s*score|gaming|video\s*game|playstation|xbox|pubg|freefire|politics|politician|politicians|minister|ministers|president|presidents|election|elections|vote|voting|modi|bjp|congress|crypto|bitcoin|ethereum|stock\s*market|nifty|sensex|share\s*market|investing|finance\s*loan|bank\s*loan|python|javascript|typescript|c\+\+|html|css|php|sql|database|programming|code|coding|algorithm|math|mathematics|calculus|algebra|solve\s*equation|physics|quantum|astronomy|galaxy|black\s*hole|doctor\s*human|hospital|cancer|covid|fever|headache|medicine\s*human|paracetamol|car\s*engine|bike\s*repair|mobile\s*phone|iphone|samsung|laptop|computer|windows\s*11|dating|relationship|girlfriend|boyfriend|love\s*advice|horoscope|astrology|zodiac|joke|jokes|story\s*writing)\b/i;

/**
 * Detect primary intent with multi-lingual pattern scoring
 */
function detectIntent(text, language = 'en', history = []) {
  const lower = (text || '').toLowerCase().trim();
  const lang = ['gu', 'hi'].includes(language) ? language : 'en';

  // 1. Check for greetings
  const greetingPatterns = [
    'hello', 'hi', 'hey', 'namaste', 'kem cho', 'good morning', 'good evening',
    'નમસ્તે', 'કેમ છો', 'નમસ્કાર', 'હેલો', 'હાય',
    'नमस्ते', 'प्रणाम', 'नमस्कार', 'हेलो', 'हाय'
  ];
  if (greetingPatterns.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'))) {
    return {
      intent: 'greeting',
      confidence: 0.95,
      route: PLATFORM_ROUTES.gardens,
      quickActions: [
        { label: lang === 'gu' ? 'કૃષિ ઓજારો અને સાધનો' : lang === 'hi' ? 'कृषि उपकरण और औजार' : 'Farming Equipments', path: PLATFORM_ROUTES.gardens },
        { label: lang === 'gu' ? 'રોગ નિદાન' : lang === 'hi' ? 'रोग निदान' : 'AI Plant Diagnosis', path: PLATFORM_ROUTES.diagnosis },
        { label: lang === 'gu' ? 'સ્માર્ટ વોટરિંગ' : lang === 'hi' ? 'स्मार्ट सिंचाई' : 'Smart Watering', path: PLATFORM_ROUTES.watering }
      ],
      followUpSuggestions: [
        lang === 'gu' ? 'ખેતી અને બગીચા માટે કયા ઓજારો જોઈએ?' : lang === 'hi' ? 'खेती और बागवानी के लिए कौन से उपकरण चाहिए?' : 'What farming equipment do I need?',
        lang === 'gu' ? 'છોડનું રોગ નિદાન કેવી રીતે કરવું?' : lang === 'hi' ? 'पौधे का रोग निदान कैसे करें?' : 'How do I diagnose plant diseases?'
      ]
    };
  }

  // 2. Identity & capability inquiry (who are you, what can you do)
  const capabilityPatterns = [
    'who are you', 'what can you do', 'what do you do', 'help me',
    'તમે કોણ છો', 'તમે શું કરી શકો', 'તમે શું કામ કરો છો', 'મને મદદ કરો',
    'आप कौन हैं', 'आप क्या कर सकती हैं', 'आप क्या काम करती हैं', 'मेरी मदद करें'
  ];
  if (capabilityPatterns.some(cp => lower.includes(cp))) {
    return {
      intent: 'unknown',
      confidence: 0.95,
      route: PLATFORM_ROUTES.gardens,
      quickActions: [
        { label: lang === 'gu' ? 'કૃષિ ઓજારો અને સાધનો' : lang === 'hi' ? 'कृषि उपकरण और औजार' : 'Farming Equipments', path: PLATFORM_ROUTES.gardens },
        { label: lang === 'gu' ? 'રોગ નિદાન' : lang === 'hi' ? 'रोग निदान' : 'AI Plant Diagnosis', path: PLATFORM_ROUTES.diagnosis }
      ],
      followUpSuggestions: [
        lang === 'gu' ? 'ખેતી અને બગીચા માટે કયા ઓજારો જોઈએ?' : lang === 'hi' ? 'खेती और बागवानी के लिए कौन से उपकरण चाहिए?' : 'What farming equipment do I need?',
        lang === 'gu' ? 'છોડનું રોગ નિદાન કેવી રીતે કરવું?' : lang === 'hi' ? 'पौधे का रोग निदान कैसे करें?' : 'How do I diagnose plant diseases?'
      ]
    };
  }

  // 3. Strict Out-of-Scope Pre-check: Reject non-agricultural questions immediately
  const isExplicitOutOfScope = Boolean(lower.match(STRICT_OUT_OF_SCOPE_REGEX));
  const isAgriRelated = isFarmingOrEquipmentQuery(lower);

  if (isExplicitOutOfScope || (!isAgriRelated && !FOLLOW_UP_PATTERNS.some(fp => lower.includes(fp)))) {
    const kbData = KNOWLEDGE_BASE.unknown[lang] || KNOWLEDGE_BASE.unknown.en;
    return {
      intent: 'out_of_scope',
      confidence: 0.99,
      route: PLATFORM_ROUTES.gardens,
      extractedPlant: null,
      extractedSymptom: null,
      quickActions: [
        { label: lang === 'gu' ? 'કૃષિ ઓજારો અને સાધનો' : lang === 'hi' ? 'कृषि उपकरण और औजार' : 'Farming Equipments', path: PLATFORM_ROUTES.gardens },
        { label: lang === 'gu' ? 'રોગ નિદાન' : lang === 'hi' ? 'रोग निदान' : 'AI Plant Diagnosis', path: PLATFORM_ROUTES.diagnosis }
      ],
      followUpSuggestions: kbData.followUps || []
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
        } else if (pastText.includes('equipment') || pastText.includes('tool') || pastText.includes('tractor') || pastText.includes('ઓજાર') || pastText.includes('उपकरण')) {
          contextIntent = 'equipment';
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
    safety: 0,
    equipment: 0
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
  if (lower.match(/(pest|bug|insect|aphid|mealybug|mite|caterpillar|worm|neem|spray|જીવાત|ઈયળ|માખી|કીડા|લીમડો|કીટ|माहू|मिलीबग|कीड़ा|इल्ली|नीम)/i)) {
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

  // 10. Farming & Gardening Equipments / Machinery / Tools
  if (lower.match(/(equipment|tool|machin|tractor|tiller|rotavator|cultivator|plough|plow|sprayer|knapsack|drip|sprinkler|pump|shear|secateur|trowel|spade|shovel|rake|hoe|khurpi|dibber|seed\s*drill|grow\s*bag|shade\s*net|ph\s*meter|moisture\s*meter|harvester|thresher|harrow|chainsaw|mower|weeder|nozzle|pipe|hose|tubewell|borewell|ટ્રેક્ટર|ટિલર|રોટાવેટર|કલ્ટીવેટર|હળ|પ્લાઉ|ઓરણી|સીડ\s*ડ્રીલ|સ્પ્રેયર|પંપ|કાતર|સિકેટર્સ|પાવડો|કોદાળી|ત્રિકમ|ખુરપી|પંજેટી|ઝારી|સાધન|ઓજાર|યંત્ર|ટપક|ફુવારા|ગ્રો\s*બેગ|શેડ\s*નેટ|ટૂલ|ट्रैक्टर|टिलर|रोटावेटर|कल्टीवेटर|हल|सीड\s*ड्रिल|स्प्रेयर|पंप|सिकेटर|कैंची|फावड़ा|कुदाल|खुरपी|हजारी|उपकरण|औजार|यंत्र|मशीन|ड्रिप|फव्वारा|ग्रो\s*बैग|शेड\s*नेट|टूल)/i)) {
    scores.equipment += 6;
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

  // If score is negligible and not a follow-up, mark as out_of_scope
  if (maxScore < 2) {
    if (!isAgriRelated && !isFollowUp) {
      topIntent = 'out_of_scope';
    } else {
      topIntent = 'unknown';
    }
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
    equipment: PLATFORM_ROUTES.gardens,
    out_of_scope: PLATFORM_ROUTES.gardens,
    unknown: PLATFORM_ROUTES.gardens,
    general: PLATFORM_ROUTES.diagnosis
  };

  const primaryRoute = routeMap[topIntent] || PLATFORM_ROUTES.diagnosis;
  const kbData = KNOWLEDGE_BASE[topIntent] ? KNOWLEDGE_BASE[topIntent][lang] : (KNOWLEDGE_BASE.unknown[lang] || KNOWLEDGE_BASE.general[lang]);

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
  isFarmingOrEquipmentQuery,
  COMMON_PLANTS,
  VALID_PLATFORM_ROUTES,
};
