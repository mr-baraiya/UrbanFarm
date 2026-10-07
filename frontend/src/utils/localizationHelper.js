/**
 * Dynamic DB Data Translation Helper
 * ---------------------------------------------------------------------------
 * Translates plant names, garden titles, user names, descriptions, task titles,
 * disease names, community posts, etc. coming from the database into the
 * active language (Gujarati "gu" / Hindi "hi"). English ("en") is returned as-is.
 *
 * Lookup order (first hit wins):
 *   1. Exact / prefix dictionary lookup (names, watering, community, disease,
 *      garden). Text is normalised (case, whitespace, dash/apostrophe styles,
 *      trailing punctuation) so "Healthy!" and "healthy" are the same key.
 *   2. Bullet / numbered-list prefixes ("1. ...", "- ...", "• ...") and
 *      "Diagnosed: ..." prefixes are peeled off and the rest is translated.
 *   3. Task patterns: "Water Rose2 (1L)", "Prune Mint", "Harvest Tomato" ...
 *   4. Word-boundary token translation for short phrases, e.g.
 *      "Indian Mint" -> "ભારતીય ફુદીનો", "Tomato Early Blight" -> both parts.
 *
 * Fixes vs. the previous version:
 *   - Syntax error (unclosed `if` block before the `catch`) fixed.
 *   - Dictionary hits now run BEFORE task patterns, so tips such as
 *     "Water at the base, not on leaves" or the category "Water issue" are no
 *     longer hijacked by the generic "Water <plant>" pattern.
 *   - Substring bugs removed: "rose" no longer matches "rosemary", "lime" no
 *     longer matches "sublime", "rust" no longer matches "trust" (word-boundary
 *     matching, longest keyword first).
 *   - Wrong Hindi text in the "extreme heat" entry, wrong Gujarati for
 *     spearmint and "prune" fixed.
 *   - Whole-text matching is O(1) via prebuilt Maps instead of scanning every
 *     dictionary on each call, and results are cached.
 *   - Safe localStorage access, "gu-IN" style language codes supported.
 */

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

const NAME_DICTIONARY = [
  { keywords: ['priya sharma', 'priya'], gu: 'પ્રિયા શર્મા', hi: 'प्रिया शर्मा' },
  { keywords: ['vishal baraiya', 'vishal'], gu: 'વિશાલ બારૈયા', hi: 'विशाल बारैया' },
  { keywords: ['rahul sharma', 'rahul'], gu: 'રાહુલ શર્મા', hi: 'राहुल शर्मा' },
  { keywords: ['saurabh singh', 'saurabh'], gu: 'સૌરભ સિંહ', hi: 'सौरभ सिंह' },
  { keywords: ['arjun mehta', 'arjun'], gu: 'અર્જુન મહેતા', hi: 'अर्जुन मेहता' },
  { keywords: ['admin user', 'adminuser', 'admin'], gu: 'એડમિન યુઝર', hi: 'एडमिन यूजर' },
  { keywords: ['anonymous gardener', 'anonymous'], gu: 'અનામી ખેડૂત', hi: 'अनाम किसान' },
  { keywords: ['gardener'], gu: 'ખેડૂત મિત્ર', hi: 'किसान साथी' },
  { keywords: ['john doe'], gu: 'જોન ડો', hi: 'जॉन डो' },
  { keywords: ['elena rostova'], gu: 'એલેના રોસ્ટોવા', hi: 'एलेना रोस्टोवा' },
  { keywords: ['marcus chen'], gu: 'માર્કસ ચેન', hi: 'मार्क्स चेन' },
  { keywords: ['sarah jenkins'], gu: 'સારાહ જેન્કિન્સ', hi: 'सारा जेनकिंस' },
];

/** Plant names. Used for token translation (longest keyword wins). */
const PLANT_DICTIONARY = [
  { keywords: ['cherry tomato (determinate / patio)', 'cherry tomato (patio/determinate)', 'cherry tomato (determinate)', 'cherry tomato', 'patio tomato'], gu: 'ચેરી ટામેટા', hi: 'चेरी टमाटर' },
  { keywords: ['bush tomato (determinate varieties)', 'bush tomato (determinate)', 'bush tomato'], gu: 'ઝાડવા ટામેટા', hi: 'झाड़ी टमाटर' },
  { keywords: ['sweet bell pepper', 'bush bell pepper', 'bush pepper', 'bell pepper', 'capsicum'], gu: 'શિમલા મરચું', hi: 'शिमला मिर्च' },
  { keywords: ['bush beans', 'french beans', 'green beans', 'beans'], gu: 'ચોળી / ફણસી (બીન્સ)', hi: 'हरी फलियां (बीन्स)' },
  { keywords: ['genovese basil', 'sweet basil'], gu: 'તુલસી / ડમરો', hi: 'तुलસી' },
  { keywords: ['compact patio cucumber', 'patio cucumber'], gu: 'કાકડી', hi: 'खीरा' },
  { keywords: ['swiss chard', 'chard'], gu: 'સ્વિસ ચાર્ડ', hi: 'स्विस चार्ड' },
  { keywords: ['eggplant', 'brinjal', 'aubergine'], gu: 'રીંગણ', hi: 'बैंगन' },
  { keywords: ['fenugreek', 'methi'], gu: 'મેથી', hi: 'मेथी' },
  { keywords: ['spearmint'], gu: 'સ્પિયરમિન્ટ (ફુદીનો)', hi: 'स्पीयरमिंट (पुदीना)' },
  { keywords: ['mentha spicata'], gu: 'મેન્થા સ્પીકાટા', hi: 'मेंथा स्पिकाटा' },
  { keywords: ['peppermint'], gu: 'પીપરમિન્ટ', hi: 'पिपरमिंट' },
  { keywords: ['california wonder'], gu: 'કેલિફોર્નિયા વન્ડર', hi: 'कैलिफ़ोर्निया वंडर' },
  { keywords: ['capsicum annuum'], gu: 'કેપ્સિકમ એન્યુમ', hi: 'कैप्सिकम एन्युम' },
  { keywords: ['bell pepper', 'capsicum'], gu: 'શિમલા મરચું', hi: 'शिमला मिर्च' },
  { keywords: ['black pepper'], gu: 'કાળા મરી', hi: 'काली मिर्च' },
  { keywords: ['chilli', 'chili', 'pepper'], gu: 'મરચું', hi: 'मिर्च' },
  { keywords: ['mint', 'pudina'], gu: 'ફુદીનો', hi: 'पुदीना' },
  { keywords: ['rose'], gu: 'ગુલાબ', hi: 'गुलाब' },
  { keywords: ['carrot'], gu: 'ગાજર', hi: 'गाजर' },
  { keywords: ['guava plant', 'guava'], gu: 'જામફળ', hi: 'अमरूद' },
  { keywords: ['banana'], gu: 'કેળું', hi: 'केला' },
  { keywords: ['tomato'], gu: 'ટામેટું', hi: 'टमाटर' },
  { keywords: ['basil', 'tulsi'], gu: 'તુલસી', hi: 'तुलसी' },
  { keywords: ['spinach', 'palak'], gu: 'પાલક', hi: 'पालक' },
  { keywords: ['coriander', 'cilantro', 'dhaniya'], gu: 'કોથમરી', hi: 'धनिया' },
  { keywords: ['curry leaf', 'curry leaves'], gu: 'મીઠો લીમડો', hi: 'कड़ी पत्ता' },
  { keywords: ['lettuce'], gu: 'સલાડ પત્તા', hi: 'सलाद पत्ता' },
  { keywords: ['strawberry'], gu: 'સ્ટ્રોબેરી', hi: 'स्ट्रॉबेरी' },
  { keywords: ['cucumber'], gu: 'કાકડી', hi: 'खीरा' },
  { keywords: ['aloe vera', 'aloevera', 'aloe'], gu: 'એલોવેરા', hi: 'एलोवेरा' },
  { keywords: ['marigold'], gu: 'ગલગોટો', hi: 'गेंदा' },
  { keywords: ['jasmine', 'chameli'], gu: 'ચમેલી', hi: 'चमेली' },
  { keywords: ['mogra'], gu: 'મોગરો', hi: 'मोगरा' },
  { keywords: ['lemon', 'lime'], gu: 'લીંબુ', hi: 'नींबू' },
  { keywords: ['mango'], gu: 'કેરી', hi: 'आम' },
  { keywords: ['papaya'], gu: 'પપૈયું', hi: 'पपीता' },
  { keywords: ['spring onion'], gu: 'લીલી ડુંગળી', hi: 'हरी प्याज' },
  { keywords: ['onion'], gu: 'ડુંગળી', hi: 'प्याज' },
  { keywords: ['garlic'], gu: 'લસણ', hi: 'लहसुन' },
  { keywords: ['radish'], gu: 'મૂળો', hi: 'मूली' },
  { keywords: ['oregano'], gu: 'ઓરેગાનો', hi: 'ऑरेगैनो' },
  { keywords: ['rosemary'], gu: 'રોઝમેરી', hi: 'रोज़मेरी' },
  { keywords: ['parsnip'], gu: 'પાર્સનિપ', hi: 'पार्सनिप' },
  { keywords: ['amaranth'], gu: 'તાંદળજો (ચોળાઈ)', hi: 'चौलाई (अमरांथ)' },
  { keywords: ['herbs', 'herb'], gu: 'જડીબુટ્ટીઓ / મસાલા છોડ', hi: 'जड़ी-बूटियाँ / हर्ब्स' },
  { keywords: ['sweet potato'], gu: 'શક્કરિયા', hi: 'शकरकंद' },
  { keywords: ['potato'], gu: 'બટાકા', hi: 'आलू' },
  { keywords: ['eggplant', 'brinjal'], gu: 'રીંગણ', hi: 'बैंगन' },
  { keywords: ['indian'], gu: 'દેશી / ભારતીય', hi: 'भारतीय' },
  { keywords: ['hybrid'], gu: 'હાઇબ્રિડ', hi: 'हाइब्रिड' },
  { keywords: ['desi'], gu: 'દેશી', hi: 'देशी' },
];

/** Soil types & seasons (shown on history cards). */
const SOIL_SEASON_DICTIONARY = [
  { keywords: ['sandy loam'], gu: 'રેતાળ ગોરાડુ', hi: 'बलुई दोमट' },
  { keywords: ['potting mix'], gu: 'પોટિંગ મિક્સ', hi: 'पोटिंग मिक्स' },
  { keywords: ['loam'], gu: 'ગોરાડુ / દોમટ', hi: 'दोमट' },
  { keywords: ['sandy'], gu: 'રેતાળ', hi: 'बलुई' },
  { keywords: ['clay'], gu: 'ચીકણી માટી', hi: 'चिकनी मिट्टी' },
  { keywords: ['silty'], gu: 'કાંપવાળી', hi: 'गाद' },
  { keywords: ['peaty'], gu: 'પીટ', hi: 'पीट' },
  { keywords: ['chalky'], gu: 'ચૂનાવાળી', hi: 'चूनेदार' },
  { keywords: ['spring'], gu: 'વસંત', hi: 'वसंत' },
  { keywords: ['summer'], gu: 'ઉનાળો', hi: 'ग्रीष्म' },
  { keywords: ['fall', 'autumn'], gu: 'શરદ / પાનખર', hi: 'शरद' },
  { keywords: ['winter'], gu: 'શિયાળો', hi: 'शीत' },
];

/**
 * Disease / category NAMES. Used for exact lookup AND token translation.
 * `exactOnly` entries are never used as tokens inside longer phrases.
 */
const DISEASE_DICTIONARY = [
  { keywords: ['healthy plant', 'healthy'], gu: 'તંદુરસ્ત છોડ', hi: 'स्वस्थ पौधा', exactOnly: true },
  { keywords: ['general condition'], gu: 'સામાન્ય સ્થિતિ', hi: 'सामान्य स्थिति', exactOnly: true },
  { keywords: ['not a plant', 'not plant', 'non plant'], gu: 'છોડ નથી', hi: 'पौधा नहीं है' },
  { keywords: ['diplocarpon', 'black spot'], gu: 'બ્લેક સ્પોટ રોગ', hi: 'ब्लैक स्पॉट रोग' },
  { keywords: ['powdery mildew'], gu: 'પાવડરી મિલ્ડ્યુ (ફૂગ)', hi: 'पाउडरी फफूंदी' },
  { keywords: ['downy mildew'], gu: 'ડાઉની મિલ્ડ્યુ', hi: 'डाउनी मिल्ड्यू' },
  { keywords: ['early blight'], gu: 'અર્લી બ્લાઇટ (રોગ)', hi: 'अगेती झुलसा' },
  { keywords: ['late blight'], gu: 'લેટ બ્લાઇટ (રોગ)', hi: 'पछेती झुलसा' },
  { keywords: ['leaf spot'], gu: 'પાંદડાના ટપકાંનો રોગ', hi: 'पत्ती के धब्बे' },
  { keywords: ['rust'], gu: 'રસ્ટ રોગ', hi: 'गेरुई रोग' },
  { keywords: ['bacterial wilt'], gu: 'જીવાણુ કરમાવો', hi: 'जीवाणु मुरझान' },
  { keywords: ['spider mites', 'spider mite'], gu: 'કરોળિયા જીવાત', hi: 'मकड़ी कीट' },
  { keywords: ['mosaic virus'], gu: 'મોઝેક વાયરસ', hi: 'मोज़ेक वायरस' },
  { keywords: ['anthracnose'], gu: 'એન્થ્રેકનોઝ', hi: 'एंथ्रेक्नोज' },
  { keywords: ['aphids', 'aphid'], gu: 'મોલો-મસી (એફિડ્સ)', hi: 'माहू (एफिड्स)' },
  { keywords: ['chlorosis', 'yellowing'], gu: 'ક્લોરોસિસ (પીળા પાંદડા)', hi: 'क्लोरोसिस (पीलापन)' },
  { keywords: ['sunburn', 'leaf scorch'], gu: 'સનબર્ન (પાંદડા બળવા)', hi: 'सनबर्न' },

  // Categories
  { keywords: ['water issue'], gu: 'પાણીની સમસ્યા', hi: 'पानी की समस्या' },
  { keywords: ['fungal infection'], gu: 'ફૂગનો ચેપ', hi: 'फंगल संक्रमण' },
  { keywords: ['bacterial infection'], gu: 'બેક્ટેરિયલ ચેપ', hi: 'बैक्टीरियल संक्रमण' },
  { keywords: ['pest infestation'], gu: 'જીવાતનો ઉપદ્રવ', hi: 'कीट प्रकोप' },
  { keywords: ['nutrient deficiency'], gu: 'પોષક તત્વોની ઉણપ', hi: 'पोषक तत्वों की कमी' },
];

/** AI diagnosis sentences and prevention tips (whole-text lookup only). */
const DISEASE_TEXT_DICTIONARY = [
  {
    keywords: ['no diseases detected. the plant looks healthy.', 'no diseases detected', 'the plant looks healthy'],
    gu: 'કોઈ રોગ જણાયો નથી. છોડ તંદુરસ્ત દેખાય છે.',
    hi: 'कोई रोग नहीं पाया गया। पौधा स्वस्थ दिख रहा है।',
  },
  {
    keywords: [
      'your plant appears healthy! continue with good care practices: proper watering, adequate sunlight, and regular monitoring.',
      'your plant appears healthy! continue with good care practices',
      'your plant appears healthy',
    ],
    gu: 'તમારો છોડ તંદુરસ્ત જણાય છે! સારી કાળજી ચાલુ રાખો: યોગ્ય પાણી, પર્યાપ્ત સૂર્યપ્રકાશ અને નિયમિત દેખરેખ.',
    hi: 'आपका पौधा स्वस्थ दिखाई दे रहा है! अच्छी देखभाल जारी रखें: उचित पानी, पर्याप्त धूप और नियमित निगरानी।',
  },
  {
    keywords: ['continue with good care practices: proper watering, adequate sunlight, and regular monitoring.'],
    gu: 'સારી કાળજી ચાલુ રાખો: યોગ્ય પાણી, પર્યાપ્ત સૂર્યપ્રકાશ અને નિયમિત દેખરેખ.',
    hi: 'अच्छी देखभाल जारी रखें: उचित पानी, पर्याप्त धूप और नियमित निगरानी।',
  },
  {
    keywords: ['no specific treatment available.'],
    gu: 'કોઈ ચોક્કસ સારવાર ઉપલબ્ધ નથી.',
    hi: 'कोई विशिष्ट उपचार उपलब्ध नहीं है।',
  },

  // Prevention tips
  { keywords: ['regularly monitor plant health'], gu: 'છોડના સ્વાસ્થ્યનું નિયમિત નિરીક્ષણ કરો', hi: 'पौधे के स्वास्थ्य की नियमित निगरानी करें' },
  { keywords: ['maintain consistent care routine'], gu: 'નિયમિત સંભાળની દિનચર્યા જાળવો', hi: 'नियमित देखभाल दिनचर्या बनाए रखें' },
  { keywords: ['keep growing area clean'], gu: 'ઉછેર વિસ્તાર સ્વચ્છ રાખો', hi: 'उगाने वाले क्षेत्र को साफ रखें' },
  { keywords: ['use quality soil and fertilizer'], gu: 'ગુણવત્તાયુક્ત માટી અને ખાતરનો ઉપયોગ કરો', hi: 'गुणवत्तापूर्ण मिट्टी और खाद का उपयोग करें' },
  { keywords: ['allow soil to dry between waterings'], gu: 'પાણી આપવાની વચ્ચે માટીને સૂકવવા દો', hi: 'पानी देने के बीच मिट्टी को सूखने दें' },
  { keywords: ['use well-draining potting mix'], gu: 'સારી નિકાલ વ્યવસ્થા ધરાવતી માટીનો ઉપયોગ કરો', hi: 'अच्छे जल निकासी वाले पोटिंग मिक्स का प्रयोग करें' },
  { keywords: ['water in the morning to reduce evaporation'], gu: 'બાષ્પીભવન ઘટાડવા સવારે પાણી આપો', hi: 'वाष्पीकरण कम करने के लिए सुबह पानी दें' },
  { keywords: ['check drainage holes are not blocked'], gu: 'ડ્રેનેજ છિદ્રો બ્લોક નથી તે તપાસો', hi: 'जांचें कि जल निकासी छेद बंद तो नहीं हैं' },
  { keywords: ['improve air circulation around plants'], gu: 'છોડની આસપાસ હવાની અવરજવર સુધારો', hi: 'पौधों के आसपास हवा का संचार बेहतर करें' },
  { keywords: ['water at the base, not on leaves'], gu: 'પાંદડા પર નહીં પણ મૂળમાં પાણી આપો', hi: 'पत्तियों पर नहीं, जड़ में पानी दें' },
  { keywords: ['remove affected leaves immediately'], gu: 'અસરગ્રસ્ત પાંદડા તરત જ દૂર કરો', hi: 'प्रभावित पत्तियों को तुरंत हटा दें' },
  { keywords: ['apply preventative fungicide in humid conditions'], gu: 'ભેજવાળા વાતાવરણમાં નિવારક ફૂગનાશક લગાવો', hi: 'नम मौसम में निवारक कवकनाशी का प्रयोग करें' },
  { keywords: ['regularly inspect plants for pests'], gu: 'જીવાતો માટે છોડનું નિયમિત નિરીક્ષણ કરો', hi: 'कीटों के लिए पौधों का नियमित निरीक्षण करें' },
  { keywords: ['use neem oil as a natural deterrent'], gu: 'કુદરતી ઉપાય તરીકે લીમડાના તેલનો ઉપયોગ કરો', hi: 'प्राकृतिक निवारक के रूप में नीम के तेल का प्रयोग करें' },
  { keywords: ['introduce beneficial insects like ladybugs'], gu: 'લેડીબગ જેવા ફાયદાકારક કીટકો દાખલ કરો', hi: 'लेडीबग जैसे लाभकारी कीटों का उपयोग करें' },
  { keywords: ['quarantine new plants before introducing'], gu: 'નવા છોડને અન્ય છોડ પાસે મૂકતા પહેલા અલગ રાખો', hi: 'नए पौधों को शामिल करने से पहले अलग रखें' },
];

const GARDEN_DICTIONARY = [
  { keywords: ["priya's balcony farm", 'balcony farm'], gu: 'પ્રિયાનું બાલ્કની ફાર્મ', hi: 'प्रिया का बालकनी फार्म' },
  { keywords: ["priya's trace garden", "priya's terrace garden", 'terrace garden', 'trace garden'], gu: 'પ્રિયાનું ટેરેસ ગાર્ડન', hi: 'प्रिया का टेरेस गार्डन' },
  { keywords: ['backyard garden'], gu: 'પાછળનું આંગણું બગીચો', hi: 'पीछे का आंगन बगीचा' },
  { keywords: ['rooftop organic bed', 'rooftop garden'], gu: 'ધાબા પરનો ઓર્ગેનિક બગીચો', hi: 'छत का ऑर्गेनिक बगीचा' },
  {
    keywords: ['small but productive balcony setup with containers.'],
    gu: 'કન્ટેનર સાથે નાનું પરંતુ ઉત્પાદક બાલ્કની સેટઅપ.',
    hi: 'कंटेनरों के साथ छोटा लेकिन उत्पादक बालकनी सेटअप।',
  },
  { keywords: ['botad, india', 'botad india'], gu: 'બોટાદ, ભારત', hi: 'बोताद, भारत' },
  { keywords: ['mumbai, india', 'mumbai india'], gu: 'મુંબઈ, ભારત', hi: 'मुंबई, भारत' },
  { keywords: ['mumbai, maharashtra'], gu: 'મુંબઈ, મહારાષ્ટ્ર', hi: 'मुंबई, महाराष्ट्र' },
  { keywords: ['rajkot, gujarat'], gu: 'રાજકોટ, ગુજરાત', hi: 'राजकोट, गुजरात' },
  { keywords: ['ahmedabad, gujarat'], gu: 'અમદાવાદ, ગુજરાત', hi: 'अहमदाबाद, गुजरात' },
  { keywords: ['botad'], gu: 'બોટાદ', hi: 'बोताद' },
  { keywords: ['india'], gu: 'ભારત', hi: 'भारत' },
];

/**
 * Community posts/comments. Keywords of 35+ characters are also matched by
 * their first 35 characters, so a post edited after its first sentence still
 * resolves. Keep one long keyword per entry; no need for sentence variants.
 */
const COMMUNITY_DICTIONARY = [
  // Levels
  { keywords: ['master gardener'], gu: 'માસ્ટર ગાર્ડનર', hi: 'मास्टर माली' },
  { keywords: ['green thumb'], gu: 'ગ્રીન થમ્બ', hi: 'कुशल बागवान' },
  { keywords: ['urban farmer'], gu: 'અર્બન ફાર્મર', hi: 'शहरी किसान' },
  { keywords: ['seedling'], gu: 'અંકુર (સીડલિંગ)', hi: 'अंकुर (सीडलिंग)' },

  // Activity & feed badges
  { keywords: ['thriving sanctuary 🌱', 'thriving sanctuary'], gu: 'સમૃદ્ધ અભયારણ્ય 🌱', hi: 'समृद्ध अभयारण्य 🌱' },
  { keywords: ['live feed'], gu: 'લાઇવ ફીડ', hi: 'लाइव फीड' },
  { keywords: ['posts shared'], gu: 'શેર કરેલ પોસ્ટ્સ', hi: 'साझा की गई पोस्ट्स' },
  { keywords: ['active growers'], gu: 'સક્રિય ખેડૂતો', hi: 'सक्रिय बागवान' },
  { keywords: ['harvest stories'], gu: 'લણણી વાર્તાઓ', hi: 'उपज की कहानियां' },

  // Categories
  { keywords: ['harvest showcase'], gu: 'લણણી પ્રદર્શન', hi: 'उपज प्रदर्शन' },
  { keywords: ['general discussion'], gu: 'સામાન્ય ચર્ચા', hi: 'सामान्य चर्चा' },
  { keywords: ['plant help / diagnose request'], gu: 'છોડ સહાય / નિદાન વિનંતી', hi: 'पौधे की मदद / निदान अनुरोध' },
  { keywords: ['urban tip / diy'], gu: 'શહેરી ખેતી ટિપ / DIY', hi: 'शहरी बागवानी टिप / DIY' },
  { keywords: ['community event'], gu: 'સમુદાય કાર્યક્રમ', hi: 'समुदाय कार्यक्रम' },

  // 1. Cherry tomatoes
  {
    keywords: ['🍅 my cherry tomatoes are finally ready!', 'my cherry tomatoes are finally ready'],
    gu: '🍅 મારા ચેરી ટામેટાં આખરે તૈયાર છે!',
    hi: '🍅 मेरे चेरी टमाटर आखिरकार तैयार हैं!',
  },
  {
    keywords: ['after 45 days of careful watering and staking, my sweet 100 cherry tomatoes are starting to turn red.'],
    gu: '45 દિવસની કાળજીપૂર્વક પાણી આપ્યા અને ટેકો આપ્યા પછી, મારા સ્વીટ 100 ચેરી ટામેટાં લાલ થવા લાગ્યા છે. અહીં મારી ટોચની ટિપ્સ છે: (1) દરરોજ મૂળમાં પાણી આપો, (2) છોડ ભારે થાય તે પહેલાં ટેકો આપો, (3) વધુ સારા ફળ માટે સકર્સ ચૂંટો.',
    hi: '45 दिनों तक सावधानीपूर्वक पानी देने और सहारा देने के बाद, मेरे स्वीट 100 चेरी टमाटर लाल होने लगे हैं। यहाँ मेरे शीर्ष सुझाव हैं: (1) रोजाना जड़ में पानी दें, (2) पौधा भारी होने से पहले सहारा दें, (3) बेहतर फल के लिए सकर हटाएं।',
  },
  {
    keywords: ['amazing! mine are still flowering. any tip for speeding up fruit set?'],
    gu: 'ખૂબ સરસ! મારા છોડમાં હજી ફૂલો આવી રહ્યા છે. ફળ ઝડપથી બેસવા માટે કોઈ ટિપ?',
    hi: 'बहुत बढ़िया! मेरे अभी भी फूल रहे हैं। फल तेजी से लगने के लिए कोई टिप?',
  },
  {
    keywords: ['looks great! i just planted mine last week. hoping for similar results.'],
    gu: 'ખૂબ સરસ દેખાય છે! મેં ગયા અઠવાડિયે જ મારા છોડ રોપ્યા છે. આવા જ પરિણામોની આશા છે.',
    hi: 'बहुत अच्छा लग रहा है! मैंने पिछले हफ्ते ही अपना लगाया था। ऐसे ही परिणामों की उम्मीद है।',
  },
  {
    keywords: ['@arjun mehta aur mehat aapna number do handsome', 'aur mehat aapna number do handsome'],
    gu: '@અર્જુન મહેતા તમારો નંબર આપો',
    hi: '@अर्जुन मेहता अपना नंबर दो',
  },
  {
    keywords: ['@arjun mehta tum abhi tak numer nhi send kiya', 'tum abhi tak numer nhi send kiya'],
    gu: '@અર્જુન મહેતા તમે હજી સુધી નંબર નથી મોકલ્યો',
    hi: '@अर्जुन मेहता तुमने अभी तक नंबर नहीं भेजा',
  },
  {
    keywords: ['@priya sharma mera number chalega priya', 'mera number chalega priya'],
    gu: '@પ્રિયા શર્મા મારો નંબર ચાલશે પ્રિયા',
    hi: '@प्रिया शर्मा मेरा नंबर चलेगा प्रिया',
  },
  {
    keywords: ['@anonymous o meri purani id thi', 'o meri purani id thi'],
    gu: '@અનામી એ મારી જૂની આઈડી હતી',
    hi: '@अनाम वो मेरी पुरानी आईडी थी',
  },

  // 2. Herbs for a Mumbai balcony
  {
    keywords: ['best herbs for a mumbai balcony?'],
    gu: 'મુંબઈની બાલ્કની માટે શ્રેષ્ઠ ઔષધિઓ?',
    hi: 'मुंबई की बालकनी के लिए सबसे अच्छी जड़ी-बूटियाँ?',
  },
  {
    keywords: ["i have a west-facing balcony that gets 4-5 hours of sunlight. currently growing mint and basil."],
    gu: 'મારી પાસે પશ્ચિમ તરફની બાલ્કની છે જ્યાં 4-5 કલાક સૂર્યપ્રકાશ મળે છે. હાલમાં ફુદીનો અને તુલસી ઉગાડું છું. અહીં અન્ય કઈ ઔષધિઓ સારી રીતે ઉગી શકે? હું કોથમરી અથવા મીઠો લીમડો વિચારું છું. સમુદાયના સૂચનો આવકાર્ય છે!',
    hi: 'मेरे पास पश्चिम मुखी बालकनी है जहाँ 4-5 घंटे धूप आती है। वर्तमान में पुदीना और तुलसी उगा रहा हूँ। यहाँ और कौन सी जड़ी-बूटियाँ पनपेंगी? मैं धनिया या कड़ी पत्ता सोच रहा हूँ। समुदाय की राय चाहिए!',
  },
  {
    keywords: ['curry leaf is perfect for mumbai climate! it loves heat and humidity.'],
    gu: 'મુંબઈના વાતાવરણ માટે મીઠો લીમડો ઉત્તમ છે! તેને ગરમી અને ભેજ ગમે છે. જોકે ગરમીમાં કોથમરી ઝડપથી બગડી જાય છે — શિયાળામાં પ્રયાસ કરો.',
    hi: 'मुंबई के मौसम के लिए कड़ी पत्ता बिल्कुल सही है! इसे गर्मी और नमी पसंद है। हालांकि गर्मी में धनिया जल्दी खराब हो जाता है — सर्दियों में प्रयास करें।',
  },
  { keywords: ['hello'], gu: 'નમસ્તે', hi: 'नमस्ते' },
  {
    keywords: ['what r u doing priya', 'what are you doing priya'],
    gu: 'તમે શું કરી રહ્યા છો પ્રિયા',
    hi: 'आप क्या कर रहे हैं प्रिया',
  },

  // 3. Banana peel water
  {
    keywords: ['💡 tip: use banana peel water for potassium boost', 'tip: use banana peel water for potassium boost', 'use banana peel water for potassium boost'],
    gu: '💡 ટિપ: પોટેશિયમ વધારવા કેળાની છાલના પાણીનો ઉપયોગ કરો',
    hi: '💡 टिप: पोटेशियम बढ़ाने के लिए केले के छिलके के पानी का उपयोग करें',
  },
  {
    keywords: ['soak 2-3 banana peels in a litre of water for 48 hours.'],
    gu: '2-3 કેળાની છાલને એક લિટર પાણીમાં 48 કલાક પલાળી રાખો. ગાળીને ફૂલોવાળા છોડ માટે પ્રવાહી ખાતર તરીકે વાપરો. તે પોટેશિયમ અને ફોસ્ફરસથી ભરપૂર છે — ફળ આવવાના સમયે ટામેટાં અને મરચાં માટે ઉત્તમ છે. તદ્દન મફત અને કચરામુક્ત!',
    hi: '2-3 केले के छिलकों को एक लीटर पानी में 48 घंटे के लिए भिगो दें। छानकर फूलों वाले पौधों के लिए तरल खाद के रूप में प्रयोग करें। यह पोटेशियम और फास्फोरस से भरपूर है — फल लगने के समय टमाटर और मिर्च के लिए एकदम सही। पूरी तरह से मुफ्त और शून्य अपशिष्ट!',
  },
  { keywords: ['ok got it'], gu: 'ઠીક છે, સમજાઈ ગયું', hi: 'ठीक है, समझ गया' },

  // 4. Yellow leaves on tomato seedling
  {
    keywords: ['leaves turning yellow on my tomato seedling'],
    gu: 'મારા ટામેટાંના રોપા પર પાંદડા પીળા પડી રહ્યા છે',
    hi: 'मेरे टमाटर के पौधे की पत्तियाँ पीली पड़ रही हैं',
  },
  {
    keywords: ["i just started gardening and my tomato seedling's lower leaves are turning yellow"],
    gu: 'મેં હમણાં જ બાગકામ શરૂ કર્યું છે અને લગભગ 10 દિવસ પછી મારા ટામેટાંના રોપાના નીચેના પાંદડા પીળા પડી રહ્યા છે. હું તેને દરરોજ પાણી આપું છું. શું આ વધુ પડતું પાણી આપવાને કારણે છે? કોઈ સલાહ આપશો!',
    hi: 'मैंने अभी-अभी बागवानी शुरू की है और लगभग 10 दिनों के बाद मेरे टमाटर के पौधे की निचली पत्तियाँ पीली पड़ने लगी हैं। मैं इसे रोज पानी देता हूँ। क्या यह अधिक पानी देने के कारण है? कोई सलाह मिले तो आभारी रहूँगा!',
  },
  {
    keywords: ['yes, classic overwatering! let the soil dry out slightly between waterings.', 'yes, classic overwatering!'],
    gu: 'હા, વધુ પડતું પાણી આપવાનું આ સામાન્ય લક્ષણ છે! પાણી આપવાની વચ્ચે માટીને થોડી સૂકવવા દો. તમારી આંગળીને માટીમાં 2 સેમી ઊંડે નાખો — જ્યારે તે સૂકી લાગે ત્યારે જ પાણી આપો.',
    hi: 'हाँ, यह अधिक पानी देने का स्पष्ट संकेत है! पानी देने के बीच मिट्टी को थोड़ा सूखने दें। अपनी उंगली को मिट्टी में 2 सेमी डालें — जब यह सूखी लगे तभी पानी दें।',
  },
  {
    keywords: ['arjun can u provide me your number', 'arjun can you provide me your number'],
    gu: 'અર્જુન શું તમે મને તમારો નંબર આપી શકો છો?',
    hi: 'अर्जुन क्या आप मुझे अपना नंबर दे सकते हैं?',
  },

  // 5. Harvesting
  { keywords: ['harvesting'], gu: 'લણણી (ઉપજ)', hi: 'कटाई (उपज)' },
  {
    keywords: ['i am very glad that , i have used this app', 'i am very glad that i have used this app'],
    gu: 'મને ખૂબ આનંદ છે કે મેં આ એપનો ઉપયોગ કર્યો.',
    hi: 'मुझे बहुत खुशी है कि मैंने इस ऐप का उपयोग किया।',
  },

  // 6. Environment safety
  {
    keywords: ['about environment sefaty', 'about environment safety'],
    gu: 'પર્યાવરણ સુરક્ષા વિશે.',
    hi: 'पर्यावरण सुरक्षा के बारे में।',
  },
  {
    keywords: ['we r going to about the ..discus about ..how can we protect or environment from capatilist.'],
    gu: 'આપણે પર્યાવરણનું રક્ષણ કેવી રીતે કરી શકીએ તે વિશે ચર્ચા કરીએ.',
    hi: 'हम पर्यावरण की रक्षा कैसे कर सकते हैं, इस बारे में चर्चा करते हैं।',
  },
  {
    keywords: ['ok priya .. lets discuss', 'ok priya .. lets discus', 'ok priya.. lets discuss', 'ok priya'],
    gu: 'ઠીક છે પ્રિયા .. ચાલો ચર્ચા કરીએ',
    hi: 'ठीक है प्रिया .. चलो चर्चा करते हैं',
  },

  // 7. New plant
  { keywords: ['this is my new plant'], gu: 'આ મારો નવો છોડ છે', hi: 'यह मेरा नया पौधा है' },
  {
    keywords: ['lorem ipsum is simply dummy text of the printing and typesetting industry.'],
    gu: 'લોરેમ ઇપ્સમ એ પ્રિન્ટિંગ અને ટાઇપસેટિંગ ઉદ્યોગનો સામાન્ય ડમી ટેક્સ્ટ છે. તે દાયકાઓથી ડિઝાઇનિંગ અને પ્રકાશન માટે ઉદાહરણ ટેક્સ્ટ તરીકે વપરાય છે.',
    hi: 'लोरेम इप्सम प्रिंटिंग और टाइपसेटिंग उद्योग का डमी टेक्स्ट है। यह दशकों से डिजाइनिंग और प्रकाशन के लिए एक मानक नमूना टेक्स्ट रहा है।',
  },

  // 8. Plant's life
  { keywords: ["plant's life", 'plants life', 'plant life'], gu: 'છોડનું જીવન', hi: 'पौधों का जीवन' },
  { keywords: ['plants are planet'], gu: 'છોડ એ આપણો ગ્રહ છે.', hi: 'पौधे ही हमारी पृथ्वी हैं।' },

  // 9. Save Earth (with heading, and body only)
  { keywords: ['save earth'], gu: 'પૃથ્વી બચાવો', hi: 'पृथ्वी बचाओ' },
  {
    keywords: ['save earth\n\nearth is our home, and it provides us with air, water, food, and natural resources.'],
    gu: 'પૃથ્વી બચાવો\n\nપૃથ્વી આપણું ઘર છે, અને તે આપણને હવા, પાણી, ખોરાક અને કુદરતી સંસાધનો પૂરા પાડે છે. આજે પ્રદૂષણ, વૃક્ષોનું નિકંદન, આબોહવા પરિવર્તન અને પ્લાસ્ટિકનો વધુ પડતો ઉપયોગ આપણા ગ્રહને નુકસાન પહોંચાડી રહ્યા છે. આપણે વધુ વૃક્ષો વાવીને, પાણી અને વીજળી બચાવીને, પ્લાસ્ટિકનો ઉપયોગ ઘટાડીને અને આપણી આસપાસ સ્વચ્છતા રાખીને પર્યાવરણનું રક્ષણ કરવું જોઈએ. લાખો લોકો જોડાય ત્યારે દરેક નાનું પગલું મોટો બદલાવ લાવી શકે છે. પૃથ્વીનું રક્ષણ કરવું એ માત્ર સરકારોની જ નહીં પરંતુ દરેક વ્યક્તિની પણ જવાબદારી છે. તંદુરસ્ત પૃથ્વી એટલે દરેક માટે તંદુરસ્ત ભવિષ્ય.',
    hi: 'पृथ्वी बचाओ\n\nपृथ्वी हमारा घर है, और यह हमें हवा, पानी, भोजन और प्राकृतिक संसाधन प्रदान करती है। आज प्रदूषण, वनों की कटाई, जलवायु परिवर्तन और प्लास्टिक का अत्यधिक उपयोग हमारे ग्रह को नुकसान पहुंचा रहे हैं। हमें अधिक पेड़ लगाकर, पानी और बिजली की बचत करके, प्लास्टिक का उपयोग कम करके और अपने आसपास सफाई रखकर पर्यावरण की रक्षा करनी चाहिए। जब लाखों लोग भाग लेते हैं तो हर छोटा कदम बदलाव ला सकता है। पृथ्वी की रक्षा करना केवल सरकारों की ही नहीं बल्कि प्रत्येक व्यक्ति की भी जिम्मेदारी है। स्वस्थ पृथ्वी का अर्थ है सभी के लिए एक स्वस्थ भविष्य।',
  },
  {
    keywords: ['earth is our home, and it provides us with air, water, food, and natural resources.'],
    gu: 'પૃથ્વી આપણું ઘર છે, અને તે આપણને હવા, પાણી, ખોરાક અને કુદરતી સંસાધનો પૂરા પાડે છે. આજે પ્રદૂષણ, વૃક્ષોનું નિકંદન, આબોહવા પરિવર્તન અને પ્લાસ્ટિકનો વધુ પડતો ઉપયોગ આપણા ગ્રહને નુકસાન પહોંચાડી રહ્યા છે. આપણે વધુ વૃક્ષો વાવીને, પાણી અને વીજળી બચાવીને, પ્લાસ્ટિકનો ઉપયોગ ઘટાડીને અને આપણી આસપાસ સ્વચ્છતા રાખીને પર્યાવરણનું રક્ષણ કરવું જોઈએ. લાખો લોકો જોડાય ત્યારે દરેક નાનું પગલું મોટો બદલાવ લાવી શકે છે. પૃથ્વીનું રક્ષણ કરવું એ માત્ર સરકારોની જ નહીં પરંતુ દરેક વ્યક્તિની પણ જવાબદારી છે. તંદુરસ્ત પૃથ્વી એટલે દરેક માટે તંદુરસ્ત ભવિષ્ય.',
    hi: 'पृथ्वी हमारा घर है, और यह हमें हवा, पानी, भोजन और प्राकृतिक संसाधन प्रदान करती है। आज प्रदूषण, वनों की कटाई, जलवायु परिवर्तन और प्लास्टिक का अत्यधिक उपयोग हमारे ग्रह को नुकसान पहुंचा रहे हैं। हमें अधिक पेड़ लगाकर, पानी और बिजली की बचत करके, प्लास्टिक का उपयोग कम करके और अपने आसपास सफाई रखकर पर्यावरण की रक्षा करनी चाहिए। जब लाखों लोग भाग लेते हैं तो हर छोटा कदम बदलाव ला सकता है। पृथ्वी की रक्षा करना केवल सरकारों की ही नहीं बल्कि प्रत्येक व्यक्ति की भी जिम्मेदारी है। स्वस्थ पृथ्वी का अर्थ है सभी के लिए एक स्वस्थ भविष्य।',
  },

  // Showcase samples
  {
    keywords: ['first time growing mint in small containers! smells amazing.'],
    gu: 'નાના કૂંડામાં પહેલીવાર ફુદીનો ઉગાડ્યો! સુગંધ અદ્ભુત છે.',
    hi: 'छोटे बर्तनों में पहली बार पुदीना उगाया! खुशबू बहुत बढ़िया है।',
  },
  {
    keywords: ['organic pest repellent recipe: mix neem oil with soap water and spray weekly.'],
    gu: 'ઓર્ગેનિક જંતુનાશક રેસીપી: લીમડાના તેલને સાબુના પાણી સાથે મિક્સ કરો અને દર અઠવાડિયે છંટકાવ કરો.',
    hi: 'जैविक कीट विकर्षक नुस्खा: नीम के तेल को साबुन के पानी में मिलाएं और साप्ताहिक छिड़काव करें।',
  },
  {
    keywords: ['rooftop harvest of cherry tomatoes and bell peppers! delicious results.'],
    gu: 'ધાબા પરથી ચેરી ટામેટાં અને શિમલા મરચાંની લણણી! સ્વાદિષ્ટ પરિણામો.',
    hi: 'छत से चेरी टमाटर और शिमला मिर्च की उपज! स्वादिष्ट परिणाम।',
  },
];

const WATERING_AND_WEATHER_DICTIONARY = [
  { keywords: ['optimal conditions - follow schedule'], gu: 'શ્રેષ્ઠ સ્થિતિ - સમયપત્રક મુજબ ચાલો', hi: 'अनुकूल परिस्थितियाँ - अनुसूची का पालन करें' },
  { keywords: ['rain expected today - skip watering!'], gu: 'આજે વરસાદની શક્યતા - પાણી આપવાનું ટાળો!', hi: 'आज बारिश की संभावना - पानी देना टालें!' },
  { keywords: ['extreme heat - water in the evening!'], gu: 'અતિશય ગરમી - સાંજે પાણી આપો!', hi: 'अत्यधिक गर्मी - शाम को पानी दें!' },
  { keywords: ['hot day - consider extra watering'], gu: 'ગરમ દિવસ - વધારાનું પાણી આપવાનું વિચારો', hi: 'गर्म दिन - अतिरिक्त पानी देने पर विचार करें' },
  { keywords: ['high humidity - reduce watering'], gu: 'વધુ ભેજ - પાણી ઓછું આપો', hi: 'उच्च आर्द्रता - पानी कम दें' },
  { keywords: ['low humidity - increase misting'], gu: 'ઓછો ભેજ - વધુ છંટકાવ કરો', hi: 'कम आर्द्रता - मिस्टिंग बढ़ाएं' },
  { keywords: ['soil is dry - consider watering'], gu: 'માટી સૂકી છે - પાણી આપવાનું વિચારો', hi: 'मिट्टी सूखी है - पानी देने पर विचार करें' },

  // Adjustment reasons & notes
  { keywords: ['hot weather - extra water', 'hot weather extra water'], gu: 'ગરમ હવામાન — વધારાનું પાણી', hi: 'गर्म मौसम — अतिरिक्त पानी' },
  { keywords: ['rain forecasted - skip watering', 'rain forecasted skip watering'], gu: 'વરસાદની આગાહી — પાણી ન આપવું', hi: 'बारिश का पूर्वानुमान — पानी न दें' },
  { keywords: ['skipped by user'], gu: 'વપરાશકર્તા દ્વારા રદ કરાયું', hi: 'उपयोगकर्ता द्वारा छोड़ा गया' },
  { keywords: ['heatwave boost (+20%)', 'heatwave boost'], gu: 'હીટવેવ બૂસ્ટ (+20%)', hi: 'हीटवेव बूस्ट (+20%)' },
  { keywords: ['rain delay applied! skipping watering for 3 days.', 'rain delay applied'], gu: 'વરસાદ વિલંબ લાગુ કર્યો', hi: 'बारिश की देरी लागू की गई' },
  { keywords: ['heatwave boost applied! increased all volumes by 20%.', 'heatwave boost applied'], gu: 'હીટવેવ બૂસ્ટ લાગુ કર્યું', hi: 'हीटवेव बूस्ट लागू किया गया' },
  { keywords: ['weather adjusted'], gu: 'હવામાન સમાયોજિત', hi: 'मौसम अनुसार समायोजित' },
  { keywords: ['rest (0ml)'], gu: 'વિરામ (0ml)', hi: 'विश्राम (0ml)' },

  // Time of day
  { keywords: ['morning'], gu: 'સવાર', hi: 'सुबह' },
  { keywords: ['afternoon'], gu: 'બપોર', hi: 'दोपहर' },
  { keywords: ['evening'], gu: 'સાંજ', hi: 'शाम' },
  { keywords: ['night'], gu: 'રાત', hi: 'रात' },

  // Soil moisture
  { keywords: ['unknown plant', 'unknown'], gu: 'અજાણ્યો છોડ', hi: 'अज्ञात पौधा' },
  { keywords: ['current soil moisture'], gu: 'હાલનો માટી ભેજ', hi: 'वर्तमान मिट्टी की नमी' },
  { keywords: ['dry'], gu: 'સૂકી', hi: 'सूखी' },
  { keywords: ['good'], gu: 'સારો', hi: 'अच्छा' },
];

/** Task title patterns: first capture group is the target (plant) name. */
const TASK_PATTERNS = [
  { re: /^water\s+(.+)$/i, gu: (t) => `${t} માં પાણી આપો`, hi: (t) => `${t} में पानी दें` },
  { re: /^prune\s+(.+)$/i, gu: (t) => `${t} ની કાપણી કરો`, hi: (t) => `${t} की छंटाई करें` },
  { re: /^(?:fertilize|feed)\s+(.+)$/i, gu: (t) => `${t} ને ખાતર આપો`, hi: (t) => `${t} को खाद दें` },
  { re: /^harvest\s+(.+)$/i, gu: (t) => `${t} ની લણણી કરો`, hi: (t) => `${t} की कटाई करें` },
  { re: /^(?:plant|sow)\s+(.+)$/i, gu: (t) => `${t} રોપો`, hi: (t) => `${t} लगाएं` },
  { re: /^(?:pest check|check pests on|inspect)\s+(.+)$/i, gu: (t) => `${t} પર જીવાત તપાસો`, hi: (t) => `${t} पर कीटों की जाँच करें` },
  { re: /^repot\s+(.+)$/i, gu: (t) => `${t} ને નવા કૂંડામાં રોપો`, hi: (t) => `${t} को नए गमले में लगाएं` },
  { re: /^mist\s+(.+)$/i, gu: (t) => `${t} પર પાણીનો છંટકાવ કરો`, hi: (t) => `${t} पर पानी का छिड़काव करें` },
];

// ---------------------------------------------------------------------------
// Index building (runs once at module load)
// ---------------------------------------------------------------------------

const SUPPORTED_LANGS = ['gu', 'hi'];
const PREFIX_LEN = 35; // long keywords also match by their first 35 chars
const MAX_CACHE = 1000;

/** Lowercase, unify dashes/apostrophes, collapse whitespace. */
const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Remove trailing punctuation so "Healthy!" matches "healthy". */
const stripEnd = (s) => s.replace(/[\s.,!?:;-]+$/, '').trim();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EXACT = new Map();
const PREFIX = new Map();

/** Dictionaries searched for whole-text matches, in priority order. */
const WHOLE_TEXT_SOURCES = [
  NAME_DICTIONARY,
  WATERING_AND_WEATHER_DICTIONARY,
  COMMUNITY_DICTIONARY,
  DISEASE_TEXT_DICTIONARY,
  DISEASE_DICTIONARY,
  GARDEN_DICTIONARY,
];

for (const dict of WHOLE_TEXT_SOURCES) {
  for (const entry of dict) {
    for (const kw of entry.keywords) {
      const n = normalize(kw);
      const s = stripEnd(n);
      if (!EXACT.has(n)) EXACT.set(n, entry);
      if (s && !EXACT.has(s)) EXACT.set(s, entry);
      if (n.length >= PREFIX_LEN) {
        const p = n.slice(0, PREFIX_LEN);
        if (!PREFIX.has(p)) PREFIX.set(p, entry);
      }
    }
  }
}

/**
 * Word-boundary tokens for translating short phrases (plant names, soils,
 * seasons, disease names). Longest keyword first so "bell pepper" beats
 * "pepper" and "sandy loam" beats "loam".
 */
const TOKENS = [];
const addTokens = (dict, { plant = false } = {}) => {
  for (const entry of dict) {
    if (entry.exactOnly) continue;
    for (const kw of entry.keywords) {
      TOKENS.push({
        len: kw.length,
        plant,
        gu: entry.gu,
        hi: entry.hi,
        // Not preceded/followed by a letter; digits after are OK ("Rose2").
        re: new RegExp(`(?<!\\p{L})${escapeRegExp(kw)}(?!\\p{L})`, 'giu'),
      });
    }
  }
};
addTokens(PLANT_DICTIONARY, { plant: true });
addTokens(SOIL_SEASON_DICTIONARY);
addTokens(DISEASE_DICTIONARY);
TOKENS.sort((a, b) => b.len - a.len);

const PLANT_WORD_RE = /(?<!\p{L})plants?(?!\p{L})/giu;
const PLANT_SUFFIX = {
  gu: (s) => (s.includes('છોડ') ? s : `${s}નો છોડ`),
  hi: (s) => (s.includes('पौधा') ? s : `${s} का पौधा`),
};

// ---------------------------------------------------------------------------
// Translation steps
// ---------------------------------------------------------------------------

function lookupWholeText(str, lang) {
  const n = normalize(str);
  const entry =
    EXACT.get(n) ||
    EXACT.get(stripEnd(n)) ||
    (n.length >= PREFIX_LEN ? PREFIX.get(n.slice(0, PREFIX_LEN)) : undefined);
  return entry ? entry[lang] || null : null;
}

function translateByTokens(str, lang) {
  // Only short, name-like strings; never rewrite paragraphs word by word.
  if (str.length > 60 || str.split(/\s+/).length > 6) return null;

  let vol = '';
  let head = str;
  const volMatch = str.match(/\s*(\(\s*\d+(?:\.\d+)?\s*(?:ml|l|ltr|g|kg|oz|cups?)\s*\))\s*$/i); // e.g. "(700ml)", "(1L)"
  if (volMatch) {
    vol = ` ${volMatch[1]}`;
    head = str.slice(0, volMatch.index).trim();
  }
  if (!head) return null;

  const slots = [];
  let work = head;
  for (const t of TOKENS) {
    if (!t[lang]) continue;
    work = work.replace(t.re, () => {
      slots.push({ text: t[lang], plant: t.plant });
      return `\u0001${slots.length - 1}\u0002`;
    });
  }
  if (!slots.length) return null;

  // "Rose Plant" -> drop the word "plant" and attach it grammatically.
  let hasPlantWord = false;
  work = work
    .replace(PLANT_WORD_RE, () => {
      hasPlantWord = true;
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();
  if (hasPlantWord) {
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

  // 2. List prefixes: "1. ...", "- ...", "• ..."
  const listMatch = str.match(/^(\d+\.\s*|-\s*|•\s*)([\s\S]+)$/);
  if (listMatch) return `${listMatch[1]}${translate(listMatch[2].trim(), lang)}`;

  // "Diagnosed: Powdery Mildew"
  const diagMatch = str.match(/^diagnosed:\s*([\s\S]+)$/i);
  if (diagMatch) return translate(diagMatch[1].trim(), lang);

  // 3. Task patterns ("Water Rose2 (1L)")
  for (const p of TASK_PATTERNS) {
    const m = str.match(p.re);
    if (m && m[1].split(/\s+/).length <= 6) {
      return p[lang](translate(m[1].trim(), lang));
    }
  }

  // 4. Short phrases: plant / soil / season / disease tokens
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
      /* localStorage unavailable (SSR / privacy mode) */
    }
  }
  return String(l || 'en').split('-')[0].toLowerCase();
};

/**
 * Translate dynamic DB text into the active language.
 * @param {string} text  Text from the database.
 * @param {string|null} lang  'en' | 'gu' | 'hi' (defaults to localStorage 'language').
 * @returns {string} Translated text, or the original text if no translation is known.
 */
export const getLocalizedDynamicText = (text, lang = null) => {
  try {
    if (!text || typeof text !== 'string') return text || '';

    const currentLang = resolveLang(lang);
    if (!SUPPORTED_LANGS.includes(currentLang)) return text;

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