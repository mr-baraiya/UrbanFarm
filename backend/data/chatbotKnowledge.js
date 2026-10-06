/**
 * Platform Knowledge Base & Safety Guidelines for Krishi AI
 * Multi-language verified platform routes, step-by-step feature guides,
 * and agronomic plant care instructions.
 */

const VALID_PLATFORM_ROUTES = [
  '/app/diagnosis',
  '/app/diagnose',
  '/app/watering',
  '/app/gardens',
  '/app/crops',
  '/app/community',
  '/contact',
  '/admin/dashboard',
  '/admin/users',
  '/admin/gardens',
  '/admin/moderation',
  '/admin/leads',
  '/admin/audit',
  '/admin/logs',
  '/admin/settings',
];

const PLATFORM_ROUTES = {
  diagnosis: '/app/diagnosis',
  diagnose: '/app/diagnose',
  watering: '/app/watering',
  gardens: '/app/gardens',
  crops: '/app/crops',
  community: '/app/community',
  contact: '/contact',
  adminDashboard: '/admin/dashboard',
  adminUsers: '/admin/users',
  adminGardens: '/admin/gardens',
  adminModeration: '/admin/moderation',
  adminLeads: '/admin/leads',
  adminAudit: '/admin/audit',
  adminLogs: '/admin/logs',
  adminSettings: '/admin/settings',
};

const KNOWLEDGE_BASE = {
  diagnosis: {
    en: {
      title: 'AI Plant Disease Diagnosis',
      route: '/app/diagnosis',
      steps: `Hello! I am Krishi AI 🌿. If your plant is showing spots, yellowing, or wilted leaves, I can help you diagnose its health right away!

Here is how we can check your plant together:
• Take a clear photo of the affected leaf or stem.
• Upload the photo to our **AI Disease Diagnosis** analyzer.
• Receive an instant diagnosis, confidence score, and step-by-step organic remedies.

Click the button below to start diagnosing your plant!`,
      quickActionLabel: 'Open AI Diagnosis',
      followUps: [
        'How to take a clear photo of the leaf?',
        'What organic treatment should I use?',
        'Can infected leaves spread to other plants?'
      ]
    },
    gu: {
      title: 'AI રોગ નિદાન',
      route: '/app/diagnosis',
      steps: `નમસ્તે! હું કૃષિ AI છું 🌿. જો તમારા છોડના પાંદડા પીળા પડી રહ્યા હોય કે તેમાં ડાઘ દેખાતા હોય, તો હું તમને તુરંત માર્ગદર્શન આપી શકું છું!

આપણે છોડનું રોગ નિદાન કેવી રીતે કરી શકીએ:
• અસરગ્રસ્ત પાંદડાનો સ્પષ્ટ ફોટો લો.
• અમારા **AI રોગ નિદાન** ફિચરમાં ફોટો અપલોડ કરો.
• હું તમને રોગનું નામ, ચોકસાઈ અને દેશી/ઓર્ગેનિક ઉપાયો આપવામા મદદ કરીશ.

નીચે આપેલ બટન પર ક્લિક કરીને તુરંત રોગ નિદાન શરૂ કરો!`,
      quickActionLabel: 'AI રોગ નિદાન ખોલો',
      followUps: [
        'પાંદડાનો સ્પષ્ટ ફોટો કેવી રીતે લેવો?',
        'કયા દેશી ઉપચાર કરવા?',
        'ચેપગ્રસ્ત પાંદડા કાપી નાખવા જોઈએ?'
      ]
    },
    hi: {
      title: 'AI रोग निदान',
      route: '/app/diagnosis',
      steps: `नमस्ते! मैं कृषि AI हूँ 🌿। यदि आपके पौधे के पत्ते पीले पड़ रहे हैं या उनमें धब्बे दिख रहे हैं, तो मैं तुरंत सहायता कर सकती हूँ!

हम पौधे का रोग निदान कैसे कर सकते हैं:
• प्रभावित पत्ते या तने की एक स्पष्ट फोटो लें।
• हमारे **AI रोग निदान** सेक्शन में फोटो अपलोड करें।
• मैं आपको बीमारी का नाम, सटीकता और प्रभावी जैविक उपचार बताएँगी।

नीचे दिए गए बटन पर क्लिक करके अभी रोग निदान शुरू करें!`,
      quickActionLabel: 'AI रोग निदान खोलें',
      followUps: [
        'पत्ते की साफ फोटो कैसे लें?',
        'कौन सा जैविक उपचार सबसे अच्छा है?',
        'क्या बीमार पत्तों को काट देना चाहिए?'
      ]
    }
  },

  watering: {
    en: {
      title: 'Smart Watering Schedule',
      route: '/app/watering',
      steps: `Hello! I am Krishi AI 🌿. I can help you create an intelligent watering plan tailored to your local weather!

Here is how Smart Irrigation keeps your garden healthy:
• We connect your live weather forecast (temperature, humidity, rain) with your plants' water needs.
• You get a personalized 7-day schedule with automated reminders.
💡 **Pro Tip**: Water early in the morning (6–8 AM) to minimize evaporation and keep roots strong!`,
      quickActionLabel: 'Open Smart Watering',
      followUps: [
        'How does temperature affect watering?',
        'Signs of overwatering vs underwatering?',
        'How to set up container drainage?'
      ]
    },
    gu: {
      title: 'સ્માર્ટ સિંચાઈ આયોજન',
      route: '/app/watering',
      steps: `નમસ્તે! હું કૃષિ AI છું 🌿. હું તમને હવામાન અનુસાર પાણી આપવાનું સ્માર્ટ આયોજન કરવામાં મદદ કરી શકું છું!

અમારું સ્માર્ટ વોટરિંગ સિસ્ટમ કેવી રીતે કામ કરે છે:
• તમારા વિસ્તારના હવામાન (તાપમાન, વરસાદ) સાથે છોડની જરૂરિયાત મેળવાય છે.
• તમને આગામી ૭ દિવસનું ચોક્કસ ટાઇમટેબલ અને રિમાઇન્ડર મળશે.
💡 **ખાસ ટિપ**: સવારે ૬ થી ૮ ની વચ્ચે પાણી આપવું છોડ માટે સૌથી ઉત્તમ છે!`,
      quickActionLabel: 'સ્માર્ટ વોટરિંગ ખોલો',
      followUps: [
        'ગરમીમાં કેટલું પાણી આપવું?',
        'વધુ પાણી અપાઈ ગયું હોય તો શું કરવું?',
        'કુંડામાં ડ્રેનેજ હોલ કેવી રીતે તપાસવો?'
      ]
    },
    hi: {
      title: 'स्मार्ट सिंचाई शेड्यूल',
      route: '/app/watering',
      steps: `नमस्ते! मैं कृषि AI हूँ 🌿। मैं आपके स्थानीय मौसम के अनुसार सही सिंचाई शेड्यूल बनाने में आपकी मदद कर सकती हूँ!

स्मार्ट सिंचाई आपके पौधों का ख्याल कैसे रखती है:
• आपके क्षेत्र के लाइव मौसम (तापमान, बारिश) के आधार पर पानी की सही मात्रा तय होती है।
• आपको अगले ७ दिनों का सटीक शेड्यूल और रिमाइंडर मिलेगा।
💡 **महत्वपूर्ण सुझाव**: सुबह जल्दी (६ से ८ बजे) पानी देना पौधों की जड़ों के लिए सबसे लाभकारी होता है!`,
      quickActionLabel: 'स्मार्ट सिंचाई खोलें',
      followUps: [
        'गर्मी में पौधों को कितना पानी चाहिए?',
        'ज्यादा पानी देने के क्या लक्षण हैं?',
        'गमले में जलनिकासी कैसे ठीक करें?'
      ]
    }
  },

  gardens: {
    en: {
      title: 'My Gardens & Plant Management',
      route: '/app/gardens',
      steps: `Hello! I am Krishi AI 🌿. I can help you organize and track your balcony or terrace garden spaces!

Here is how you can manage your garden with me:
• Add your garden space (Balcony, Terrace, Windowsill, or Backyard).
• Add your plants, herbs, or vegetables to track growth milestones and health logs.
• Keep all your watering and fertilizer records in one place!`,
      quickActionLabel: 'View My Gardens',
      followUps: [
        'What soil mix is best for pots?',
        'How much sunlight do leafy greens need?',
        'How to companion plant in small spaces?'
      ]
    },
    gu: {
      title: 'મારા બગીચાઓ અને છોડ વ્યવસ્થાપન',
      route: '/app/gardens',
      steps: `નમસ્તે! હું કૃષિ AI છું 🌿. હું તમારા બાલ્કની કે ટેરેસ બગીચાનું વ્યવસ્થાપન કરવામાં તમારી મદદ કરીશ!

આપણે બગીચાનું આયોજન કેવી રીતે કરી શકીએ:
• તમારો બગીચો ઉમેરો (બાલ્કની, ધાબું કે આંગણું).
• તમારા શાકભાજી કે ફૂલોના છોડ ઉમેરીને તેમનો વિકાસ અને પાણી આપવાનો હિસાબ રાખો.`,
      quickActionLabel: 'મારા બગીચાઓ જુઓ',
      followUps: [
        'કુંડા માટે શ્રેષ્ઠ માટી મિશ્રણ કયું?',
        'ભાજીઓને કેટલી તડકાની જરૂર હોય?',
        'ઓછી જગ્યામાં વધુ છોડ કેવી રીતે ઉગાડવા?'
      ]
    },
    hi: {
      title: 'मेरे बगीचे और पौधे प्रबंधन',
      route: '/app/gardens',
      steps: `नमस्ते! मैं कृषि AI हूँ 🌿। मैं आपकी बालकनी या छत के बगीचे को व्यवस्थित करने में आपकी मदद कर सकती हूँ!

हम बगीचे का प्रबंधन कैसे कर सकते हैं:
• अपना नया बगीचा जोड़ें (बालकनी, छत, खिड़की या आँगन)।
• अपने पसंदीदा पौधे जोड़ें और उनकी वृद्धि और स्वास्थ्य का रिकॉर्ड रखें।`,
      quickActionLabel: 'मेरे बगीचे देखें',
      followUps: [
        'गमलों के लिए उत्तम मिट्टी का मिश्रण क्या है?',
        'हरी पत्तेदार सब्जियों को कितनी धूप चाहिए?',
        'कम जगह में ज्यादा पौधे कैसे लगाएं?'
      ]
    }
  },

  crops: {
    en: {
      title: 'AI Crop Recommendation',
      route: '/app/crops',
      steps: `Hello! I am Krishi AI 🌿. I can suggest the best high-yield crops for your balcony or terrace garden!

Based on your soil type, sunlight, space, and current season, I will recommend the top vegetables, herbs, or fruits that thrive best in your location.

Tap below to view tailored crop suggestions!`,
      quickActionLabel: 'Open Crop Guide',
      followUps: [
        'What crops grow best in shade?',
        'Easiest vegetables for beginners?',
        'How long until first harvest?'
      ]
    },
    gu: {
      title: 'AI પાક ભલામણ',
      route: '/app/crops',
      steps: `નમસ્તે! હું કૃષિ AI છું 🌿. હું તમારી જગ્યા અને ઋતુ અનુસાર શ્રેષ્ઠ પાકની ભલામણ કરી શકું છું!

તમારી માટી, સૂર્યપ્રકાશ અને જગ્યાના આધારે હું તમને વધુ ઉપજ આપતા શાકભાજી અને છોડ પસંદ કરવામાં મદદ કરીશ.`,
      quickActionLabel: 'પાક માર્ગદર્શિકા ખોલો',
      followUps: [
        'છાંયડામાં કયા શાકભાજી થાય?',
        'નવા માળી માટે સરળ પાક કયા?',
        'વાવણી પછી લણણી ક્યારે થાય?'
      ]
    },
    hi: {
      title: 'AI फसल सुझाव',
      route: '/app/crops',
      steps: `नमस्ते! मैं कृषि AI हूँ 🌿। मैं आपकी जगह और मौसम के अनुसार सर्वोत्तम फसलों के सुझाव दे सकती हूँ!

आपकी मिट्टी, धूप और मौसम के आधार पर मैं आपको सबसे ज्यादा फल देने वाली सब्जियों और पौधों की सिफारिश करूँगी।`,
      quickActionLabel: 'फसल गाइड खोलें',
      followUps: [
        'कम धूप में कौन सी सब्जियां उग सकती हैं?',
        'शुरुआत के लिए सबसे आसान पौधे कौन से हैं?',
        'कटाई में कितना समय लगता है?'
      ]
    }
  },

  community: {
    en: {
      title: 'UrbanFarm Community Hub',
      route: '/app/community',
      steps: `To join and share on the Community Hub:
1. Visit "Community" (/app/community).
2. Share photos of your home harvest, ask farming questions, and post tips.
3. Like, comment, and learn from other urban farmers across India and worldwide.`,
      quickActionLabel: 'Visit Community',
      followUps: [
        'How to share my harvest photos?',
        'Can I ask pest questions in community?',
        'Are there local urban growers groups?'
      ]
    },
    gu: {
      title: 'અર્બનફાર્મ કમ્યુનિટી હબ',
      route: '/app/community',
      steps: `કમ્યુનિટી હબમાં જોડાવા માટે:
૧. "Community" (/app/community) પેજ પર જાઓ.
૨. તમારા ઘરે ઉગાડેલ પાકના ફોટા શેર કરો, ખેતી વિષયક પ્રશ્નો પૂછો અને ટીપ્સ આપો.
૩. અન્ય શહેરી ખેડૂતો સાથે લાઈક, કમેન્ટ અને અનુભવોની આપ-લે કરો.`,
      quickActionLabel: 'કમ્યુનિટી જુઓ',
      followUps: [
        'મારા પાકના ફોટા કેવી રીતે મૂકવા?',
        'કમ્યુનિટીમાં અન્ય ખેડૂતોને પ્રશ્ન પૂછી શકાય?',
        'શહેરી ખેડૂતોના અનુભવો કેવી રીતે જોવા?'
      ]
    },
    hi: {
      title: 'अर्बनफार्म कम्युनिटी हब',
      route: '/app/community',
      steps: `कम्युनिटी हब से जुड़ने के लिए:
१. "Community" (/app/community) पेज पर जाएं।
२. अपनी बागवानी के फोटो साझा करें, सवाल पूछें और सुझाव दें।
३. अन्य शहरी किसानों के साथ संवाद करें और अनुभव साझा करें।`,
      quickActionLabel: 'कम्युनिटी देखें',
      followUps: [
        'फसल की तस्वीरें कैसे साझा करें?',
        'क्या अन्य बागवानों से सुझाव ले सकते हैं?',
        'कम्युनिटी में नए पोस्ट कैसे लिखें?'
      ]
    }
  },

  pests: {
    en: {
      title: 'Organic Pest & Bug Control',
      route: '/app/diagnosis',
      steps: `Common urban garden pests and organic remedies:
1. **Aphids & Whiteflies**: Spray diluted cold-pressed Neem oil (5ml per liter of water + 2 drops mild soap) once every 5 days in the evening.
2. **Mealybugs**: Dab affected areas with a cotton swab soaked in 70% rubbing alcohol, or spray strong water pressure.
3. **Caterpillars**: Handpick into soapy water or spray Bacillus thuringiensis (Bt).
4. **Fungal Powdery Mildew**: Mix 1 part milk with 9 parts water or baking soda solution (5g/L) and spray foliage in morning sunlight.
⚠️ Always test homemade sprays on a single leaf first before full application.`,
      quickActionLabel: 'Diagnose Plant Health',
      followUps: [
        'How to make organic neem oil spray?',
        'How to prevent mealybugs from returning?',
        'Are companion plants good for pest control?'
      ]
    },
    gu: {
      title: 'ઓર્ગેનિક જીવાત નિયંત્રણ',
      route: '/app/diagnosis',
      steps: `સામાન્ય જીવાત અને તેના કુદરતી/ઓર્ગેનિક ઉપાયો:
૧. **મોલો-મશી (Aphids) અને સફેદ માખી**: ૧ લીટર પાણીમાં ૫ મિલી લીમડાનું તેલ (Neem oil) અને ૨ ટીપાં પ્રવાહી સાબુ મેળવી સાંજે છંટકાવ કરવો.
૨. **મીલીબગ (Mealybugs)**: આલ્કોહોલ અથવા સાબુવાળા પાણીના સ્પ્રે દ્વારા સાફ કરવું.
૩. **ઈયળો**: હાથથી વીણીને દૂર કરવી.
૪. **છાશ/દૂધનો સ્પ્રે**: ફંગસ માટે ખાટી છાશ અથવા દૂધનું મિશ્રણ ઉત્તમ દેશી ઉપાય છે.
⚠️ હંમેશાં સાંજના સમયે છંટકાવ કરવો જેથી પાંદડા બળી ન જાય.`,
      quickActionLabel: 'રોગ નિદાન કરો',
      followUps: [
        'લીમડાના તેલનો સ્પ્રે કેવી રીતે બનાવવો?',
        'મીલીબગથી કાયમી છુટકારો કેવી રીતે મેળવવો?',
        'ગલગોટા (Marigold) વાવવાથી જીવાત દૂર રહે?'
      ]
    },
    hi: {
      title: 'जैविक कीट नियंत्रण',
      route: '/app/diagnosis',
      steps: `शहरी बागवानी के मुख्य कीट और उनके जैविक समाधान:
१. **माहू (Aphids) और सफेद मक्खी**: १ लीटर पानी में ५ मिली नीम का तेल (Neem oil) और २ बूंद लिक्विड साबुन मिलाकर शाम को छिड़कें।
२. **मिलीबग (Mealybugs)**: रुई को अल्कोहल में भिगोकर कीटों पर लगाएं या तेज धार वाले पानी से धोएं।
३. **इल्लियां (Caterpillars)**: पौधों से हाथ से हटा दें।
४. **फफूंद / सफेद पाउडर**: खट्टी छाछ या बेकिंग सोडा का हल्का घोल छिड़कें।
⚠️ धूप में कभी भी नीम का छिड़काव न करें; हमेशा शाम के समय ही करें।`,
      quickActionLabel: 'रोग निदान खोलें',
      followUps: [
        'नीम तेल का स्प्रे कैसे तैयार करें?',
        'मिलीबग को दोबारा आने से कैसे रोकें?',
        'कीटों को दूर रखने वाले पौधे कौन से हैं?'
      ]
    }
  },

  fertilizers: {
    en: {
      title: 'Organic Fertilizers & Soil Nutrients',
      route: '/app/gardens',
      steps: `Top organic fertilizers for container & terrace gardening:
1. **Vermicompost (Earthworm compost)**: Rich in nitrogen and beneficial microbes. Add 2 handfuls per pot every 3 weeks.
2. **Banana Peel Water**: Excellent potassium source for flowering and fruiting plants (Tomatoes, Chillies, Roses). Soak peels in water for 48 hours.
3. **Epsom Salt (Magnesium Sulfate)**: 1 teaspoon per liter of water once a month promotes lush green leaves and prevents yellowing.
4. **Crushed Eggshells**: Slow-release calcium to prevent blossom end rot in tomatoes and capsicums.
5. **Mustard Cake Liquid Fertilizer**: Great seasonal boost for winter vegetables.`,
      quickActionLabel: 'Manage Gardens & Soil',
      followUps: [
        'How often should I fertilize pots?',
        'How to make liquid banana peel tea?',
        'Signs of nutrient deficiency in plants?'
      ]
    },
    gu: {
      title: 'ઓર્ગેનિક ખાતર અને પોષક તત્ત્વો',
      route: '/app/gardens',
      steps: `કુંડા અને ટેરેસ બગીચા માટે શ્રેષ્ઠ દેશી/ઓર્ગેનિક ખાતરો:
૧. **અળસિયાનું ખાતર (Vermicompost)**: નાઈટ્રોજનથી ભરપૂર. દર ૨૦ દિવસે દરેક કુંડામાં ૨ મુઠ્ઠી આપવું.
૨. **કેળાની છાલનું પાણી**: પોટેશિયમથી ભરપૂર, ટામેટાં, મરચાં અને ગુલાબમાં વધુ ફૂલો માટે શ્રેષ્ઠ.
૩. **એપ્સમ સોલ્ટ**: મહિને ૧ વાર ૧ ચમચી પાણીમાં ઓગાળી છાંટવાથી પાંદડા લીલાછમ રહે છે.
૪. **છાણીયું જૂનું ખાતર**: માટીને ફળદ્રુપ અને પોચી રાખે છે.`,
      quickActionLabel: 'બગીચા સંભાળ જુઓ',
      followUps: [
        'કુંડામાં ખાતર કેટલી વારે આપવું?',
        'કેળાની છાલનું ખાતર કેવી રીતે બનાવવું?',
        'પીળા પાંદડા શેની ખામી દર્શાવે છે?'
      ]
    },
    hi: {
      title: 'जैविक खाद और पोषक तत्व',
      route: '/app/gardens',
      steps: `गमलों और छत के बगीचे के लिए उत्तम जैविक खादें:
१. **वर्मीकम्पोस्ट (केंचुआ खाद)**: नाइट्रोजन और सूक्ष्मजीवों का उत्तम स्रोत। हर ३ हफ्ते में २ मुट्ठी प्रति गमला डालें।
२. **केले के छिलके का पानी**: पोटाश का प्राकृतिक स्रोत, टमाटर, मिर्च और गुलाब में फूल-फल बढ़ाने के लिए उत्तम।
३. **एप्सम सॉल्ट**: महीने में १ बार १ चम्मच पानी में मिलाकर छिड़कने से पत्तियां हरी और चमकदार रहती हैं।
४. **सड़ी हुई गोबर की खाद**: मिट्टी की जलधारण क्षमता और उर्वरता बढ़ाती है।`,
      quickActionLabel: 'बगीचे और मिट्टी देखें',
      followUps: [
        'गमले में खाद कितने दिनों में देनी चाहिए?',
        'केले के छिलके की लिक्विड खाद कैसे बनाएं?',
        'पौधों में पोषण की कमी कैसे पहचानें?'
      ]
    }
  },

  safety: {
    en: {
      title: 'Agricultural Chemical Safety Guardrails',
      route: '/contact',
      steps: `IMPORTANT SAFETY GUIDELINES:
1. **Prioritize Organic Solutions**: Always start with natural remedies (Neem, Bio-fungicides, physical barriers) before considering chemicals.
2. **Never Mix Unknown Chemicals**: Do NOT combine different commercial pesticides or fertilizers unless explicitly instructed on the official manufacturer label.
3. **Protective Gear**: Always wear gloves, safety glasses, and a face mask when handling any agricultural solutions.
4. **Safe Storage**: Store all garden inputs in their original labeled containers, locked away from children and pets.
5. **Harvest Waiting Period**: Respect the "Pre-Harvest Interval" (PHI) — wait required days between treatment and eating homegrown crops.
⚠️ For severe infestations or doubtful chemical usage, consult your regional agricultural extension center.`,
      quickActionLabel: 'Contact Agricultural Support',
      followUps: [
        'What is the safest organic pesticide?',
        'How many days after neem spray can I eat vegetables?',
        'How to dispose of garden chemical leftovers?'
      ]
    },
    gu: {
      title: 'કૃષિ સુરક્ષા અને સાવચેતી નિયમો',
      route: '/contact',
      steps: `મહત્વપૂર્ણ સુરક્ષા માર્ગદર્શિકા:
૧. **પ્રથમ ઓર્ગેનિક પસંદ કરો**: રાસાયણિક દવાઓ કરતાં લીમડાનું અર્ક, ટ્રાઇકોડર્મા અને દેશી ઉપાયો પ્રથમ અજમાવો.
૨. **દવાઓનું મિશ્રણ ન કરો**: જુદી જુદી રાસાયણિક દવાઓ ક્યારેય ભેગી ન કરવી.
૩. **રક્ષણાત્મક સાધનો**: છંટકાવ વખતે મોઢે માસ્ક અને હાથમાં મોજાં જરૂર પહેરો.
૪. **બાળકો-પાલતુ પ્રાણીઓથી દૂર**: દવાઓ હંમેશાં ઊંચાઈ પર અને બંધ જગ્યાએ રાખો.
૫. **ફળ-શાકભાજી ધોઈને વાપરો**: દવા છાંટ્યા પછીના જરૂરી દિવસો સુધી શાકભાજી ન તોડવા.
⚠️ ગંભીર રોગ માટે નજીકના કૃષિ વિજ્ઞાન કેન્દ્ર (KVK) નો સંપર્ક કરવો.`,
      quickActionLabel: 'કૃષિ સહાય મેળવો',
      followUps: [
        'સૌથી સુરક્ષિત ઓર્ગેનિક સ્પ્રે કયો?',
        'દવા છાંટ્યા પછી શાકભાજી ક્યારે ખાઈ શકાય?',
        'ખાતર બનાવતી વખતે શું કાળજી રાખવી?'
      ]
    },
    hi: {
      title: 'कृषि सुरक्षा और सावधानियां',
      route: '/contact',
      steps: `महत्वपूर्ण सुरक्षा निर्देश:
१. **जैविक उपायों को प्राथमिकता दें**: रासायनिक दवाओं से पहले नीम तेल, जैविक फफूंदनाशक और घरेलू नुस्खे अपनाएं।
२. **रसायनों का अनियंत्रित मिश्रण न करें**: बिना लेबल निर्देश के कभी भी दो रसायनों को आपस में न मिलाएं।
३. **सुरक्षा उपकरण**: दवा छिड़कते समय मास्क और दस्ताने (Gloves) अवश्य पहनें।
४. **बच्चों और पालतू जानवरों से दूर रखें**: सभी कीटनाशकों को मूल डिब्बे में सुरक्षित ताले में रखें।
५. **तुड़ाई का समय (PHI)**: दवा छिड़कने के बाद निर्धारित दिनों तक सब्जियों की तुड़ाई न करें और खाने से पहले अच्छी तरह धोएं।
⚠️ गंभीर समस्याओं के लिए स्थानीय कृषि विज्ञान केंद्र या विशेषज्ञ से संपर्क करें।`,
      quickActionLabel: 'कृषि सहायता संपर्क',
      followUps: [
        'सबसे सुरक्षित जैविक कीटनाशक कौन सा है?',
        'छिड़काव के कितने दिन बाद सब्जियां खा सकते हैं?',
        'घर पर खाद बनाते समय क्या सावधानियां रखें?'
      ]
    }
  },

  general: {
    en: {
      title: 'Krishi AI Guide',
      route: '/app/diagnosis',
      steps: `Hello! I am Krishi AI, your Intelligent AI Farming Guide for UrbanFarm. 🌿
I am here to guide you step-by-step with:
- AI Plant Disease Diagnosis from photos (/app/diagnosis)
- Smart weather-based watering schedules (/app/watering)
- Managing urban gardens & container plants (/app/gardens)
- Tailored crop suggestions for balconies & terraces (/app/crops)
- Connecting with urban farmers on the Community Hub (/app/community)
- Organic pest control & homemade bio-fertilizer recipes

What would you like assistance with today?`,
      quickActionLabel: 'Diagnose Plants',
      followUps: [
        'How do I diagnose my plant?',
        'When should I water my plants?',
        'What should I grow this season?'
      ]
    },
    gu: {
      title: 'કૃષિ AI માર્ગદર્શિકા',
      route: '/app/diagnosis',
      steps: `નમસ્તે! હું કૃષિ AI છું, તમારી અર્બનફાર્મ કૃષિ સહાયક. 🌿
હું તમને નીચેની બાબતોમાં પગલાંવાર સહાય કરી શકું છું:
- ફોટો દ્વારા છોડના રોગનું નિદાન કરવું (/app/diagnosis)
- હવામાન આધારિત સ્માર્ટ પાણી આપવાનું સમયપત્રક (/app/watering)
- બાલ્કની અને ટેરેસ બગીચાનું આયોજન (/app/gardens)
- ઋતુ મુજબ યોગ્ય પાકની પસંદગી (/app/crops)
- અર્બનફાર્મ કમ્યુનિટીમાં ચર્ચા (/app/community)
- ઓર્ગેનિક જીવાત નિયંત્રણ અને દેશી ખાતરો

આજે હું તમને કઈ રીતે મદદ કરી શકું?`,
      quickActionLabel: 'રોગ નિદાન ખોલો',
      followUps: [
        'મારા છોડનું રોગ નિદાન કેવી રીતે કરવું?',
        'સ્માર્ટ વોટરિંગ કેવી રીતે સેટ કરવું?',
        'બાલ્કની માટે સારા શાકભાજી કયા?'
      ]
    },
    hi: {
      title: 'कृषि AI मार्गदर्शिका',
      route: '/app/diagnosis',
      steps: `नमस्ते! मैं कृषि AI हूँ, आपकी अर्बनफार्म कृषि सहायक। 🌿
मैं निम्नलिखित कार्यों में आपकी चरण-दर-चरण सहायता कर सकती हूँ:
- पत्तों की फोटो से पौधे के रोग का निदान (/app/diagnosis)
- मौसम आधारित स्मार्ट सिंचाई शेड्यूल (/app/watering)
- छत व बालकनी के लिए बगीचे का प्रबंधन (/app/gardens)
- मौसम के अनुसार बेहतरीन फसलों के सुझाव (/app/crops)
- किसान कम्युनिटी में चर्चा और अनुभव साझा करना (/app/community)
- जैविक कीट नियंत्रण और घरेलू खाद बनाने के उपाय

आज मैं आपकी क्या सहायता कर सकती हूँ?`,
      quickActionLabel: 'रोग निदान खोलें',
      followUps: [
        'पौधे का रोग निदान कैसे करें?',
        'पौधों को पानी कब और कितना दें?',
        'इस मौसम में कौन सी सब्जियां उगाएं?'
      ]
    }
  },

  unknown: {
    en: {
      title: 'UrbanFarm Guidance',
      route: '/app/diagnosis',
      steps: `I specialize in agricultural guidance, urban gardening, plant health diagnosis, watering schedules, and the UrbanFarm platform features. 
I am not able to assist with topics outside agriculture, gardening, and plant care.
How can I help you with your garden or plants today?`,
      quickActionLabel: 'Explore UrbanFarm',
      followUps: [
        'How to diagnose a sick plant?',
        'How to start a balcony garden?',
        'What vegetables grow fast?'
      ]
    },
    gu: {
      title: 'અર્બનફાર્મ માર્ગદર્શન',
      route: '/app/diagnosis',
      steps: `હું ફક્ત ખેતી, બાગકામ, છોડના રોગ નિદાન, સિંચાઈ અને અર્બનફાર્મ પ્લેટફોર્મના વિષયોમાં માર્ગદર્શન આપું છું. બાગકામ સિવાયના અન્ય વિષયો મારા કાર્યક્ષેત્ર બહાર છે.
તમારા બગીચા કે છોડ સંબંધિત હું તમને કેવી રીતે મદદ કરી શકું?`,
      quickActionLabel: 'પ્લેટફોર્મ સેવાઓ જુઓ',
      followUps: [
        'છોડનું નિદાન કેવી રીતે કરવું?',
        'બાલ્કની ગાર્ડન કેવી રીતે શરૂ કરવું?',
        'ઝડપથી ઉગતા શાકભાજી કયા?'
      ]
    },
    hi: {
      title: 'अर्बनफार्म मार्गदर्शन',
      route: '/app/diagnosis',
      steps: `मैं विशेष रूप से खेती, बागवानी, पौधों के रोग निदान, सिंचाई और अर्बनफार्म मंच की सुविधाओं के संबंध में सहायता कर सकती हूँ। बागवानी से इतर विषयों में मैं असमर्थ हूँ।
आज आपके बगीचे या पौधों के संबंध में मैं आपकी क्या सहायता कर सकती हूँ?`,
      quickActionLabel: 'प्लेटफॉर्म सेवाएं देखें',
      followUps: [
        'बीमार पौधे का निदान कैसे करें?',
        'बालकनी में बगीचा कैसे शुरू करें?',
        'तेजी से उगने वाली सब्जियां कौन सी हैं?'
      ]
    }
  }
};

module.exports = {
  VALID_PLATFORM_ROUTES,
  PLATFORM_ROUTES,
  KNOWLEDGE_BASE,
};
