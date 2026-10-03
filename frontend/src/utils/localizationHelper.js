/**
 * Dynamic DB Data Translation Helper
 * Automatically translates plant names, garden titles, user names, descriptions, locations,
 * task titles, and disease names fetched from the database into the active language (Gujarati / Hindi / English).
 */

const NAME_DICTIONARY = [
  { keywords: ["priya sharma", "priya"], gu: "પ્રિયા શર્મા", hi: "प्रिया शर्मा" },
  { keywords: ["vishal baraiya", "vishal"], gu: "વિશાલ બારૈયા", hi: "विशाल बारैया" },
  { keywords: ["rahul sharma", "rahul"], gu: "રાહુલ શર્મા", hi: "राहुल शर्मा" },
  { keywords: ["john doe"], gu: "જોન ડો", hi: "जॉन डो" },
  { keywords: ["elena rostova"], gu: "એલેના રોસ્ટોવા", hi: "एलेना रोस्टोवा" },
  { keywords: ["marcus chen"], gu: "માર્કસ ચેન", hi: "मार्क्स चेन" },
  { keywords: ["sarah jenkins"], gu: "સારાહ જેન્કિન્સ", hi: "सारा जेनकिंस" },
];

const PLANT_DICTIONARY = [
  { keywords: ['bell pepper', 'capsicum'], gu: 'શિમલા મરચું', hi: 'शिमला मिर्च' },
  { keywords: ['chilli', 'chili', 'pepper'], gu: 'મરચું', hi: 'मिर्च' },
  { keywords: ['mint', 'pudina'], gu: 'ફુદીનો', hi: 'पुदीना' },
  { keywords: ['rose'], gu: 'ગુલાબ', hi: 'गुलाब' },
  { keywords: ['carrot'], gu: 'ગાજર', hi: 'गाजर' },
  { keywords: ['guava'], gu: 'જામફળ', hi: 'अमरूद' },
  { keywords: ['banana'], gu: 'કેળું', hi: 'केला' },
  { keywords: ['tomato'], gu: 'ટામેટું', hi: 'टमाटर' },
  { keywords: ['basil', 'tulsi'], gu: 'તુલસી', hi: 'तुलसी' },
  { keywords: ['spinach', 'palak'], gu: 'પાલક', hi: 'पालक' },
  { keywords: ['coriander', 'cilantro', 'dhaniya'], gu: 'કોથમરી', hi: 'धनिया' },
  { keywords: ['lettuce'], gu: 'સલાડ પત્તા', hi: 'सलाद पत्ता' },
  { keywords: ['strawberry'], gu: 'સ્ટ્રોબેરી', hi: 'स्ट्रॉबेरी' },
  { keywords: ['cucumber'], gu: 'કાકડી', hi: 'खीरा' },
  { keywords: ['aloe', 'aloevera'], gu: 'એલોવેરા', hi: 'एलोवेरा' },
  { keywords: ['marigold'], gu: 'ગલગોટો', hi: 'गेंदा' },
  { keywords: ['jasmine', 'mogra'], gu: 'મોગરો', hi: 'चमेली' },
  { keywords: ['lemon', 'lime'], gu: 'લીંબુ', hi: 'नींबू' },
  { keywords: ['mango'], gu: 'કેરી', hi: 'आम' },
  { keywords: ['papaya'], gu: 'પપૈયું', hi: 'पपीता' },
  { keywords: ['onion'], gu: 'ડુંગળી', hi: 'प्याज' },
  { keywords: ['garlic'], gu: 'લસણ', hi: 'लहसुन' },
  { keywords: ['potato'], gu: 'બટાકા', hi: 'आलू' },
  { keywords: ['eggplant', 'brinjal'], gu: 'રીંગણ', hi: 'बैंगन' },
];

const DISEASE_DICTIONARY = [
  { keywords: ['healthy plant', 'healthy'], gu: 'તંદુરસ્ત છોડ', hi: 'स्वस्थ पौधा' },
  { keywords: ['diplocarpon', 'black spot'], gu: 'બ્લેક સ્પોટ રોગ', hi: 'ब्लैक स्पॉट रोग' },
  { keywords: ['powdery mildew'], gu: 'પાવડરી મિલ્ડ્યુ (ફૂગ)', hi: 'पाउडरी फफूंदी' },
  { keywords: ['early blight'], gu: 'અર્લી બ્લાઇટ (રોગ)', hi: 'अगेती झुलसा' },
  { keywords: ['late blight'], gu: 'લેટ બ્લાઇટ (રોગ)', hi: 'पछेती झुलसा' },
  { keywords: ['leaf spot'], gu: 'પાંદડાના ટપકાંનો રોગ', hi: 'पत्ती के धब्बे' },
  { keywords: ['rust'], gu: 'રસ્ટ રોગ', hi: 'गेरुई रोग' },
  { keywords: ['bacterial wilt'], gu: 'જીવાણુ કરમાવો', hi: 'जीवाणु मुरझान' },
  { keywords: ['spider mites'], gu: 'કરોળિયા જીવાત', hi: 'मकड़ी कीट' }
];

const GARDEN_DICTIONARY = [
  { keywords: ["priya's balcony farm", "balcony farm"], gu: "પ્રિયાનું બાલ્કની ફાર્મ", hi: "प्रिया का बालकनी फार्म" },
  { keywords: ["priya's trace garden", "priya's terrace garden", "terrace garden", "trace garden"], gu: "પ્રિયાનું ટેરેસ ગાર્ડન", hi: "प्रिया का टेरेस गार्डन" },
  { keywords: ["backyard garden"], gu: "પાછળનું આંગણું બગીચો", hi: "पीछे का आंगन बगीचा" },
  { keywords: ["rooftop organic bed", "rooftop garden"], gu: "ધાબા પરનો ઓર્ગેનિક બગીચો", hi: "छत का ऑर्गेनिक बगीचा" },
  { keywords: ["small but productive balcony setup with containers.", "small but productive balcony setup with containers"], gu: "કન્ટેનર સાથે નાનું પરંતુ ઉત્પાદક બાલ્કની સેટઅપ.", hi: "कंटेनरों के साथ छोटा लेकिन उत्पादक बालकनी सेटअप।" },
  { keywords: ["maintaining the plants of backyard garden..", "maintaining the plants of backyard garden"], gu: "પાછળના આંગણાના બગીચાના છોડની દેખરેખ...", hi: "पीछे के आंगन के बगीचे के पौधों का रखरखाव..." },
  { keywords: ["mumbai, maharashtra"], gu: "મુંબઈ, મહારાષ્ટ્ર", hi: "मुंबई, महाराष्ट्र" },
  { keywords: ["rajkot, gujarat"], gu: "રાજકોટ, ગુજરાત", hi: "राजकोट, गुजरात" },
  { keywords: ["ahmedabad, gujarat"], gu: "અમદાવાદ, ગુજરાત", hi: "अहमदाबाद, गुजरात" },
];

/**
 * Main translation function for dynamic DB text
 */
export const getLocalizedDynamicText = (text, lang = null) => {
  if (!text || typeof text !== 'string') return text || '';
  
  const currentLang = (lang || localStorage.getItem('language') || 'en').split('-')[0];
  if (currentLang === 'en') return text;

  let str = text.trim();
  const lowerStr = str.toLowerCase();

  // 0. Name dictionary match (User names e.g. Priya Sharma -> પ્રિયા શર્મા)
  for (const item of NAME_DICTIONARY) {
    for (const kw of item.keywords) {
      if (lowerStr === kw || lowerStr.includes(kw)) {
        return item[currentLang] || str;
      }
    }
  }

  // 1. Task pattern translation: e.g. "Water Rose2 (1L)" -> "ગુલાબ2 માં પાણી આપો (1L)"
  const waterMatch = str.match(/^water\s+(.+)$/i);
  if (waterMatch) {
    const target = waterMatch[1];
    const translatedTarget = getLocalizedDynamicText(target, currentLang);
    if (currentLang === 'gu') return `${translatedTarget} માં પાણી આપો`;
    if (currentLang === 'hi') return `${translatedTarget} में पानी दें`;
  }

  const pruneMatch = str.match(/^prune\s+(.+)$/i);
  if (pruneMatch) {
    const target = pruneMatch[1];
    const translatedTarget = getLocalizedDynamicText(target, currentLang);
    if (currentLang === 'gu') return `${translatedTarget} ની છંટકાવ કરો`;
    if (currentLang === 'hi') return `${translatedTarget} की छंटाई करें`;
  }

  const fertilizeMatch = str.match(/^(fertilize|feed)\s+(.+)$/i);
  if (fertilizeMatch) {
    const target = fertilizeMatch[2];
    const translatedTarget = getLocalizedDynamicText(target, currentLang);
    if (currentLang === 'gu') return `${translatedTarget} ને ખાતર આપો`;
    if (currentLang === 'hi') return `${translatedTarget} को खाद दें`;
  }

  // 2. Exact or substring match in Disease dictionary
  for (const item of DISEASE_DICTIONARY) {
    for (const kw of item.keywords) {
      if (lowerStr === kw || lowerStr === `diagnosed: ${kw}`) {
        return item[currentLang] || str;
      }
    }
  }

  // 3. Garden dictionary match (handles Garden names, locations, and descriptions)
  for (const item of GARDEN_DICTIONARY) {
    for (const kw of item.keywords) {
      if (lowerStr === kw || lowerStr.includes(kw)) {
        return item[currentLang] || str;
      }
    }
  }

  // 4. Plant Dictionary match (handles plant names like "Mint", "Rose 2", "Guava Plant", "Bell Pepper (500ml)", "Banana (700ml)")
  // First extract any trailing volume/parenthetical detail e.g., "(700ml)", "(1L)", "(500ml)"
  let vol = '';
  let cleanPlantStr = str;
  const volMatch = str.match(/\s*(\([^)]+\))\s*$/);
  if (volMatch) {
    vol = ` ${volMatch[1].trim()}`;
    cleanPlantStr = str.replace(/\s*(\([^)]+\))\s*$/, '').trim();
  }

  const cleanLower = cleanPlantStr.toLowerCase();

  for (const item of PLANT_DICTIONARY) {
    for (const kw of item.keywords) {
      if (cleanLower.includes(kw)) {
        let baseName = item[currentLang];

        if (cleanLower.includes('plant') && !baseName.includes('છોડ') && !baseName.includes('पौधा')) {
          if (currentLang === 'gu') baseName += 'નો છોડ';
          if (currentLang === 'hi') baseName += ' का पौधा';
        }

        // Check if there is an explicit plant index/number suffix strictly in cleanPlantStr (e.g., "Rose 2" or "Rose #2")
        const remaining = cleanPlantStr.replace(new RegExp(kw, 'i'), '').replace(/plant/i, '').trim();
        let suffix = '';
        if (remaining) {
          const cleanSuffix = remaining.replace(/^[-\s#]+/, '').trim();
          if (cleanSuffix) {
            suffix = ` ${cleanSuffix}`;
          }
        }

        return `${baseName}${suffix}${vol}`;
      }
    }
  }

  // Fallback for Disease names matching part of string
  for (const item of DISEASE_DICTIONARY) {
    for (const kw of item.keywords) {
      if (lowerStr.includes(kw)) {
        return item[currentLang] || str;
      }
    }
  }

  return str;
};
