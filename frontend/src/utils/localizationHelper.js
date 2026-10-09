/**
 * Dynamic DB Data Translation Helper
 * ---------------------------------------------------------------------------
 * Translates plant names, garden titles, user names, descriptions, task titles,
 * disease names, soil types, seasons, community posts, etc. coming from the
 * database into the active language (Gujarati "gu" / Hindi "hi" / English "en").
 *
 * Supports bidirectional & cross-language translation:
 * - English -> Gujarati / Hindi
 * - Gujarati -> Hindi / English
 * - Hindi -> Gujarati / English
 */

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

const NAME_DICTIONARY = [
  { keywords: ['priya sharma', 'priya'], gu: 'પ્રિયા શર્મા', hi: 'प्रिया शर्मा', en: 'Priya Sharma' },
  { keywords: ['vishal baraiya', 'vishal'], gu: 'વિશાલ બારૈયા', hi: 'विशाल बारैया', en: 'Vishal Baraiya' },
  { keywords: ['rahul sharma', 'rahul'], gu: 'રાહુલ શર્મા', hi: 'राहुल शर्मा', en: 'Rahul Sharma' },
  { keywords: ['saurabh singh', 'saurabh'], gu: 'સૌરભ સિંહ', hi: 'सौरभ सिंह', en: 'Saurabh Singh' },
  { keywords: ['arjun mehta', 'arjun'], gu: 'અર્જુન મહેતા', hi: 'अर्जुन मेहता', en: 'Arjun Mehta' },
  { keywords: ['admin user', 'adminuser', 'admin'], gu: 'એડમિન યુઝર', hi: 'एडमिन यूजर', en: 'Admin User' },
  { keywords: ['anonymous gardener', 'anonymous'], gu: 'અનામી ખેડૂત', hi: 'अनाम किसान', en: 'Anonymous Gardener' },
  { keywords: ['gardener'], gu: 'ખેડૂત મિત્ર', hi: 'किसान साथी', en: 'Gardener' },
  { keywords: ['john doe'], gu: 'જોન ડો', hi: 'जॉन डो', en: 'John Doe' },
  { keywords: ['elena rostova'], gu: 'એલેના રોસ્ટોવા', hi: 'एलेना रोस्टोवा', en: 'Elena Rostova' },
  { keywords: ['marcus chen'], gu: 'માર્કસ ચેન', hi: 'मार्क्स चेन', en: 'Marcus Chen' },
  { keywords: ['sarah jenkins'], gu: 'સારાહ જેન્કિન્સ', hi: 'सारा जेनकिंस', en: 'Sarah Jenkins' },
];

/** Plant & crop names. */
const PLANT_DICTIONARY = [
  {
    keywords: [
      'cherry tomato (determinate / patio)', 'cherry tomato (patio/determinate)', 'cherry tomato (determinate)',
      'patio cherry tomato', 'bush cherry tomato', 'cherry tomato', 'patio tomato', 'cherry tomatoes',
      'ચેરી ટામેટા', 'ચેરી ટમેટા', 'ચેરી ટામેટાં', 'चेरी टमाटर', 'चेरी टमाटर (पैटियो)'
    ],
    gu: 'ચેરી ટામેટા',
    hi: 'चेरी टमाटर',
    en: 'Cherry Tomato'
  },
  {
    keywords: [
      'sweet 100 cherry & roma', 'sweet 100 cherry and roma', 'sweet 100 cherry', 'roma tomato', 'sweet 100 & roma',
      'સ્વીટ 100 ચેરી અને રોમા', 'સ્વીટ 100 ચેરી & રોમા', 'स्वीट 100 चेरी और रोमा'
    ],
    gu: 'સ્વીટ 100 ચેરી & રોમા ટામેટા',
    hi: 'स्वीट 100 चेरी और रोमा टमाटर',
    en: 'Sweet 100 Cherry & Roma'
  },
  {
    keywords: [
      'bush tomato (determinate varieties)', 'bush tomato (determinate)', 'bush tomato', 'bush tomatoes',
      'ઝાડવા ટામેટા', 'ઝાડવાં ટામેટા', 'झाड़ी टमाटर', 'झाड़ीदार टमाटर'
    ],
    gu: 'ઝાડવા ટામેટા',
    hi: 'झाड़ी टमाटर',
    en: 'Bush Tomato'
  },
  {
    keywords: [
      'tomato', 'tomatoes', 'tomato plant', 'tameta', 'tametar',
      'ટામેટા', 'ટામેટાં', 'ટામેટું', 'ટમેટા', 'ટમેટાં', 'ટમેટું', 'ટમેટાનો છોડ',
      'टमाटर', 'टमाटर का पौधा'
    ],
    gu: 'ટામેટા',
    hi: 'टमाटर',
    en: 'Tomato'
  },
  {
    keywords: [
      'okra', 'ladyfinger', 'lady finger', 'bhindi', 'bhendi', 'bhindo', 'okra plant',
      'ભીંડા', 'ભીંડી', 'ભીંડો', 'ભીંડાનો છોડ',
      'भिंडी', 'भिन्डी', 'भिंडी का पौधा'
    ],
    gu: 'ભીંડા',
    hi: 'भिंडी',
    en: 'Okra'
  },
  {
    keywords: [
      'eggplant', 'brinjal', 'aubergine', 'baingan', 'ringan', 'ringna', 'eggplants',
      'રીંગણ', 'રીંગણા', 'રીંગણાં', 'રીંગણું', 'રીંગણનો છોડ',
      'बैंगन', 'बैंगन का पौधा'
    ],
    gu: 'રીંગણ',
    hi: 'बैंगन',
    en: 'Eggplant (Brinjal)'
  },
  {
    keywords: [
      'cucumber', 'patio cucumber', 'bush cucumber', 'compact patio cucumber', 'kakdi', 'kheera', 'khira', 'cucumbers',
      'કાકડી', 'કાકડીઓ', 'ખીરા', 'કાકડીનો છોડ',
      'खीरा', 'खीरा (पैटियो)', 'खीरे का पौधा'
    ],
    gu: 'કાકડી',
    hi: 'खीरा',
    en: 'Cucumber'
  },
  {
    keywords: [
      'sweet bell pepper', 'bush bell pepper', 'bush pepper', 'bell pepper', 'capsicum', 'shimla mirch', 'shimla marcha',
      'શિમલા મરચાં', 'શિમલા મરચું', 'શિમલા મરચા', 'કેપ્સિકમ',
      'शिमला मिर्च', 'कैप्सिकम'
    ],
    gu: 'શિમલા મરચાં',
    hi: 'शिमला मिर्च',
    en: 'Bell Pepper'
  },
  {
    keywords: [
      'chilli', 'chili', 'green chilli', 'green chili', 'pepper', 'mirchi', 'marchu', 'chilli plant',
      'મરચું', 'મરચાં', 'લીલા મરચાં', 'મરચી', 'મરચીનો છોડ',
      'मिर्च', 'हरी मिर्च', 'मिर्च का पौधा'
    ],
    gu: 'મરચું',
    hi: 'मिर्च',
    en: 'Chilli'
  },
  {
    keywords: [
      'lotus', 'lotus (padma)', 'padma', 'sacred lotus', 'nelumbo nucifera',
      'કમળ (પદ્મ)', 'કમળ', 'પદ્મ',
      'कमल (पद्म)', 'कमल', 'पद्म'
    ],
    gu: 'કમળ',
    hi: 'कमल (पद्म)',
    en: 'Lotus'
  },
  {
    keywords: [
      'banana', 'banana plant', 'banana tree', 'musa', 'kela', 'kelu',
      'કેળું', 'કેળા', 'કેળાં', 'કેળાનો છોડ',
      'केला', 'केले का पौधा'
    ],
    gu: 'કેળા',
    hi: 'केला',
    en: 'Banana'
  },
  {
    keywords: [
      'bush beans', 'french beans', 'green beans', 'cowpea', 'beans', 'chawli', 'choli',
      'ચોળી / ફણસી (બીન્સ)', 'ચોળી', 'ફણસી', 'ચોળા', 'બીન્સ',
      'लोबिया / हरी फलियां (बीन्स)', 'हरी फलियां (बीन्स)', 'लोबिया', 'फ्रेंच बीन्स', 'बीन्स'
    ],
    gu: 'ચોળી / ફણસી (બીન્સ)',
    hi: 'हरी फलियां (बीन्स)',
    en: 'Beans / Cowpea'
  },
  {
    keywords: [
      'fenugreek', 'methi', 'fresh fenugreek',
      'મેથી', 'લીલી મેથી',
      'मेथी', 'हरी मेथी'
    ],
    gu: 'મેથી',
    hi: 'मेथी',
    en: 'Fenugreek'
  },
  {
    keywords: [
      'spinach', 'palak', 'spinach leaves',
      'પાલક', 'લીલી પાલક',
      'पालक', 'हरी पालक'
    ],
    gu: 'પાલક',
    hi: 'पालक',
    en: 'Spinach'
  },
  {
    keywords: [
      'coriander', 'cilantro', 'dhaniya', 'kothmir', 'kothamari',
      'કોથમરી', 'કોથમીર', 'ધાણા',
      'धनिया', 'हरा धनिया'
    ],
    gu: 'કોથમરી',
    hi: 'धनिया',
    en: 'Coriander'
  },
  {
    keywords: [
      'mint', 'pudina', 'spearmint', 'mentha spicata', 'peppermint',
      'ફુદીનો', 'પુદીના', 'સ્પિયરમિન્ટ (ફુદીનો)', 'પીપરમિન્ટ',
      'पुदीना', 'स्पीयरमिंट (पुदीना)', 'पिपरमिंट'
    ],
    gu: 'ફુદીનો',
    hi: 'पुदीना',
    en: 'Mint'
  },
  {
    keywords: [
      'genovese basil', 'sweet basil', 'basil', 'tulsi', 'holy basil',
      'તુલસી / ડમરો', 'તુલસી', 'ડમરો',
      'तुलसी', 'स्वीट बेसिल'
    ],
    gu: 'તુલસી',
    hi: 'तुलसी',
    en: 'Basil / Tulsi'
  },
  {
    keywords: [
      'curry leaf', 'curry leaves', 'kadi patta', 'mitho limdo',
      'મીઠો લીમડો', 'મીઠા લીમડાના પાન',
      'कड़ी पत्ता', 'करी पत्ता'
    ],
    gu: 'મીઠો લીમડો',
    hi: 'कड़ी पत्ता',
    en: 'Curry Leaves'
  },
  {
    keywords: [
      'bitter gourd', 'karela',
      'કારેલા', 'કારેલું',
      'करेला'
    ],
    gu: 'કારેલા',
    hi: 'करेला',
    en: 'Bitter Gourd'
  },
  {
    keywords: [
      'bottle gourd', 'lauki', 'dudhi', 'calabash',
      'દૂધી', 'લૌકી',
      'लौकी', 'घिया'
    ],
    gu: 'દૂધી',
    hi: 'लौकी',
    en: 'Bottle Gourd'
  },
  {
    keywords: [
      'ridge gourd', 'turiya', 'turai',
      'તુરીયા', 'તુરીયું',
      'तुरई', 'तोरी'
    ],
    gu: 'તુરીયા',
    hi: 'तुरई',
    en: 'Ridge Gourd'
  },
  {
    keywords: [
      'sponge gourd', 'galka',
      'ગલકા', 'ગલકું',
      'गलका'
    ],
    gu: 'ગલકા',
    hi: 'गलका',
    en: 'Sponge Gourd'
  },
  {
    keywords: [
      'cluster beans', 'guar', 'guvar',
      'ગુવાર', 'ગવાર',
      'ग्वार फली', 'ग्वार'
    ],
    gu: 'ગુવાર',
    hi: 'ग्वार फली',
    en: 'Cluster Beans'
  },
  {
    keywords: [
      'green peas', 'peas', 'matar',
      'વટાણા', 'લીલા વટાણા',
      'मटर', 'हरी मटर'
    ],
    gu: 'વટાણા',
    hi: 'मटर',
    en: 'Green Peas'
  },
  {
    keywords: [
      'cauliflower', 'gobi', 'phool gobi',
      'ફૂલેવર', 'ફૂલગોબી',
      'फूलगोभी', 'गोभी'
    ],
    gu: 'ફૂલેવર',
    hi: 'फूलगोभी',
    en: 'Cauliflower'
  },
  {
    keywords: [
      'cabbage', 'patta gobi',
      'કોબીજ', 'કોબી',
      'पत्ता गोभी', 'बंदगोभी'
    ],
    gu: 'કોબીજ',
    hi: 'पत्ता गोभी',
    en: 'Cabbage'
  },
  {
    keywords: [
      'radish', 'mooli', 'mulo',
      'મૂળો', 'મૂળા',
      'मूली'
    ],
    gu: 'મૂળો',
    hi: 'मूली',
    en: 'Radish'
  },
  {
    keywords: [
      'carrot', 'gajar',
      'ગાજર',
      'गाजर'
    ],
    gu: 'ગાજર',
    hi: 'गाजर',
    en: 'Carrot'
  },
  {
    keywords: [
      'beetroot', 'beet', 'chukandar',
      'બીટ', 'બીટરૂટ',
      'चुकंदर'
    ],
    gu: 'બીટ',
    hi: 'चुकंदर',
    en: 'Beetroot'
  },
  {
    keywords: [
      'ginger', 'adrak', 'aadu',
      'આદુ', 'આદું',
      'अदरक'
    ],
    gu: 'આદુ',
    hi: 'अदरक',
    en: 'Ginger'
  },
  {
    keywords: [
      'turmeric', 'haldi',
      'હળદર', 'હળદળ',
      'हल्दी'
    ],
    gu: 'હળદર',
    hi: 'हल्दी',
    en: 'Turmeric'
  },
  {
    keywords: [
      'garlic', 'lahsun', 'lasun',
      'લસણ',
      'लहसुन'
    ],
    gu: 'લસણ',
    hi: 'लहसुन',
    en: 'Garlic'
  },
  {
    keywords: [
      'onion', 'pyaz', 'dungri',
      'ડુંગળી', 'કાંદા',
      'प्याज'
    ],
    gu: 'ડુંગળી',
    hi: 'प्याज',
    en: 'Onion'
  },
  {
    keywords: [
      'spring onion', 'green onion',
      'લીલી ડુંગળી',
      'हरी प्याज'
    ],
    gu: 'લીલી ડુંગળી',
    hi: 'हरी प्याज',
    en: 'Spring Onion'
  },
  {
    keywords: [
      'potato', 'potatoes', 'aloo', 'bataka',
      'બટાકા', 'બટાટા',
      'आलू'
    ],
    gu: 'બટાકા',
    hi: 'आलू',
    en: 'Potato'
  },
  {
    keywords: [
      'sweet potato', 'shakarkand', 'shakkariya',
      'શક્કરિયા',
      'शकरकंद'
    ],
    gu: 'શક્કરિયા',
    hi: 'शकरकंद',
    en: 'Sweet Potato'
  },
  {
    keywords: [
      'guava plant', 'guava', 'amrood', 'jamfal',
      'જામફળ',
      'अमरूद'
    ],
    gu: 'જામફળ',
    hi: 'अमरूद',
    en: 'Guava'
  },
  {
    keywords: [
      'papaya', 'papita', 'papaiyu',
      'પપૈયું', 'પપૈયા',
      'पपीता'
    ],
    gu: 'પપૈયું',
    hi: 'पपीता',
    en: 'Papaya'
  },
  {
    keywords: [
      'pomegranate', 'anar', 'daadam',
      'દાડમ',
      'अनार'
    ],
    gu: 'દાડમ',
    hi: 'अनार',
    en: 'Pomegranate'
  },
  {
    keywords: [
      'lemon', 'lime', 'nimbu', 'limbu',
      'લીંબુ',
      'नींबू'
    ],
    gu: 'લીંબુ',
    hi: 'नींबू',
    en: 'Lemon'
  },
  {
    keywords: [
      'mango', 'aam', 'keri',
      'કેરી',
      'आम'
    ],
    gu: 'કેરી',
    hi: 'आम',
    en: 'Mango'
  },
  {
    keywords: [
      'watermelon', 'tarbooz', 'tarbuj',
      'તડબૂચ', 'તરબૂચ',
      'तरबूज'
    ],
    gu: 'તરબૂચ',
    hi: 'तरबूज',
    en: 'Watermelon'
  },
  {
    keywords: [
      'muskmelon', 'cantaloupe', 'kharbooza', 'shakarteti',
      'શક્કરટેટી', 'ટેટી',
      'खरबूजा'
    ],
    gu: 'શક્કરટેટી',
    hi: 'खरबूजा',
    en: 'Muskmelon'
  },
  {
    keywords: [
      'strawberry', 'strawberries',
      'સ્ટ્રોબેરી',
      'स्ट्रॉबेरी'
    ],
    gu: 'સ્ટ્રોબેરી',
    hi: 'स्ट्रॉबेरी',
    en: 'Strawberry'
  },
  {
    keywords: [
      'aloe vera', 'aloevera', 'aloe',
      'એલોવેરા', 'કુંવારપાઠું',
      'एलोवेरा', 'घृतकुमारी'
    ],
    gu: 'એલોવેરા',
    hi: 'एलोवेरा',
    en: 'Aloe Vera'
  },
  {
    keywords: [
      'rose', 'rose plant', 'gulab',
      'ગુલાબ', 'ગુલાબનો છોડ',
      'गुलाब', 'गुलाब का पौधा'
    ],
    gu: 'ગુલાબ',
    hi: 'गुलाब',
    en: 'Rose'
  },
  {
    keywords: [
      'marigold', 'genda', 'galgoto',
      'ગલગોટો',
      'गेंदा'
    ],
    gu: 'ગલગોટો',
    hi: 'गेंदा',
    en: 'Marigold'
  },
  {
    keywords: [
      'jasmine', 'chameli',
      'ચમેલી',
      'चमेली'
    ],
    gu: 'ચમેલી',
    hi: 'चमेली',
    en: 'Jasmine'
  },
  {
    keywords: [
      'mogra',
      'મોગરો',
      'मोगरा'
    ],
    gu: 'મોગરો',
    hi: 'मोगरा',
    en: 'Mogra'
  },
  {
    keywords: [
      'lettuce', 'salad leaves',
      'સલાડ પત્તા',
      'सलाद पत्ता'
    ],
    gu: 'સલાડ પત્તા',
    hi: 'सलाद पत्ता',
    en: 'Lettuce'
  },
  {
    keywords: [
      'swiss chard', 'chard',
      'સ્વિસ ચાર્ડ',
      'स्विस चार्ड'
    ],
    gu: 'સ્વિસ ચાર્ડ',
    hi: 'स्विस चार्ड',
    en: 'Swiss Chard'
  },
  {
    keywords: [
      'amaranth', 'chaulai', 'tandaljo',
      'તાંદળજો (ચોળાઈ)', 'તાંદળજો',
      'चौलाई (अमरांथ)', 'चौलाई'
    ],
    gu: 'તાંદળજો (ચોળાઈ)',
    hi: 'चौलाई (अमरांथ)',
    en: 'Amaranth'
  },
  {
    keywords: [
      'herbs', 'herb',
      'જડીબુટ્ટીઓ / મસાલા છોડ', 'ઔષધીય છોડ',
      'जड़ी-बूटियाँ / हर्ब्स', 'जड़ी-बूटियाँ'
    ],
    gu: 'જડીબુટ્ટીઓ / મસાલા છોડ',
    hi: 'जड़ी-बूटियाँ / हर्ब्स',
    en: 'Herbs'
  },
  {
    keywords: ['patio', 'container', 'પેટિયો', 'पैटियो'],
    gu: 'પેટિયો',
    hi: 'पैटियो',
    en: 'Patio'
  },
  {
    keywords: ['bush', 'ઝાડવાં', 'ઝાડવા', 'झाड़ी'],
    gu: 'ઝાડવાં',
    hi: 'झाड़ी',
    en: 'Bush'
  },
  {
    keywords: ['determinate', 'ડિટર્મિનેટ', 'डिटर्मिनेट'],
    gu: 'ડિટર્મિનેટ',
    hi: 'डिटर्मिनेट',
    en: 'Determinate'
  },
  {
    keywords: ['indeterminate', 'ઇનડિટર્મિનેટ', 'इनडिटर्मिनेट'],
    gu: 'ઇનડિટર્મિનેટ',
    hi: 'इनडिटर्मिनेट',
    en: 'Indeterminate'
  },
  {
    keywords: ['indian', 'desi', 'દેશી', 'ભારતીય', 'देशी', 'भारतीय'],
    gu: 'દેશી',
    hi: 'देशी',
    en: 'Desi'
  },
  {
    keywords: ['hybrid', 'હાઇબ્રિડ', 'हाइब्रिड'],
    gu: 'હાઇબ્રિડ',
    hi: 'हाइब्रिड',
    en: 'Hybrid'
  }
];

/** Soil types & seasons. */
const SOIL_SEASON_DICTIONARY = [
  {
    keywords: [
      'sandy loam', 'sandy loam soil', 'sandyloam',
      'રેતાળ ગોરાડુ', 'રેતાળ ગોરાડુ માટી',
      'बलुई दोमट', 'बलुई दोमट मिट्टी', 'रेतीली दोमट'
    ],
    gu: 'રેતાળ ગોરાડુ',
    hi: 'बलुई दोमट',
    en: 'Sandy Loam'
  },
  {
    keywords: [
      'potting mix', 'pottingmix', 'potting soil',
      'પોટિંગ મિક્સ', 'કૂંડાની માટી',
      'पोटिंग मिक्स', 'गमले की मिट्टी'
    ],
    gu: 'પોટિંગ મિક્સ',
    hi: 'पोटिंग मिक्स',
    en: 'Potting Mix'
  },
  {
    keywords: [
      'loam', 'loam soil',
      'દોમટ (loam)', 'દોમટ', 'ગોરાડુ', 'ગોરાડુ / દોમટ',
      'दोमट (loam)', 'दोमट', 'दोमट मिट्टी'
    ],
    gu: 'ગોરાડુ / દોમટ',
    hi: 'दोमट',
    en: 'Loam'
  },
  {
    keywords: [
      'sandy', 'sandy soil',
      'રેતાળ', 'રેતાળ માટી',
      'बलुई', 'बलुई मिट्टी', 'रेतीली'
    ],
    gu: 'રેતાળ',
    hi: 'बलुई',
    en: 'Sandy'
  },
  {
    keywords: [
      'clay', 'clay soil',
      'ચીકણી માટી', 'ચીકણી', 'કાળી ચીકણી',
      'चिकनी मिट्टी', 'चिकनी'
    ],
    gu: 'ચીકણી માટી',
    hi: 'चिकनी मिट्टी',
    en: 'Clay'
  },
  {
    keywords: [
      'silty', 'silt', 'silty soil',
      'કાંપવાળી', 'કાંપવાળી માટી', 'ગાડ',
      'गाद', 'गाद वाली मिट्टी'
    ],
    gu: 'કાંપવાળી',
    hi: 'गाद',
    en: 'Silty'
  },
  {
    keywords: [
      'peaty', 'peat', 'peat soil',
      'પીટ', 'પીટી',
      'पीट', 'पीट मिट्टी'
    ],
    gu: 'પીટ',
    hi: 'पीट',
    en: 'Peaty'
  },
  {
    keywords: [
      'chalky', 'chalky soil',
      'ચૂનાવાળી', 'ચૂનાવાળી માટી', 'ચૂનેદાર',
      'चूनेदार', 'चूना मिट्टी'
    ],
    gu: 'ચૂનાવાળી',
    hi: 'चूनेदार',
    en: 'Chalky'
  },
  {
    keywords: [
      'spring', 'spring season',
      'વસંત (spring)', 'વસંત', 'વસંત ઋતુ',
      'वसंत (spring)', 'वसंत', 'बसंत'
    ],
    gu: 'વસંત',
    hi: 'वसंत',
    en: 'Spring'
  },
  {
    keywords: [
      'summer', 'summer season',
      'ઉનાળો (summer)', 'ઉનાળો', 'ગ્રીષ્મ',
      'ग्रीष्म (summer)', 'ग्रीष्म', 'गर्मी', 'गर्मियों'
    ],
    gu: 'ઉનાળો',
    hi: 'ग्रीष्म',
    en: 'Summer'
  },
  {
    keywords: [
      'fall', 'autumn', 'fall / autumn',
      'શરદ / પાનખર', 'શરદ (fall)', 'શરદ', 'પાનખર',
      'शरद (fall)', 'शरद', 'पतझड़'
    ],
    gu: 'શરદ / પાનખર',
    hi: 'शरद',
    en: 'Fall / Autumn'
  },
  {
    keywords: [
      'winter', 'winter season',
      'શિયાળો (winter)', 'શિયાળો', 'શીત',
      'शीत (winter)', 'शीत', 'सर्दी', 'सर्दियों'
    ],
    gu: 'શિયાળો',
    hi: 'शीत',
    en: 'Winter'
  }
];

/** Disease & health condition names. */
const DISEASE_DICTIONARY = [
  {
    keywords: [
      'healthy plant', 'healthy', 'optimal plant',
      'તંદુરસ્ત છોડ', 'તંદુરસ્ત', 'સ્વસ્થ છોડ', 'સ્વસ્થ',
      'स्वस्थ पौधा', 'स्वस्थ', 'तंदुरुस्त पौधा'
    ],
    gu: 'તંદુરસ્ત છોડ',
    hi: 'स्वस्थ पौधा',
    en: 'Healthy Plant',
    exactOnly: true
  },
  {
    keywords: ['general condition', 'સામાન્ય સ્થિતિ', 'सामान्य स्थिति'],
    gu: 'સામાન્ય સ્થિતિ',
    hi: 'सामान्य स्थिति',
    en: 'General Condition',
    exactOnly: true
  },
  {
    keywords: ['not a plant', 'not plant', 'non plant', 'છોડ નથી', 'पौधा नहीं है'],
    gu: 'છોડ નથી',
    hi: 'पौधा नहीं है',
    en: 'Not a Plant'
  },
  {
    keywords: [
      'leaf blight', 'leaf blight disease', 'blight',
      'पत्ती झुलसाव (leaf blight)', 'पत्ती झुलसाव', 'झुलसाव',
      'પાંદડાનો સુકારો (leaf blight)', 'પાંદડાનો સુકારો', 'પાનનો સુકારો', 'સુકારો'
    ],
    gu: 'પાંદડાનો સુકારો (Leaf Blight)',
    hi: 'पत्ती झुलसाव (Leaf Blight)',
    en: 'Leaf Blight'
  },
  {
    keywords: [
      'sigatoka leaf spot', 'sigatoka', 'black sigatoka', 'yellow sigatoka',
      'સિગાટોકા પાંદડાનો ડાગ', 'સિગાટોકા', 'સિગાટોકા પાન ડાઘ',
      'सिगाटोका पत्ती धब्बा', 'सिगाटोका', 'सिगाटोका रोग'
    ],
    gu: 'સિગાટોકા પાંદડાનો ડાગ',
    hi: 'सिगाटोका पत्ती धब्बा',
    en: 'Sigatoka Leaf Spot'
  },
  {
    keywords: [
      'fruit rot', 'tomato fruit rot', 'rot', 'blossom end rot',
      'ટમેટા ફળ સડન (fruit rot)', 'ટામેટા ફળ સડન (fruit rot)', 'ટામેટા ફળ સડન', 'ટમેટા ફળ સડન', 'ફળ સડન',
      'टमाटर फल सड़न (fruit rot)', 'टमाटर फल सड़न', 'फल सड़न'
    ],
    gu: 'ટામેટા ફળ સડન (Fruit Rot)',
    hi: 'टमाटर फल सड़न (Fruit Rot)',
    en: 'Fruit Rot'
  },
  {
    keywords: [
      'early blight', 'alternaria solani',
      'અર્લી બ્લાઇટ (રોગ)', 'અર્લી બ્લાઇટ',
      'अगेती झुलसा', 'अगेती झुलसाव'
    ],
    gu: 'અર્લી બ્લાઇટ (રોગ)',
    hi: 'अगेती झुलसा',
    en: 'Early Blight'
  },
  {
    keywords: [
      'late blight', 'phytophthora infestans',
      'લેટ બ્લાઇટ (રોગ)', 'લેટ બ્લાઇટ',
      'पछेती झुलसा', 'पछेती झुलसाव'
    ],
    gu: 'લેટ બ્લાઇટ (રોગ)',
    hi: 'पछेती झुलसा',
    en: 'Late Blight'
  },
  {
    keywords: [
      'powdery mildew', 'erysiphe',
      'પાવડરી મિલ્ડ્યુ (ફૂગ)', 'પાવડરી મિલ્ડ્યુ', 'છારો',
      'पाउडरी फफूंदी', 'पाउडरी मिल्ड्यू', 'सफेद चूर्णी'
    ],
    gu: 'પાવડરી મિલ્ડ્યુ (ફૂગ)',
    hi: 'पाउडरी फफूंदी',
    en: 'Powdery Mildew'
  },
  {
    keywords: [
      'downy mildew',
      'ડાઉની મિલ્ડ્યુ (ફૂગ)', 'ડાઉની મિલ્ડ્યુ', 'ડાઉની',
      'डाउनी मिल्ड्यू', 'डाउनी फफूंदी'
    ],
    gu: 'ડાઉની મિલ્ડ્યુ',
    hi: 'डाउनी मिल्ड्यू',
    en: 'Downy Mildew'
  },
  {
    keywords: [
      'leaf spot', 'septoria leaf spot', 'cercospora', 'diplocarpon', 'black spot',
      'પાંદડાના ટપકાંનો રોગ', 'પાંદડાના ટપકાં', 'ટપકાં રોગ', 'બ્લેક સ્પોટ રોગ',
      'पत्ती के धब्बे', 'पत्तियों पर धब्बे', 'ब्लैक स्पॉट रोग'
    ],
    gu: 'પાંદડાના ટપકાંનો રોગ',
    hi: 'पत्ती के धब्बे',
    en: 'Leaf Spot'
  },
  {
    keywords: [
      'rust disease', 'rust', 'puccinia',
      'રસ્ટ રોગ', 'રસ્ટ રોગ (ગેરુ)', 'ગેરુ રોગ', 'ગેરુ', 'ગેરૂ',
      'गेरुई रोग', 'गेरुई रोग (रस्ट)', 'गेरुई', 'रस्ट रोग'
    ],
    gu: 'રસ્ટ રોગ (ગેરુ)',
    hi: 'गेरुई रोग (रस्ट)',
    en: 'Rust Disease'
  },
  {
    keywords: [
      'bacterial wilt', 'fusarium wilt', 'wilt',
      'જીવાણુ કરમાવો', 'કરમાવો', 'જીવાણુજન્ય સુકારો',
      'जीवाणु मुरझान', 'मुरझान रोग', 'उकठा'
    ],
    gu: 'જીવાણુ કરમાવો',
    hi: 'जीवाणु मुरझान',
    en: 'Bacterial Wilt'
  },
  {
    keywords: [
      'spider mites', 'spider mite', 'mites', 'mite',
      'કરોળિયા જીવાત', 'કરોળિયા જીવાત (કથીરી)', 'લાલ કરોળિયા', 'લાલ કથીરી', 'કથીરી',
      'मकड़ी कीट', 'मकड़ी कीट (माइट्स)', 'लाल मकड़ी'
    ],
    gu: 'કરોળિયા જીવાત (કથીરી)',
    hi: 'मकड़ी कीट (माइट्स)',
    en: 'Spider Mites'
  },
  {
    keywords: [
      'mosaic virus', 'tobacco mosaic', 'cucumber mosaic',
      'મોઝેક વાયરસ', 'મોઝેઈક વાયરસ', 'પચરંગિયો રોગ',
      'मोज़ेक वायरस', 'मोजेक वायरस'
    ],
    gu: 'મોઝેક વાયરસ',
    hi: 'मोज़ेक वायरस',
    en: 'Mosaic Virus'
  },
  {
    keywords: ['anthracnose', 'એન્થ્રેકનોઝ', 'एंथ्रेक्नोज'],
    gu: 'એન્થ્રેકનોઝ',
    hi: 'एंथ्रेक्नोज',
    en: 'Anthracnose'
  },
  {
    keywords: [
      'aphids', 'aphid',
      'મોલો-મસી (એફિડ્સ)', 'મોલો-મસી', 'મોલો', 'મસી',
      'माहू (एफिड्स)', 'माहू', 'चेपा', 'एफिड्स'
    ],
    gu: 'મોલો-મસી (એફિડ્સ)',
    hi: 'माहू (एफिड્સ)',
    en: 'Aphids'
  },
  {
    keywords: [
      'whitefly', 'whiteflies',
      'સફેદ માખી', 'સફેદમાખી',
      'सफेद मक्खी', 'श्वेत मक्खी'
    ],
    gu: 'સફેદ માખી',
    hi: 'सफेद मक्खी',
    en: 'Whitefly'
  },
  {
    keywords: [
      'mealybug', 'mealybugs',
      'મીલીબગ', 'ચીકણી જીવાત',
      'मिलीबग'
    ],
    gu: 'મીલીબગ',
    hi: 'मिलीबग',
    en: 'Mealybugs'
  },
  {
    keywords: [
      'thrips',
      'થ્રીપ્સ', 'થ્રિપ્સ',
      'थ्रिप्स'
    ],
    gu: 'થ્રીપ્સ',
    hi: 'थ्रिप्स',
    en: 'Thrips'
  },
  {
    keywords: [
      'chlorosis', 'yellowing', 'yellow leaves',
      'ક્લોરોસિસ (પીળા પાંદડા)', 'ક્લોરોસિસ', 'પીળા પાંદડા',
      'क्लोरोसिस (पीलापन)', 'क्लोरोसिस', 'पीलापन', 'पत्तियों का पीलापन'
    ],
    gu: 'ક્લોરોસિસ (પીળા પાંદડા)',
    hi: 'क्लोरोसिस (पीलापन)',
    en: 'Chlorosis (Yellowing)'
  },
  {
    keywords: [
      'sunburn', 'leaf scorch', 'sun scald',
      'સનબર્ન (પાંદડા બળવા)', 'સનબર્ન', 'પાન બળવા',
      'सनबर्न', 'सनबर्न (पत्तियां जलना)', 'सनस्कैल्ड', 'पत्तियों का झुलसना'
    ],
    gu: 'સનબર્ન (પાંદડા બળવા)',
    hi: 'सनबर्न (पत्तियां जलना)',
    en: 'Sunburn / Scorch'
  },

  // Categories
  { keywords: ['water issue', 'પાણીની સમસ્યા', 'पानी की समस्या'], gu: 'પાણીની સમસ્યા', hi: 'पानी की समस्या', en: 'Water Issue' },
  { keywords: ['fungal infection', 'ફૂગનો ચેપ', 'फंगल संक्रमण'], gu: 'ફૂગનો ચેપ', hi: 'फंगल संक्रमण', en: 'Fungal Infection' },
  { keywords: ['bacterial infection', 'બેક્ટેરિયલ ચેપ', 'बैक्टीरियल संक्रमण'], gu: 'બેક્ટેરિયલ ચેપ', hi: 'बैक्टीरियल संक्रमण', en: 'Bacterial Infection' },
  { keywords: ['pest infestation', 'જીવાતનો ઉપદ્રવ', 'कीट प्रकोप'], gu: 'જીવાતનો ઉપદ્રવ', hi: 'कीट प्रकोप', en: 'Pest Infestation' },
  { keywords: ['nutrient deficiency', 'પોષક તત્વોની ઉણપ', 'पोषक तत्वों की कमी'], gu: 'પોષક તત્વોની ઉણપ', hi: 'पोषक तत्वों की कमी', en: 'Nutrient Deficiency' },
];

/** AI diagnosis sentences and prevention tips (whole-text lookup). */
const DISEASE_TEXT_DICTIONARY = [
  {
    keywords: ['no diseases detected. the plant looks healthy.', 'no diseases detected', 'the plant looks healthy'],
    gu: 'કોઈ રોગ જણાયો નથી. છોડ તંદુરસ્ત દેખાય છે.',
    hi: 'कोई रोग नहीं पाया गया। पौधा स्वस्थ दिख रहा है।',
    en: 'No diseases detected. The plant looks healthy.'
  },
  {
    keywords: [
      'your plant appears healthy! continue with good care practices: proper watering, adequate sunlight, and regular monitoring.',
      'your plant appears healthy! continue with good care practices',
      'your plant appears healthy'
    ],
    gu: 'તમારો છોડ તંદુરસ્ત જણાય છે! સારી કાળજી ચાલુ રાખો: યોગ્ય પાણી, પર્યાપ્ત સૂર્યપ્રકાશ અને નિયમિત દેખરેખ.',
    hi: 'आपका पौधा स्वस्थ दिखाई दे रहा है! अच्छी देखभाल जारी रखें: उचित पानी, पर्याप्त धूप और नियमित निगरानी।',
    en: 'Your plant appears healthy! Continue with good care practices: proper watering, adequate sunlight, and regular monitoring.'
  },
  {
    keywords: ['continue with good care practices: proper watering, adequate sunlight, and regular monitoring.'],
    gu: 'સારી કાળજી ચાલુ રાખો: યોગ્ય પાણી, પર્યાપ્ત સૂર્યપ્રકાશ અને નિયમિત દેખરેખ.',
    hi: 'अच्छी देखभाल जारी रखें: उचित पानी, पर्याप्त धूप और नियमित निगरानी।',
    en: 'Continue with good care practices: proper watering, adequate sunlight, and regular monitoring.'
  },
  {
    keywords: ['no specific treatment available.'],
    gu: 'કોઈ ચોક્કસ સારવાર ઉપલબ્ધ નથી.',
    hi: 'कोई विशिष्ट उपचार उपलब्ध नहीं है।',
    en: 'No specific treatment available.'
  },

  // Prevention tips
  { keywords: ['regularly monitor plant health'], gu: 'છોડના સ્વાસ્થ્યનું નિયમિત નિરીક્ષણ કરો', hi: 'पौधे के स्वास्थ्य की नियमित निगरानी करें', en: 'Regularly monitor plant health' },
  { keywords: ['maintain consistent care routine'], gu: 'નિયમિત સંભાળની દિનચર્યા જાળવો', hi: 'नियमित देखभाल दिनचर्या बनाए रखें', en: 'Maintain consistent care routine' },
  { keywords: ['keep growing area clean'], gu: 'ઉછેર વિસ્તાર સ્વચ્છ રાખો', hi: 'उगाने वाले क्षेत्र को साफ रखें', en: 'Keep growing area clean' },
  { keywords: ['use quality soil and fertilizer'], gu: 'ગુણવત્તાયુક્ત માટી અને ખાતરનો ઉપયોગ કરો', hi: 'गुणवत्तापूर्ण मिट्टी और खाद का उपयोग करें', en: 'Use quality soil and fertilizer' },
  { keywords: ['allow soil to dry between waterings'], gu: 'પાણી આપવાની વચ્ચે માટીને સૂકવવા દો', hi: 'पानी देने के बीच मिट्टी को सूखने दें', en: 'Allow soil to dry between waterings' },
  { keywords: ['use well-draining potting mix'], gu: 'સારી નિકાલ વ્યવસ્થા ધરાવતી માટીનો ઉપયોગ કરો', hi: 'अच्छे जल निकासी वाले पोटिंग मिक्स का प्रयोग करें', en: 'Use well-draining potting mix' },
  { keywords: ['water in the morning to reduce evaporation'], gu: 'બાષ્પીભવન ઘટાડવા સવારે પાણી આપો', hi: 'वाष्पीकरण कम करने के लिए सुबह पानी दें', en: 'Water in the morning to reduce evaporation' },
  { keywords: ['check drainage holes are not blocked'], gu: 'ડ્રેનેજ છિદ્રો બ્લોક નથી તે તપાસો', hi: 'जांचें कि जल निकासी छेद बंद तो नहीं हैं', en: 'Check drainage holes are not blocked' },
  { keywords: ['improve air circulation around plants'], gu: 'છોડની આસપાસ હવાની અવરજવર સુધારો', hi: 'पौधों के आसपास हवा का संचार बेहतर करें', en: 'Improve air circulation around plants' },
  { keywords: ['water at the base, not on leaves'], gu: 'પાંદડા પર નહીં પણ મૂળમાં પાણી આપો', hi: 'पत्तियों पर नहीं, जड़ में पानी दें', en: 'Water at the base, not on leaves' },
  { keywords: ['remove affected leaves immediately'], gu: 'અસરગ્રસ્ત પાંદડા તરત જ દૂર કરો', hi: 'प्रभावित पत्तियों को तुरंत हटा दें', en: 'Remove affected leaves immediately' },
  { keywords: ['apply preventative fungicide in humid conditions'], gu: 'ભેજવાળા વાતાવરણમાં નિવારક ફૂગનાશક લગાવો', hi: 'नम मौसम में निवारक कवकनाशी का प्रयोग करें', en: 'Apply preventative fungicide in humid conditions' },
  { keywords: ['regularly inspect plants for pests'], gu: 'જીવાતો માટે છોડનું નિયમિત નિરીક્ષણ કરો', hi: 'कीटों के लिए पौधों का नियमित निरीक्षण करें', en: 'Regularly inspect plants for pests' },
  { keywords: ['use neem oil as a natural deterrent'], gu: 'કુદરતી ઉપાય તરીકે લીમડાના તેલનો ઉપયોગ કરો', hi: 'प्राकृतिक निवारक के रूप में नीम के तेल का प्रयोग करें', en: 'Use neem oil as a natural deterrent' },
  { keywords: ['introduce beneficial insects like ladybugs'], gu: 'લેડીબગ જેવા ફાયદાકારક કીટકો દાખલ કરો', hi: 'लेडीबग जैसे लाभकारी कीटों का उपयोग करें', en: 'Introduce beneficial insects like ladybugs' },
  { keywords: ['quarantine new plants before introducing'], gu: 'નવા છોડને અન્ય છોડ પાસે મૂકતા પહેલા અલગ રાખો', hi: 'नए पौधों को शामिल करने से पहले अलग रखें', en: 'Quarantine new plants before introducing' },
];

const GARDEN_DICTIONARY = [
  { keywords: ["priya's balcony farm", 'balcony farm'], gu: 'પ્રિયાનું બાલ્કની ફાર્મ', hi: 'प्रिया का बालकनी फार्म', en: "Priya's Balcony Farm" },
  { keywords: ["priya's trace garden", "priya's terrace garden", 'terrace garden', 'trace garden'], gu: 'પ્રિયાનું ટેરેસ ગાર્ડન', hi: 'प्रिया का टेरेस गार्डन', en: "Priya's Terrace Garden" },
  { keywords: ['backyard garden'], gu: 'પાછળનું આંગણું બગીચો', hi: 'पीछे का आंगन बगीचा', en: 'Backyard Garden' },
  { keywords: ['rooftop organic bed', 'rooftop garden'], gu: 'ધાબા પરનો ઓર્ગેનિક બગીચો', hi: 'छत का ऑर्गेनिक बगीचा', en: 'Rooftop Organic Garden' },
  {
    keywords: ['small but productive balcony setup with containers.'],
    gu: 'કન્ટેનર સાથે નાનું પરંતુ ઉત્પાદક બાલ્કની સેટઅપ.',
    hi: 'कंटेनरों के साथ छोटा लेकिन उत्पादक बालकनी सेटअप।',
    en: 'Small but productive balcony setup with containers.'
  },
  { keywords: ['botad, india', 'botad india'], gu: 'બોટાદ, ભારત', hi: 'बोताद, भारत', en: 'Botad, India' },
  { keywords: ['mumbai, india', 'mumbai india'], gu: 'મુંબઈ, ભારત', hi: 'मुंबई, भारत', en: 'Mumbai, India' },
  { keywords: ['mumbai, maharashtra'], gu: 'મુંબઈ, મહારાષ્ટ્ર', hi: 'मुंबई, महाराष्ट्र', en: 'Mumbai, Maharashtra' },
  { keywords: ['rajkot, gujarat'], gu: 'રાજકોટ, ગુજરાત', hi: 'राजकोट, गुजरात', en: 'Rajkot, Gujarat' },
  { keywords: ['ahmedabad, gujarat'], gu: 'અમદાવાદ, ગુજરાત', hi: 'अहमदाबाद, गुजरात', en: 'Ahmedabad, Gujarat' },
  { keywords: ['botad'], gu: 'બોટાદ', hi: 'बोताद', en: 'Botad' },
  { keywords: ['india'], gu: 'ભારત', hi: 'भारत', en: 'India' },
];

const COMMUNITY_DICTIONARY = [
  { keywords: ['master gardener'], gu: 'માસ્ટર ગાર્ડનર', hi: 'मास्टर माली', en: 'Master Gardener' },
  { keywords: ['green thumb'], gu: 'ગ્રીન થમ્બ', hi: 'कुशल बागवान', en: 'Green Thumb' },
  { keywords: ['urban farmer'], gu: 'અર્બન ફાર્મર', hi: 'शहरी किसान', en: 'Urban Farmer' },
  { keywords: ['seedling'], gu: 'અંકુર (સીડલિંગ)', hi: 'अंकुर (सीडलिंग)', en: 'Seedling' },

  { keywords: ['thriving sanctuary 🌱', 'thriving sanctuary'], gu: 'સમૃદ્ધ અભયારણ્ય 🌱', hi: 'समृद्ध अभयारण्य 🌱', en: 'Thriving Sanctuary 🌱' },
  { keywords: ['live feed'], gu: 'લાઇવ ફીડ', hi: 'लाइव फीड', en: 'Live Feed' },
  { keywords: ['posts shared'], gu: 'શેર કરેલ પોસ્ટ્સ', hi: 'साझा की गई पोस्ट्स', en: 'Posts Shared' },
  { keywords: ['active growers'], gu: 'સક્રિય ખેડૂતો', hi: 'सक्रिय बागवान', en: 'Active Growers' },
  { keywords: ['harvest stories'], gu: 'લણણી વાર્તાઓ', hi: 'उपज की कहानियां', en: 'Harvest Stories' },

  { keywords: ['harvest showcase'], gu: 'લણણી પ્રદર્શન', hi: 'उपज प्रदर्शन', en: 'Harvest Showcase' },
  { keywords: ['general discussion'], gu: 'સામાન્ય ચર્ચા', hi: 'सामान्य चर्चा', en: 'General Discussion' },
  { keywords: ['plant help / diagnose request'], gu: 'છોડ સહાય / નિદાન વિનંતી', hi: 'पौधे की मदद / निदान अनुरोध', en: 'Plant Help / Diagnose Request' },
  { keywords: ['urban tip / diy'], gu: 'શહેરી ખેતી ટિપ / DIY', hi: 'शहरी बागवानी टिप / DIY', en: 'Urban Tip / DIY' },
  { keywords: ['community event'], gu: 'સમુદાય કાર્યક્રમ', hi: 'समुदाय कार्यक्रम', en: 'Community Event' },

  {
    keywords: ['🍅 my cherry tomatoes are finally ready!', 'my cherry tomatoes are finally ready'],
    gu: '🍅 મારા ચેરી ટામેટાં આખરે તૈયાર છે!',
    hi: '🍅 मेरे चेरी टमाटर आखिरकार तैयार हैं!',
    en: '🍅 My cherry tomatoes are finally ready!'
  },
  {
    keywords: ['after 45 days of careful watering and staking, my sweet 100 cherry tomatoes are starting to turn red.'],
    gu: '45 દિવસની કાળજીપૂર્વક પાણી આપ્યા અને ટેકો આપ્યા પછી, મારા સ્વીટ 100 ચેરી ટામેટાં લાલ થવા લાગ્યા છે. અહીં મારી ટોચની ટિપ્સ છે: (1) દરરોજ મૂળમાં પાણી આપો, (2) છોડ ભારે થાય તે પહેલાં ટેકો આપો, (3) વધુ સારા ફળ માટે સકર્સ ચૂંટો.',
    hi: '45 दिनों तक सावधानीपूर्वक पानी देने और सहारा देने के बाद, मेरे स्वीट 100 चेरी टमाटर लाल होने लगे हैं। यहाँ मेरे शीर्ष सुझाव हैं: (1) रोजाना जड़ में पानी दें, (2) पौधा भारी होने से पहले सहारा दें, (3) बेहतर फल के लिए सकर हटाएं।',
    en: 'After 45 days of careful watering and staking, my Sweet 100 cherry tomatoes are starting to turn red.'
  },
  {
    keywords: ['amazing! mine are still flowering. any tip for speeding up fruit set?'],
    gu: 'ખૂબ સરસ! મારા છોડમાં હજી ફૂલો આવી રહ્યા છે. ફળ ઝડપથી બેસવા માટે કોઈ ટિપ?',
    hi: 'बहुत बढ़िया! मेरे अभी भी फूल रहे हैं। फल तेजी से लगने के लिए कोई टिप?',
    en: 'Amazing! Mine are still flowering. Any tip for speeding up fruit set?'
  },
  {
    keywords: ['looks great! i just planted mine last week. hoping for similar results.'],
    gu: 'ખૂબ સરસ દેખાય છે! મેં ગયા અઠવાડિયે જ મારા છોડ રોપ્યા છે. આવા જ પરિણામોની આશા છે.',
    hi: 'बहुत अच्छा लग रहा है! मैंने पिछले हफ्ते ही अपना लगाया था। ऐसे ही परिणामों की उम्मीद है।',
    en: 'Looks great! I just planted mine last week. Hoping for similar results.'
  },
  {
    keywords: ['@arjun mehta aur mehat aapna number do handsome', 'aur mehat aapna number do handsome'],
    gu: '@અર્જુન મહેતા તમારો નંબર આપો',
    hi: '@अर्जुन मेहता अपना नंबर दो',
    en: '@Arjun Mehta please share your number'
  },
  {
    keywords: ['@arjun mehta tum abhi tak numer nhi send kiya', 'tum abhi tak numer nhi send kiya'],
    gu: '@અર્જુન મહેતા તમે હજી સુધી નંબર નથી મોકલ્યો',
    hi: '@अर्जुन मेहता तुमने अभी तक नंबर नहीं भेजा',
    en: '@Arjun Mehta you have not sent the number yet'
  },
  {
    keywords: ['@priya sharma mera number chalega priya', 'mera number chalega priya'],
    gu: '@પ્રિયા શર્મા મારો નંબર ચાલશે પ્રિયા',
    hi: '@प्रिया शर्मा मेरा नंबर चलेगा प्रिया',
    en: '@Priya Sharma will my number work?'
  },
  {
    keywords: ['@anonymous o meri purani id thi', 'o meri purani id thi'],
    gu: '@અનામી એ મારી જૂની આઈડી હતી',
    hi: '@अनाम वो मेरी पुरानी आईडी थी',
    en: '@Anonymous that was my old ID'
  },
  {
    keywords: ['best herbs for a mumbai balcony?'],
    gu: 'મુંબઈની બાલ્કની માટે શ્રેષ્ઠ ઔષધિઓ?',
    hi: 'मुंबई की बालकनी के लिए सबसे अच्छी जड़ी-बूटियाँ?',
    en: 'Best herbs for a Mumbai balcony?'
  },
  {
    keywords: ["i have a west-facing balcony that gets 4-5 hours of sunlight. currently growing mint and basil."],
    gu: 'મારી પાસે પશ્ચિમ તરફની બાલ્કની છે જ્યાં 4-5 કલાક સૂર્યપ્રકાશ મળે છે. હાલમાં ફુદીનો અને તુલસી ઉગાડું છું. અહીં અન્ય કઈ ઔષધિઓ સારી રીતે ઉગી શકે? હું કોથમરી અથવા મીઠો લીમડો વિચારું છું. સમુદાયના સૂચનો આવકાર્ય છે!',
    hi: 'मेरे पास पश्चिम मुखी बालकनी है जहाँ 4-5 घंटे धूप आती है। वर्तमान में पुदीना और तुलसी उगा रहा हूँ। यहाँ और कौन सी जड़ी-बूटियाँ पनपेंगी? मैं धनिया या कड़ी पत्ता सोच रहा हूँ। समुदाय की राय चाहिए!',
    en: 'I have a west-facing balcony that gets 4-5 hours of sunlight. Currently growing mint and basil.'
  },
  {
    keywords: ['curry leaf is perfect for mumbai climate! it loves heat and humidity.'],
    gu: 'મુંબઈના વાતાવરણ માટે મીઠો લીમડો ઉત્તમ છે! તેને ગરમી અને ભેજ ગમે છે. જોકે ગરમીમાં કોથમરી ઝડપથી બગડી જાય છે — શિયાળામાં પ્રયાસ કરો.',
    hi: 'मुंबई के मौसम के लिए कड़ी पत्ता बिल्कुल सही है! इसे गर्मी और नमी पसंद है। हालांकि गर्मी में धनिया जल्दी खराब हो जाता है — सर्दियों में प्रयास करें।',
    en: 'Curry leaf is perfect for Mumbai climate! It loves heat and humidity.'
  },
  { keywords: ['hello'], gu: 'નમસ્તે', hi: 'नमस्ते', en: 'Hello' },
  {
    keywords: ['what r u doing priya', 'what are you doing priya'],
    gu: 'તમે શું કરી રહ્યા છો પ્રિયા',
    hi: 'आप क्या कर रहे हैं प्रिया',
    en: 'What are you doing Priya'
  },
  {
    keywords: ['💡 tip: use banana peel water for potassium boost', 'tip: use banana peel water for potassium boost', 'use banana peel water for potassium boost'],
    gu: '💡 ટિપ: પોટેશિયમ વધારવા કેળાની છાલના પાણીનો ઉપયોગ કરો',
    hi: '💡 टिप: पोटेशियम बढ़ाने के लिए केले के छिलके के पानी का उपयोग करें',
    en: '💡 Tip: Use banana peel water for potassium boost'
  },
  {
    keywords: ['soak 2-3 banana peels in a litre of water for 48 hours.'],
    gu: '2-3 કેળાની છાલને એક લિટર પાણીમાં 48 કલાક પલાળી રાખો. ગાળીને ફૂલોવાળા છોડ માટે પ્રવાહી ખાતર તરીકે વાપરો. તે પોટેશિયમ અને ફોસ્ફરસથી ભરપૂર છે — ફળ આવવાના સમયે ટામેટાં અને મરચાં માટે ઉત્તમ છે. તદ્દન મફત અને કચરામુક્ત!',
    hi: '2-3 केले के छिलकों को एक लीटर पानी में 48 घंटे के लिए भिगो दें। छानकर फूलों वाले पौधों के लिए तरल खाद के रूप में प्रयोग करें। यह पोटेशियम और फास्फोरस से भरपूर है — फल लगने के समय टमाटर और मिर्च के लिए एकदम सही। पूरी तरह से मुफ्त और शून्य अपशिष्ट!',
    en: 'Soak 2-3 banana peels in a litre of water for 48 hours.'
  },
  { keywords: ['ok got it'], gu: 'ઠીક છે, સમજાઈ ગયું', hi: 'ठीक है, समझ गया', en: 'Ok got it' },
  {
    keywords: ['leaves turning yellow on my tomato seedling'],
    gu: 'મારા ટામેટાંના રોપા પર પાંદડા પીળા પડી રહ્યા છે',
    hi: 'मेरे टमाटर के पौधे की पत्तियाँ पीली पड़ रही हैं',
    en: 'Leaves turning yellow on my tomato seedling'
  },
  {
    keywords: ["i just started gardening and my tomato seedling's lower leaves are turning yellow"],
    gu: 'મેં હમણાં જ બાગકામ શરૂ કર્યું છે અને લગભગ 10 દિવસ પછી મારા ટામેટાંના રોપાના નીચેના પાંદડા પીળા પડી રહ્યા છે. હું તેને દરરોજ પાણી આપું છું. શું આ વધુ પડતું પાણી આપવાને કારણે છે? કોઈ સલાહ આપશો!',
    hi: 'मैंने अभी-अभी बागवानी शुरू की है और लगभग 10 दिनों के बाद मेरे टमाटर के पौधे की निचली पत्तियाँ पीली पड़ने लगी हैं। मैं इसे रोज पानी देता हूँ। क्या यह अधिक पानी देने के कारण है? कोई सलाह मिले तो आभारी रहूँगा!',
    en: "I just started gardening and my tomato seedling's lower leaves are turning yellow"
  },
  {
    keywords: ['yes, classic overwatering! let the soil dry out slightly between waterings.', 'yes, classic overwatering!'],
    gu: 'હા, વધુ પડતું પાણી આપવાનું આ સામાન્ય લક્ષણ છે! પાણી આપવાની વચ્ચે માટીને થોડી સૂકવવા દો. તમારી આંગળીને માટીમાં 2 સેમી ઊંડે નાખો — જ્યારે તે સૂકી લાગે ત્યારે જ પાણી આપો.',
    hi: 'हाँ, यह अधिक पानी देने का स्पष्ट संकेत है! पानी देने के बीच मिट्टी को थोड़ा सूखने दें। अपनी उंगली को मिट्टी में 2 सेमी डालें — जब यह सूखी लगे तभी पानी दें।',
    en: 'Yes, classic overwatering! Let the soil dry out slightly between waterings.'
  },
  {
    keywords: ['arjun can u provide me your number', 'arjun can you provide me your number'],
    gu: 'અર્જુન શું તમે મને તમારો નંબર આપી શકો છો?',
    hi: 'अर्जुन क्या आप मुझे अपना नंबर दे सकते हैं?',
    en: 'Arjun can you provide me your number'
  },
  { keywords: ['harvesting'], gu: 'લણણી (ઉપજ)', hi: 'कटाई (उपज)', en: 'Harvesting' },
  {
    keywords: ['i am very glad that , i have used this app', 'i am very glad that i have used this app'],
    gu: 'મને ખૂબ આનંદ છે કે મેં આ એપનો ઉપયોગ કર્યો.',
    hi: 'मुझे बहुत खुशी है कि मैंने इस ऐप का उपयोग किया।',
    en: 'I am very glad that I have used this app.'
  },
  {
    keywords: ['about environment sefaty', 'about environment safety'],
    gu: 'પર્યાવરણ સુરક્ષા વિશે.',
    hi: 'पर्यावरण सुरक्षा के बारे में।',
    en: 'About environment safety'
  },
  {
    keywords: ['we r going to about the ..discus about ..how can we protect or environment from capatilist.'],
    gu: 'આપણે પર્યાવરણનું રક્ષણ કેવી રીતે કરી શકીએ તે વિશે ચર્ચા કરીએ.',
    hi: 'हम पर्यावरण की रक्षा कैसे कर सकते हैं, इस बारे में चर्चा करते हैं।',
    en: 'Let us discuss how we can protect our environment.'
  },
  {
    keywords: ['ok priya .. lets discuss', 'ok priya .. lets discus', 'ok priya.. lets discuss', 'ok priya'],
    gu: 'ઠીક છે પ્રિયા .. ચાલો ચર્ચા કરીએ',
    hi: 'ठीक है प्रिया .. चलो चर्चा करते हैं',
    en: "Ok Priya, let's discuss"
  },
  { keywords: ['this is my new plant'], gu: 'આ મારો નવો છોડ છે', hi: 'यह मेरा नया पौधा है', en: 'This is my new plant' },
  { keywords: ["plant's life", 'plants life', 'plant life'], gu: 'છોડનું જીવન', hi: 'पौधों का जीवन', en: "Plant's Life" },
  { keywords: ['plants are planet'], gu: 'છોડ એ આપણો ગ્રહ છે.', hi: 'पौधे ही हमारी पृथ्वी हैं।', en: 'Plants are planet.' },
  { keywords: ['save earth'], gu: 'પૃથ્વી બચાવો', hi: 'पृथ्वी बचाओ', en: 'Save Earth' },
  {
    keywords: ['first time growing mint in small containers! smells amazing.'],
    gu: 'નાના કૂંડામાં પહેલીવાર ફુદીનો ઉગાડ્યો! સુગંધ અદ્ભુત છે.',
    hi: 'छोटे बर्तनों में पहली बार पुदीना उगाया! खुशबू बहुत बढ़िया है।',
    en: 'First time growing mint in small containers! Smells amazing.'
  },
  {
    keywords: ['organic pest repellent recipe: mix neem oil with soap water and spray weekly.'],
    gu: 'ઓર્ગેનિક જંતુનાશક રેસીપી: લીમડાના તેલને સાબુના પાણી સાથે મિક્સ કરો અને દર અઠવાડિયે છંટકાવ કરો.',
    hi: 'जैविक कीट विकर्षक नुस्खा: नीम के तेल को साबुन के पानी में मिलाएं और साप्ताहिक छिड़काव करें।',
    en: 'Organic pest repellent recipe: mix neem oil with soap water and spray weekly.'
  },
  {
    keywords: ['rooftop harvest of cherry tomatoes and bell peppers! delicious results.'],
    gu: 'ધાબા પરથી ચેરી ટામેટાં અને શિમલા મરચાંની લણણી! સ્વાદિષ્ટ પરિણામો.',
    hi: 'छत से चेरी टमाटर और शिमला मिर्च की उपज! स्वादिष्ट परिणाम।',
    en: 'Rooftop harvest of cherry tomatoes and bell peppers! Delicious results.'
  },
];

const WATERING_AND_WEATHER_DICTIONARY = [
  { keywords: ['optimal conditions - follow schedule'], gu: 'શ્રેષ્ઠ સ્થિતિ - સમયપત્રક મુજબ ચાલો', hi: 'अनुकूल परिस्थितियाँ - अनुसूची का पालन करें', en: 'Optimal conditions - follow schedule' },
  { keywords: ['rain expected today - skip watering!'], gu: 'આજે વરસાદની શક્યતા - પાણી આપવાનું ટાળો!', hi: 'आज बारिश की संभावना - पानी देना टालें!', en: 'Rain expected today - skip watering!' },
  { keywords: ['extreme heat - water in the evening!'], gu: 'અતિશય ગરમી - સાંજે પાણી આપો!', hi: 'अत्यधिक गर्मी - शाम को पानी दें!', en: 'Extreme heat - water in the evening!' },
  { keywords: ['hot day - consider extra watering'], gu: 'ગરમ દિવસ - વધારાનું પાણી આપવાનું વિચારો', hi: 'गर्म दिन - अतिरिक्त पानी देने पर विचार करें', en: 'Hot day - consider extra watering' },
  { keywords: ['high humidity - reduce watering'], gu: 'વધુ ભેજ - પાણી ઓછું આપો', hi: 'उच्च आर्द्रता - पानी कम दें', en: 'High humidity - reduce watering' },
  { keywords: ['low humidity - increase misting'], gu: 'ઓછો ભેજ - વધુ છંટકાવ કરો', hi: 'कम आर्द्रता - मिस्टिंग बढ़ाएं', en: 'Low humidity - increase misting' },
  { keywords: ['soil is dry - consider watering'], gu: 'માટી સૂકી છે - પાણી આપવાનું વિચારો', hi: 'मिट्टी सूखी है - पानी देने पर विचार करें', en: 'Soil is dry - consider watering' },

  { keywords: ['hot weather - extra water', 'hot weather extra water'], gu: 'ગરમ હવામાન — વધારાનું પાણી', hi: 'गर्म मौसम — अतिरिक्त पानी', en: 'Hot weather - extra water' },
  { keywords: ['rain forecasted - skip watering', 'rain forecasted skip watering'], gu: 'વરસાદની આગાહી — પાણી ન આપવું', hi: 'बारिश का पूर्वानुमान — पानी न दें', en: 'Rain forecasted - skip watering' },
  { keywords: ['skipped by user'], gu: 'વપરાશકર્તા દ્વારા રદ કરાયું', hi: 'उपयोगकर्ता द्वारा छोड़ा गया', en: 'Skipped by user' },
  { keywords: ['heatwave boost (+20%)', 'heatwave boost'], gu: 'હીટવેવ બૂસ્ટ (+20%)', hi: 'हीटवेव बूस्ट (+20%)', en: 'Heatwave boost (+20%)' },
  { keywords: ['rain delay applied! skipping watering for 3 days.', 'rain delay applied'], gu: 'વરસાદ વિલંબ લાગુ કર્યો', hi: 'बारिश की देरी लागू की गई', en: 'Rain delay applied' },
  { keywords: ['heatwave boost applied! increased all volumes by 20%.', 'heatwave boost applied'], gu: 'હીટવેવ બૂસ્ટ લાગુ કર્યું', hi: 'हीटवेव बूस्ट लागू किया गया', en: 'Heatwave boost applied' },
  { keywords: ['weather adjusted'], gu: 'હવામાન સમાયોજિત', hi: 'मौसम अनुसार समायोजित', en: 'Weather adjusted' },
  { keywords: ['rest (0ml)'], gu: 'વિરામ (0ml)', hi: 'विश्राम (0ml)', en: 'Rest (0ml)' },

  { keywords: ['morning'], gu: 'સવાર', hi: 'सुबह', en: 'Morning' },
  { keywords: ['afternoon'], gu: 'બપોર', hi: 'दोपहर', en: 'Afternoon' },
  { keywords: ['evening'], gu: 'સાંજ', hi: 'शाम', en: 'Evening' },
  { keywords: ['night'], gu: 'રાત', hi: 'रात', en: 'Night' },

  { keywords: ['unknown plant', 'unknown'], gu: 'અજાણ્યો છોડ', hi: 'अज्ञात पौधा', en: 'Unknown Plant' },
  { keywords: ['current soil moisture'], gu: 'હાલનો માટી ભેજ', hi: 'वर्तमान मिट्टी की नमी', en: 'Current soil moisture' },
  { keywords: ['dry'], gu: 'સૂકી', hi: 'सूखी', en: 'Dry' },
  { keywords: ['good'], gu: 'સારો', hi: 'अच्छा', en: 'Good' },
];

/** Task title patterns. */
const TASK_PATTERNS = [
  { re: /^water\s+(.+)$/i, gu: (t) => `${t} માં પાણી આપો`, hi: (t) => `${t} में पानी दें`, en: (t) => `Water ${t}` },
  { re: /^prune\s+(.+)$/i, gu: (t) => `${t} ની કાપણી કરો`, hi: (t) => `${t} की छंटाई करें`, en: (t) => `Prune ${t}` },
  { re: /^(?:fertilize|feed)\s+(.+)$/i, gu: (t) => `${t} ને ખાતર આપો`, hi: (t) => `${t} को खाद दें`, en: (t) => `Fertilize ${t}` },
  { re: /^harvest\s+(.+)$/i, gu: (t) => `${t} ની લણણી કરો`, hi: (t) => `${t} की कटाई करें`, en: (t) => `Harvest ${t}` },
  { re: /^(?:plant|sow)\s+(.+)$/i, gu: (t) => `${t} રોપો`, hi: (t) => `${t} लगाएं`, en: (t) => `Plant ${t}` },
  { re: /^(?:pest check|check pests on|inspect)\s+(.+)$/i, gu: (t) => `${t} પર જીવાત તપાસો`, hi: (t) => `${t} पर कीटों की जाँच करें`, en: (t) => `Inspect ${t}` },
  { re: /^repot\s+(.+)$/i, gu: (t) => `${t} ને નવા કૂંડામાં રોપો`, hi: (t) => `${t} को नए गमले में लगाएं`, en: (t) => `Repot ${t}` },
  { re: /^mist\s+(.+)$/i, gu: (t) => `${t} પર પાણીનો છંટકાવ કરો`, hi: (t) => `${t} पर पानी का छिड़काव करें`, en: (t) => `Mist ${t}` },
];

// ---------------------------------------------------------------------------
// Index building (runs once at module load)
// ---------------------------------------------------------------------------

const PREFIX_LEN = 35;
const MAX_CACHE = 1500;

/** Lowercase, unify dashes/apostrophes, collapse whitespace. */
const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Remove trailing punctuation. */
const stripEnd = (s) => s.replace(/[\s.,!?:;-]+$/, '').trim();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EXACT = new Map();
const PREFIX = new Map();

/** All dictionaries searched for whole-text matches, in priority order. */
const CROP_ADVICE_DICTIONARY = [
  // Descriptions & Reasons
  {
    keywords: [
      'heat-loving, productive in warm climates. both sweet and hot varieties.',
      'heat-loving, productive in warm climates. both sweet and hot varieties',
      'heat-loving, productive in warm climates',
      'heat loving, productive in warm climates. both sweet and hot varieties.'
    ],
    gu: 'ગરમી-અનુકૂળ, ગરમ આબોહવામાં ઉચ્ચ ઉત્પાદક. તીખી અને મીઠી બંને જાતો ઉપલબ્ધ.',
    hi: 'गर्मी-अनुकूल, गर्म मौसम में अत्यधिक उत्पादक। तीखी और मीठी दोनों किस्में उपलब्ध।',
    en: 'Heat-loving, productive in warm climates. Both sweet and hot varieties.'
  },
  {
    keywords: [
      'cool-season crop, fast growing. great for continuous harvest.',
      'cool-season crop, fast growing. great for continuous harvest',
      'cool-season crop, fast growing',
      'cool season crop, fast growing. great for continuous harvest.'
    ],
    gu: 'શિયાળુ પાક, ઝડપી વૃદ્ધિ. સતત નિયમિત લણણી માટે ઉત્તમ.',
    hi: 'शीतकालीन फसल, तेजी से बढ़ने वाली। निरंतर कटाई के लिए बेहतरीन।',
    en: 'Cool-season crop, fast growing. Great for continuous harvest.'
  },
  {
    keywords: [
      'fast-growing leafy green, great for succession planting in compact spaces.',
      'fast-growing leafy green, great for succession planting'
    ],
    gu: 'ઝડપથી વિકસતી ભાજી, નાની જગ્યાઓમાં સતત વાવણી માટે ઉત્તમ.',
    hi: 'तेजी से बढ़ने वाली पत्तेदार सब्जी, छोटी जगहों में निरंतर रोपण के लिए उत्तम।',
    en: 'Fast-growing leafy green, great for succession planting in compact spaces.'
  },
  {
    keywords: [
      'easy to grow in containers, thrives in warm weather with full sunlight.',
      'easy to grow in containers, thrives in warm weather'
    ],
    gu: 'કૂંડામાં ઉગાડવું સરળ, સંપૂર્ણ સૂર્યપ્રકાશ અને ગરમ હવામાનમાં ખૂબ સારો વિકાસ.',
    hi: 'गमलों में उगाना आसान, पूर्ण धूप और गर्म मौसम में बहुत अच्छा विकास।',
    en: 'Easy to grow in containers, thrives in warm weather with full sunlight.'
  },
  {
    keywords: [
      'heavy feeder, requires rich soil and consistent moisture for sweet fruits.',
      'heavy feeder, requires rich soil and consistent moisture'
    ],
    gu: 'ફળદ્રુપ માટી અને મીઠા ફળો માટે સતત ભેજની જરૂરિયાત ધરાવે છે.',
    hi: 'उपजाऊ मिट्टी और मीठे फलों के लिए निरंतर नमी की आवश्यकता होती है।',
    en: 'Heavy feeder, requires rich soil and consistent moisture for sweet fruits.'
  },
  {
    keywords: [
      'deep root vegetable, thrives in loose, stone-free soil.',
      'deep root vegetable, thrives in loose soil'
    ],
    gu: 'ઊંડા મૂળ ધરાવતું શાકભાજી, પોચી અને પથ્થર વગરની માટીમાં ઉત્તમ વિકાસ.',
    hi: 'गहरी जड़ वाली सब्जी, भुरभुरी और पत्थर-रहित मिट्टी में उत्तम विकास।',
    en: 'Deep root vegetable, thrives in loose, stone-free soil.'
  },
  {
    keywords: [
      'tolerates partial shade, perfect for urban balconies and small pots.',
      'tolerates partial shade, perfect for urban balconies'
    ],
    gu: 'અંશતઃ છાંયડામાં પણ સારો વિકાસ, શહેરી બાલ્કની અને નાના કૂંડા માટે શ્રેષ્ઠ.',
    hi: 'आंशिक छाया भी सहनशील, शहरी बालकनी और छोटे गमलों के लिए उपयुक्त।',
    en: 'Tolerates partial shade, perfect for urban balconies and small pots.'
  },
  {
    keywords: [
      'high yield in small footprint, perfect for vertical gardening and trellises.',
      'high yield in small footprint'
    ],
    gu: 'ઓછી જગ્યામાં વધુ ઉત્પાદન, વર્ટિકલ ગાર્ડનિંગ અને માંડવા માટે ઉત્તમ.',
    hi: 'कम जगह में अधिक पैदावार, वर्टिकल गार्डनिंग और मचान के लिए बेहतरीन।',
    en: 'High yield in small footprint, perfect for vertical gardening and trellises.'
  },
  {
    keywords: [
      'aromatic culinary herb, repels common garden pests and thrives in well-drained soil.',
      'aromatic culinary herb, repels common garden pests'
    ],
    gu: 'સુગંધિત ઔષધિ, બગીચાની સામાન્ય જીવાતોને દૂર રાખે છે અને સારા નિતારવાળી માટીમાં વધે છે.',
    hi: 'सुगंधित जड़ी-बूटी, आम कीटों को दूर रखती है और अच्छी जल निकासी वाली मिट्टी में पनपती है।',
    en: 'Aromatic culinary herb, repels common garden pests and thrives in well-drained soil.'
  },
  {
    keywords: [
      'drought-tolerant once established, ideal for warm balcony containers.',
      'drought-tolerant once established'
    ],
    gu: 'એકવાર મૂળ પકડ્યા પછી ઓછાં પાણીમાં પણ ટકી રહે છે, ગરમ બાલ્કનીના કૂંડા માટે આદર્શ.',
    hi: 'एक बार स्थापित होने पर कम पानी में भी अनुकूल, गर्म बालकनी के गमलों के लिए आदर्श।',
    en: 'Drought-tolerant once established, ideal for warm balcony containers.'
  },
  {
    keywords: ['ensure adequate water and sunlight.', 'ensure adequate water and sunlight'],
    gu: 'પર્યાપ્ત પાણી અને સૂર્યપ્રકાશ સુનિશ્ચિત કરો.',
    hi: 'पर्याप्त पानी और धूप सुनिश्चित करें।',
    en: 'Ensure adequate water and sunlight.'
  },
  {
    keywords: ['maintain organic mulch and monitor soil moisture.', 'maintain organic mulch and monitor soil moisture'],
    gu: 'સેન્દ્રિય લીંપણ (મલ્ચ) જાળવો અને માટીના ભેજનું નિરીક્ષણ કરો.',
    hi: 'जैविक मल्च बनाए रखें और मिट्टी की नमी की निगरानी करें।',
    en: 'Maintain organic mulch and monitor soil moisture.'
  },
  {
    keywords: ['ensure adequate compost incorporation.', 'ensure adequate compost incorporation'],
    gu: 'પૂરતા પ્રમાણમાં સેન્દ્રિય ખાતરનું મિશ્રણ સુનિશ્ચિત કરો.',
    hi: 'पर्याप्त जैविक खाद का मिश्रण सुनिश्चित करें।',
    en: 'Ensure adequate compost incorporation.'
  },
  {
    keywords: ['optimal yield', 'optimal yields'],
    gu: 'શ્રેષ્ઠ ઉત્પાદન',
    hi: 'उत्तम पैदावार',
    en: 'Optimal yield'
  },
  {
    keywords: ['high yield', 'high yields'],
    gu: 'ઉચ્ચ ઉત્પાદન',
    hi: 'उच्च पैदावार',
    en: 'High yield'
  },
  {
    keywords: ['moderate yield', 'moderate yields'],
    gu: 'મધ્યમ ઉત્પાદન',
    hi: 'मध्यम पैदावार',
    en: 'Moderate yield'
  },
  {
    keywords: ['plant in well-draining potting soil with 6-8 hours of direct sunlight.'],
    gu: '6-8 કલાકના સીધા સૂર્યપ્રકાશ સાથે સારા નિતારવાળી પોટિંગ માટીમાં રોપો.',
    hi: '6-8 घंटे की सीधी धूप के साथ अच्छी जल निकासी वाली पोटिंग मिट्टी में लगाएं।',
    en: 'Plant in well-draining potting soil with 6-8 hours of direct sunlight.'
  },
  {
    keywords: ['water regularly at the base; avoid wetting foliage to prevent fungal issues.'],
    gu: 'નિયમિતપણે મૂળમાં પાણી આપો; ફૂગના ઉપદ્રવથી બચવા પાંદડા ભીંજવવાનું ટાળો.',
    hi: 'नियमित रूप से जड़ में पानी दें; फंगल समस्याओं से बचने के लिए पत्तियों को गीला करने से बचें।',
    en: 'Water regularly at the base; avoid wetting foliage to prevent fungal issues.'
  },
  {
    keywords: ['provide vertical stake or trellis support as plant matures.'],
    gu: 'છોડ મોટો થાય ત્યારે તેને લાકડી અથવા માંડવાનો ટેકો આપો.',
    hi: 'पौधा बढ़ने पर डंडे या मचान का सहारा प्रदान करें।',
    en: 'Provide vertical stake or trellis support as plant matures.'
  }
];

const WHOLE_TEXT_SOURCES = [
  NAME_DICTIONARY,
  PLANT_DICTIONARY,
  SOIL_SEASON_DICTIONARY,
  DISEASE_DICTIONARY,
  DISEASE_TEXT_DICTIONARY,
  WATERING_AND_WEATHER_DICTIONARY,
  GARDEN_DICTIONARY,
  COMMUNITY_DICTIONARY,
  CROP_ADVICE_DICTIONARY,
];

// Helper to extract clean subphrases (e.g. "कमल (पद्म)" -> ["कमल (पद्म)", "कमल", "पद्म"])
function getPhraseVariants(str) {
  if (!str || typeof str !== 'string') return [];
  const results = [str];
  
  // Strip parentheses
  const parenMatch = str.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    results.push(parenMatch[1].trim());
    results.push(parenMatch[2].trim());
  }

  // Strip slashes
  if (str.includes('/')) {
    const parts = str.split('/').map(p => p.trim()).filter(Boolean);
    results.push(...parts);
  }

  return results;
}

for (const dict of WHOLE_TEXT_SOURCES) {
  for (const entry of dict) {
    const allPhrases = new Set();

    if (Array.isArray(entry.keywords)) {
      entry.keywords.forEach(kw => {
        getPhraseVariants(kw).forEach(v => allPhrases.add(v));
      });
    }
    if (entry.gu) {
      getPhraseVariants(entry.gu).forEach(v => allPhrases.add(v));
    }
    if (entry.hi) {
      getPhraseVariants(entry.hi).forEach(v => allPhrases.add(v));
    }
    if (entry.en) {
      getPhraseVariants(entry.en).forEach(v => allPhrases.add(v));
    }

    for (const phrase of allPhrases) {
      const n = normalize(phrase);
      const s = stripEnd(n);
      if (n && !EXACT.has(n)) EXACT.set(n, entry);
      if (s && !EXACT.has(s)) EXACT.set(s, entry);
      if (n.length >= PREFIX_LEN) {
        const p = n.slice(0, PREFIX_LEN);
        if (!PREFIX.has(p)) PREFIX.set(p, entry);
      }
    }
  }
}

/**
 * Word-boundary tokens for translating short phrases.
 * Longest keyword first so "cherry tomato" beats "tomato".
 */
const TOKENS = [];
const addTokens = (dict, { plant = false } = {}) => {
  for (const entry of dict) {
    if (entry.exactOnly) continue;

    const tokenPhrases = new Set();
    if (Array.isArray(entry.keywords)) {
      entry.keywords.forEach(k => getPhraseVariants(k).forEach(v => tokenPhrases.add(v)));
    }
    if (entry.gu) getPhraseVariants(entry.gu).forEach(v => tokenPhrases.add(v));
    if (entry.hi) getPhraseVariants(entry.hi).forEach(v => tokenPhrases.add(v));
    if (entry.en) getPhraseVariants(entry.en).forEach(v => tokenPhrases.add(v));

    for (const phrase of tokenPhrases) {
      const cleanPhrase = phrase.trim();
      if (!cleanPhrase || cleanPhrase.length < 2) continue;

      TOKENS.push({
        len: cleanPhrase.length,
        plant,
        gu: entry.gu,
        hi: entry.hi,
        en: entry.en || (entry.keywords && entry.keywords[0]) || cleanPhrase,
        // Match full Unicode letters/marks boundary so Indic characters match whole words safely
        re: new RegExp(`(?<![\\p{L}\\p{M}])${escapeRegExp(cleanPhrase)}(?![\\p{L}\\p{M}])`, 'giu'),
      });
    }
  }
};

addTokens(PLANT_DICTIONARY, { plant: true });
addTokens(SOIL_SEASON_DICTIONARY);
addTokens(DISEASE_DICTIONARY);
TOKENS.sort((a, b) => b.len - a.len);

const PLANT_WORD_RE = /(?<![\p{L}\p{M}])plants?(?![\p{L}\p{M}])/giu;
const PLANT_SUFFIX = {
  gu: (s) => (s.includes('છોડ') ? s : `${s}નો છોડ`),
  hi: (s) => (s.includes('पौधा') ? s : `${s} का पौधा`),
  en: (s) => (s.toLowerCase().includes('plant') ? s : `${s} Plant`),
};

// ---------------------------------------------------------------------------
// Translation steps
// ---------------------------------------------------------------------------

function getEntryTarget(entry, lang) {
  if (!entry) return null;
  if (lang === 'gu') return entry.gu || null;
  if (lang === 'hi') return entry.hi || null;
  if (lang === 'en') return entry.en || (entry.keywords && entry.keywords[0]) || null;
  return null;
}

function lookupWholeText(str, lang) {
  const n = normalize(str);
  const entry =
    EXACT.get(n) ||
    EXACT.get(stripEnd(n)) ||
    (n.length >= PREFIX_LEN ? PREFIX.get(n.slice(0, PREFIX_LEN)) : undefined);

  if (entry) {
    const target = getEntryTarget(entry, lang);
    if (target) return target;
  }
  return null;
}

function translateByTokens(str, lang) {
  if (!str || str.length > 70 || str.split(/\s+/).length > 7) return null;

  let vol = '';
  let head = str;
  const volMatch = str.match(/\s*(\(\s*\d+(?:\.\d+)?\s*(?:ml|l|ltr|g|kg|oz|cups?)\s*\))\s*$/i);
  if (volMatch) {
    vol = ` ${volMatch[1]}`;
    head = str.slice(0, volMatch.index).trim();
  }
  if (!head) return null;

  const slots = [];
  let work = head;
  for (const t of TOKENS) {
    const targetVal = t[lang];
    if (!targetVal) continue;
    work = work.replace(t.re, () => {
      slots.push({ text: targetVal, plant: t.plant });
      return `\u0001${slots.length - 1}\u0002`;
    });
  }
  if (!slots.length) return null;

  let hasPlantWord = false;
  work = work
    .replace(PLANT_WORD_RE, () => {
      hasPlantWord = true;
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();

  if (hasPlantWord && PLANT_SUFFIX[lang]) {
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i].plant) {
        slots[i].text = PLANT_SUFFIX[lang](slots[i].text);
        break;
      }
    }
  }

  work = work.replace(/\u0001(\d+)\u0002/g, (_, i) => slots[Number(i)].text);
  return `${work}${vol}`;
}

function translate(str, lang) {
  // 1. Whole-text dictionary hit
  const direct = lookupWholeText(str, lang);
  if (direct) return direct;

  // 2. Parenthetical structures: e.g. "पत्ती झुलसाव (Leaf Blight)", "कमल (पद्म)", "दोमट (Loam)", "Bush (Patio)"
  const parenMatch = str.match(/^([^(]+)\s*\(([^)]+)\)$/);
  if (parenMatch) {
    const left = parenMatch[1].trim();
    const right = parenMatch[2].trim();
    const leftTrans = lookupWholeText(left, lang);
    const rightTrans = lookupWholeText(right, lang);

    if (leftTrans && rightTrans) {
      if (leftTrans === rightTrans || leftTrans.toLowerCase() === rightTrans.toLowerCase()) {
        return leftTrans;
      }
      return lang === 'en' ? rightTrans : `${leftTrans} (${rightTrans})`;
    }
    if (leftTrans) {
      return lang === 'en' ? leftTrans : `${leftTrans} (${right})`;
    }
    if (rightTrans) {
      return rightTrans;
    }
  }

  // 3. List prefixes: "1. ...", "- ...", "• ..."
  const listMatch = str.match(/^(\d+\.\s*|-\s*|•\s*)([\s\S]+)$/);
  if (listMatch) return `${listMatch[1]}${translate(listMatch[2].trim(), lang)}`;

  // "Diagnosed: Powdery Mildew"
  const diagMatch = str.match(/^diagnosed:\s*([\s\S]+)$/i);
  if (diagMatch) return translate(diagMatch[1].trim(), lang);

  // 4. Task patterns ("Water Rose2 (1L)")
  for (const p of TASK_PATTERNS) {
    const m = str.match(p.re);
    if (m && m[1].split(/\s+/).length <= 6 && p[lang]) {
      return p[lang](translate(m[1].trim(), lang));
    }
  }

  // 5. Dynamic Crop Yield patterns: e.g. "2-3 heads per plant", "5-8 kg per plant", "1-2 kg/plant", "2-4 kg per sq.m"
  const yieldMatch = str.match(/^([\d.,\-\s~+]+)\s*(?:(kg|g|gm|heads?|bunches?|fruits?|chillies?|chilis?|peppers?|pieces?|lbs?|tons?)\s*)?(?:per\s+plant|\/plant|per\s+sq\.?\s*m|per\s+square\s+meter|\/sq\.?\s*m|\/m²|per\s+harvest|per\s+season)$/i);
  if (yieldMatch) {
    const rawNum = yieldMatch[1].trim();
    const rawUnit = (yieldMatch[2] || '').toLowerCase();
    const isPerPlant = /plant/i.test(str);
    const isPerSqM = /sq|m²/i.test(str);
    const isPerHarvest = /harvest/i.test(str);
    const isPerSeason = /season/i.test(str);

    const unitMap = {
      head: { gu: 'હેડ', hi: 'हेड', en: 'head' },
      heads: { gu: 'હેડ', hi: 'हेड', en: 'heads' },
      bunch: { gu: 'ઝૂડી', hi: 'गुच्छा', en: 'bunch' },
      bunches: { gu: 'ઝૂડી', hi: 'गुच्छे', en: 'bunches' },
      fruit: { gu: 'ફળ', hi: 'फल', en: 'fruit' },
      fruits: { gu: 'ફળ', hi: 'फल', en: 'fruits' },
      chilli: { gu: 'મરચાં', hi: 'मिर्च', en: 'chilli' },
      chillies: { gu: 'મરચાં', hi: 'मिर्च', en: 'chillies' },
      chili: { gu: 'મરચાં', hi: 'मिर्च', en: 'chili' },
      chilis: { gu: 'મરચાં', hi: 'मिर्च', en: 'chilis' },
      pepper: { gu: 'મરચાં', hi: 'मिर्च', en: 'pepper' },
      peppers: { gu: 'મરચાં', hi: 'मिर्च', en: 'peppers' },
      kg: { gu: 'કિલો', hi: 'किग्रा', en: 'kg' },
      g: { gu: 'ગ્રામ', hi: 'ग्राम', en: 'g' },
      gm: { gu: 'ગ્રામ', hi: 'ग्राम', en: 'gm' },
      piece: { gu: 'નંગ', hi: 'पीस', en: 'piece' },
      pieces: { gu: 'નંગ', hi: 'पीस', en: 'pieces' },
      lb: { gu: 'પાઉન્ડ', hi: 'पाउंड', en: 'lb' },
      lbs: { gu: 'પાઉન્ડ', hi: 'पाउंड', en: 'lbs' }
    };

    const unitObj = rawUnit ? unitMap[rawUnit] : null;
    const unitText = unitObj ? unitObj[lang] || rawUnit : rawUnit;

    if (lang === 'gu') {
      const denom = isPerPlant ? 'છોડ દીઠ' : isPerSqM ? 'ચો.મી. દીઠ' : isPerHarvest ? 'કાપણી દીઠ' : isPerSeason ? 'સીઝન દીઠ' : 'પ્રતિ છોડ';
      return unitText ? `${denom} ${rawNum} ${unitText}` : `${denom} ${rawNum}`;
    } else if (lang === 'hi') {
      const denom = isPerPlant ? 'प्रति पौधा' : isPerSqM ? 'प्रति वर्ग मीटर' : isPerHarvest ? 'प्रति कटाई' : isPerSeason ? 'प्रति सीजन' : 'प्रति पौधा';
      return unitText ? `${denom} ${rawNum} ${unitText}` : `${denom} ${rawNum}`;
    } else {
      const denom = isPerPlant ? 'per plant' : isPerSqM ? 'per sq.m' : isPerHarvest ? 'per harvest' : isPerSeason ? 'per season' : 'per plant';
      return unitText ? `${rawNum} ${unitText} ${denom}` : `${rawNum} ${denom}`;
    }
  }

  // Suitable for {Soil} soil condition
  const soilCondMatch = str.match(/^suitable for\s+([a-z\s]+?)\s+soil(?:\s+condition|\s+environment)?\.?$/i);
  if (soilCondMatch) {
    const soilName = soilCondMatch[1].trim();
    const transSoil = lookupWholeText(soilName, lang) || soilName;
    if (lang === 'gu') return `${transSoil} માટી માટે અનુકૂળ સ્થિતિ.`;
    if (lang === 'hi') return `${transSoil} मिट्टी के लिए उपयुक्त स्थिति।`;
    return `Suitable for ${transSoil} soil condition.`;
  }

  // Well suited for {Season}
  const seasonCondMatch = str.match(/^well suited for\s+([a-z\s]+?)(?:\s+season|\s+weather)?\.?$/i);
  if (seasonCondMatch) {
    const seasonName = seasonCondMatch[1].trim();
    const transSeason = lookupWholeText(seasonName, lang) || seasonName;
    if (lang === 'gu') return `${transSeason} ઋતુ માટે અત્યંત અનુકૂળ.`;
    if (lang === 'hi') return `${transSeason} मौसम के लिए अत्यधिक उपयुक्त।`;
    return `Well suited for ${transSeason}.`;
  }

  // {Soil} soil with pH {ph}
  const soilPhPattern = str.match(/^([a-z\s]+?)\s+soil with ph\s*([\d.]+)\.?$/i);
  if (soilPhPattern) {
    const sName = soilPhPattern[1].trim();
    const phVal = soilPhPattern[2];
    const transSoil = lookupWholeText(sName, lang) || sName;
    if (lang === 'gu') return `pH ${phVal} સાથે ${transSoil} માટી`;
    if (lang === 'hi') return `pH ${phVal} के साथ ${transSoil} मिट्टी`;
    return `${transSoil} soil with pH ${phVal}`;
  }

  // 6. Short phrases: token translation
  const tokenized = translateByTokens(str, lang);
  if (tokenized) return tokenized;

  return str;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const cache = new Map();

const resolveLang = (lang) => {
  let l = lang;
  if (!l) {
    try {
      l = localStorage.getItem('language');
    } catch {
      /* localStorage unavailable */
    }
  }
  const resolved = String(l || 'en').split('-')[0].toLowerCase();
  return ['gu', 'hi', 'en'].includes(resolved) ? resolved : 'en';
};

/**
 * Translate dynamic DB text into the active language.
 * @param {string} text  Text from the database.
 * @param {string|null} lang  'en' | 'gu' | 'hi' (defaults to active language).
 * @returns {string} Translated text, or original text if no translation is known.
 */
export const getLocalizedDynamicText = (text, lang = null) => {
  try {
    if (!text || typeof text !== 'string') return text || '';

    const currentLang = resolveLang(lang);
    const str = text.trim();
    if (!str) return text;

    const key = `${currentLang}|${str}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;

    const result = translate(str, currentLang);
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
    cache.set(key, result);
    return result;
  } catch {
    return text || '';
  }
};

/** Clears the memoisation cache (e.g. after hot-reloading dictionaries). */
export const clearDynamicTextCache = () => cache.clear();

export default getLocalizedDynamicText;