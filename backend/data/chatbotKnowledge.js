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
  greeting: {
    en: {
      title: 'Krishi AI Welcome',
      route: '/app/gardens',
      steps: `Hello! How can I assist you with your balcony or terrace garden, plant care, smart watering, or farming equipment today? 🌿`,
      quickActionLabel: 'Explore UrbanFarm',
      followUps: [
        'How do I diagnose plant diseases?',
        'How does smart watering work?',
        'What crops grow best this season?'
      ]
    },
    gu: {
      title: 'કૃષિ AI સ્વાગત',
      route: '/app/gardens',
      steps: `નમસ્તે! આજે હું તમારા બાલ્કની કે ટેરેસ બગીચા, છોડની કાળજી, સ્માર્ટ સિંચાઈ અથવા ખેતીના સાધનોમાં કઈ રીતે મદદ કરી શકું? 🌿`,
      quickActionLabel: 'અર્બનફાર્મ જુઓ',
      followUps: [
        'છોડનું રોગ નિદાન કેવી રીતે કરવું?',
        'સ્માર્ટ સિંચાઈ કેવી રીતે કામ કરે છે?',
        'આ ઋતુમાં કયા પાક ઉગાડવા?'
      ]
    },
    hi: {
      title: 'कृषि AI स्वागत',
      route: '/app/gardens',
      steps: `नमस्ते! आज मैं आपकी बालकनी या छत के बगीचे, पौधों की देखभाल, स्मार्ट सिंचाई या कृषि उपकरणों में क्या सहायता कर सकती हूँ? 🌿`,
      quickActionLabel: 'अर्बनफार्म देखें',
      followUps: [
        'पौधे का रोग निदान कैसे करें?',
        'स्मार्ट सिंचाई कैसे काम करती है?',
        'इस मौसम में कौन सी फसलें उगाएं?'
      ]
    }
  },

  diagnosis: {
    en: {
      title: 'AI Plant Disease Diagnosis',
      route: '/app/diagnosis',
      steps: `To diagnose your plant's health and get organic remedies:
• Take a clear, well-lit photo of the affected leaf, stem, or fruit.
• Upload the photo to **AI Disease Diagnosis** (/app/diagnosis).
• Receive an instant identification of the issue along with verified organic treatment steps.

Click below to start diagnosing your plant!`,
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
      steps: `તમારા છોડના સચોટ રોગ નિદાન અને દેશી/ઓર્ગેનિક ઉપચાર માટે:
• અસરગ્રસ્ત પાંદડા, ડાળી કે ફળનો સ્પષ્ટ ફોટો લો.
• **AI રોગ નિદાન** (/app/diagnosis) વિભાગમાં ફોટો અપલોડ કરો.
• હું તરત જ રોગની ઓળખ કરીને અસરકારક દેશી ઉપાયો અને કાળજીના પગલાં સૂચવીશ.

રોગ નિદાન શરૂ કરવા નીચે આપેલા બટન પર ક્લિક કરો!`,
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
      steps: `पौधे के सटीक रोग निदान और जैविक उपचार के लिए:
• प्रभावित पत्ते, तने या फल की साफ फोटो लें।
• **AI रोग निदान** (/app/diagnosis) सेक्शन में फोटो अपलोड करें।
• बीमारी का नाम, पहचान और तुरंत प्रभावी जैविक उपचार प्राप्त करें।

रोग निदान शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें!`,
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
      steps: `Smart Weather-Based Watering (/app/watering) keeps your garden healthy by optimizing irrigation:
• Analyzes real-time local weather (temperature, humidity, rain forecast) and plant moisture requirements.
• Generates a customized 7-day watering calendar with timely reminders.
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
      steps: `સ્માર્ટ વેધર વોટરિંગ (/app/watering) દ્વારા છોડને હવામાન અનુસાર યોગ્ય માત્રામાં પાણી આપવાનું આયોજન:
• સ્થાનિક હવામાન (તાપમાન, ભેજ, વરસાદની આગાહી) સાથે છોડની ભેજ જરૂરિયાત મેળવાય છે.
• ૭ દિવસનું સચોટ વોટરિંગ કેલેન્ડર અને જરૂરી રિમાઇન્ડર મળે છે.
💡 **ખાસ ટિપ**: સવારે ૬ થી ૮ વાગ્યા વચ્ચે પાણી આપવું છોડના મૂળિયા માટે સૌથી ઉત્તમ છે!`,
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
      steps: `स्मार्ट मौसम आधारित सिंचाई (/app/watering) पौधों को सही समय और सही मात्रा में पानी देने की सुविधा प्रदान करती है:
• स्थानीय मौसम (तापमान, आर्द्रता, वर्षा पूर्वानुमान) और पौधों की जरूरतों का विश्लेषण करता है।
• अगले ७ दिनों का अनुकूलित सिंचाई शेड्यूल और रिमाइंडर प्रदान करता है।
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
      steps: `To manage and track your balcony or terrace garden spaces:
• Go to **My Gardens & Plant Tracker** (/app/gardens).
• Add your garden space (Balcony, Terrace, Windowsill, or Backyard).
• Add plants, log growth stages, and track soil and care logs all in one place!`,
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
      steps: `તમારા બાલ્કની કે ટેરેસ બગીચા અને છોડનું વ્યવસ્થાપન કરવા માટે:
• **મારા બગીચાઓ અને પ્લાન્ટ ટ્રેકર** (/app/gardens) પર જાઓ.
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
      steps: `अपनी बालकनी या छत के बगीचे और पौधों का प्रबंधन करने के लिए:
• **मेरे बगीचे और प्लांट ट्रैकर** (/app/gardens) पर जाएं।
• अपना नया बगीचा जोड़ें (बालकनी, छत, खिड़की या आँगन)।
• अपने पौधे जोड़ें और उनकी वृद्धि, स्वास्थ्य और पानी का रिकॉर्ड रखें।`,
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
      steps: `For high-yield crop recommendations tailored to your conditions:
• Open **Crop Recommendation** (/app/crops).
• Enter your space type (balcony/terrace), sunlight hours, soil type, and current season.
• Get tailored recommendations for vegetables, herbs, and fruits with high success rates.`,
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
      steps: `તમારી જગ્યા અને ઋતુ અનુસાર શ્રેષ્ઠ પાકની પસંદગી માટે:
• **AI પાક ભલામણ** (/app/crops) પર જાઓ.
• તમારી ઉપલબ્ધ જગ્યા, સૂર્યપ્રકાશ અને માટીનો પ્રકાર પસંદ કરો.
• વધુ ઉત્પાદન આપતા શાકભાજી, ફળો કે ઔષધીય છોડની વિગતવાર ભલામણ મેળવો.`,
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
      steps: `अपनी जगह और मौसम के अनुसार सर्वोत्तम फसलों के सुझाव के लिए:
• **AI फसल सुझाव** (/app/crops) सेक्शन में जाएं।
• अपनी उपलब्ध जगह (बालकनी/छत), धूप के घंटे और मिट्टी का प्रकार चुनें।
• सबसे ज्यादा उपज देने वाली सब्जियों और पौधों की सटीक सिफारिश प्राप्त करें।`,
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
⚠️ Always test homemade sprays on a single leaf first before full application. Always wear a mask and gloves when spraying.`,
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
⚠️ લીમડાનું તેલ કે અન્ય સ્પ્રે છાંટતી વખતે હાથમોજાં અને માસ્ક જરૂર પહેરવા તથા સાંજના સમયે છંટકાવ કરવો.`,
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
⚠️ नीम तेल या किसी भी घोल के छिड़काव के दौरान मास्क और दस्ताने अवश्य पहनें और हमेशा शाम के समय ही छिड़काव करें।`,
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
      steps: `IMPORTANT SAFETY & PROTECTION GUIDELINES:
1. **Protective Gear**: Always wear protective gloves, eye protection, and a face mask when spraying any garden mixture (including organic neem oil).
2. **Prioritize Organic Solutions**: Always start with natural remedies (Neem, Bio-fungicides, physical barriers) before considering chemicals.
3. **Never Mix Unknown Chemicals**: Do NOT combine different commercial pesticides or fertilizers.
4. **Safe Storage**: Store all garden inputs in their original labeled containers, locked away from children and pets.
5. **Harvest Waiting Period**: Respect the "Pre-Harvest Interval" (PHI) — wait required days between treatment and eating homegrown crops.`,
      quickActionLabel: 'Contact Support',
      followUps: [
        'What is the safest organic pesticide?',
        'How many days after neem spray can I eat vegetables?',
        'How to dispose of garden chemical leftovers?'
      ]
    },
    gu: {
      title: 'કૃષિ સુરક્ષા અને સાવચેતી નિયમો',
      route: '/contact',
      steps: `મહત્વપૂર્ણ સુરક્ષા અને રક્ષણાત્મક માર્ગદર્શિકા:
૧. **રક્ષણાત્મક સાધનો**: લીમડાનું તેલ કે કોઈપણ દવા છાંટતી વખતે મોં પર માસ્ક અને હાથમાં મોજાં (ગ્લોવ્સ) અવશ્ય પહેરો.
૨. **પ્રથમ ઓર્ગેનિક પસંદ કરો**: રાસાયણિક દવાઓ કરતાં લીમડાનું અર્ક, ટ્રાઇકોડર્મા અને દેશી ઉપાયો પ્રથમ અજમાવો.
૩. **દવાઓનું મિશ્રણ ન કરો**: જુદી જુદી રાસાયણિક દવાઓ ક્યારેય ભેગી ન કરવી.
૪. **બાળકો-પાલતુ પ્રાણીઓથી દૂર**: દવાઓ અને સ્પ્રે હંમેશાં ઊંચાઈ પર અને બંધ જગ્યાએ રાખો.
૫. **ફળ-શાકભાજી ધોઈને વાપરો**: દવા છાંટ્યા પછીના જરૂરી દિવસો સુધી શાકભાજી ન તોડવા.`,
      quickActionLabel: 'સુરક્ષા સહાય મેળવો',
      followUps: [
        'સૌથી સુરક્ષિત ઓર્ગેનિક સ્પ્રે કયો?',
        'દવા છાંટ્યા પછી શાકભાજી ક્યારે ખાઈ શકાય?',
        'ખાતર બનાવતી વખતે શું કાળજી રાખવી?'
      ]
    },
    hi: {
      title: 'कृषि सुरक्षा और सावधानियां',
      route: '/contact',
      steps: `महत्वपूर्ण सुरक्षा और बचाव निर्देश:
१. **सुरक्षा उपकरण**: नीम का तेल या किसी भी घोल का छिड़काव करते समय मास्क और दस्ताने (Gloves) अनिवार्य रूप से पहनें।
२. **जैविक उपायों को प्राथमिकता दें**: रासायनिक दवाओं से पहले नीम तेल, जैविक फफूंदनाशक और घरेलू नुस्खे अपनाएं।
३. **रसायनों का अनियंत्रित मिश्रण न करें**: बिना लेबल निर्देश के कभी भी दो रसायनों को आपस में न मिलाएं।
४. **बच्चों और पालतू जानवरों से दूर रखें**: सभी कीटनाशकों को मूल डिब्बे में सुरक्षित ताले में रखें।
५. **तुड़ाई का समय (PHI)**: दवा छिड़कने के बाद निर्धारित दिनों तक सब्जियों की तुड़ाई न करें और खाने से पहले अच्छी तरह धोएं।`,
      quickActionLabel: 'कृषि सुरक्षा संपर्क',
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
      steps: `Krishi AI provides step-by-step assistance with:
• AI Plant Disease Diagnosis from photos (/app/diagnosis)
• Smart weather-based watering schedules (/app/watering)
• Managing urban gardens & container plants (/app/gardens)
• Tailored crop suggestions for balconies & terraces (/app/crops)
• Connecting with urban farmers on the Community Hub (/app/community)
• Organic pest control & homemade bio-fertilizer recipes`,
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
      steps: `કૃષિ AI નીચેની બાબતોમાં પગલાંવાર સહાય કરે છે:
• ફોટો દ્વારા છોડના રોગનું નિદાન કરવું (/app/diagnosis)
• હવામાન આધારિત સ્માર્ટ પાણી આપવાનું સમયપત્રક (/app/watering)
• બાલ્કની અને ટેરેસ બગીચાનું આયોજન (/app/gardens)
• ઋતુ મુજબ યોગ્ય પાકની પસંદગી (/app/crops)
• અર્બનફાર્મ કમ્યુનિટીમાં ચર્ચા (/app/community)
• ઓર્ગેનિક જીવાત નિયંત્રણ અને દેશી ખાતરો`,
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
      steps: `कृषि AI निम्नलिखित कार्यों में आपकी सहायता करती है:
• पत्तों की फोटो से पौधे के रोग का निदान (/app/diagnosis)
• मौसम आधारित स्मार्ट सिंचाई शेड्यूल (/app/watering)
• छत व बालकनी के लिए बगीचे का प्रबंधन (/app/gardens)
• मौसम के अनुसार बेहतरीन फसलों के सुझाव (/app/crops)
• किसान कम्युनिटी में चर्चा और अनुभव साझा करना (/app/community)
• जैविक कीट नियंत्रण और घरेलू खाद बनाने के उपाय`,
      quickActionLabel: 'रोग निदान खोलें',
      followUps: [
        'पौधे का रोग निदान कैसे करें?',
        'पौधों को पानी कब और कितना दें?',
        'इस मौसम में कौन सी सब्जियां उगाएं?'
      ]
    }
  },

  equipment: {
    en: {
      title: 'Farming & Gardening Equipments',
      route: '/app/gardens',
      steps: `Essential Agricultural & Gardening Equipments:
1. Soil Preparation & Tillage:
   • Farm Scale: Tractors, power tillers, rotavators, cultivators, disc ploughs.
   • Urban/Garden Scale: Hand trowels, spades, garden forks, khurpi, and hoes for aeration.
2. Sowing & Planting Tools:
   • Seed drill machines, nursery seedling trays (50/104-cavity), dibbers, and transplanting trowels.
3. Irrigation & Watering Equipments:
   • Drip irrigation kits with pressure-compensating emitters, drip lines, micro-sprinklers, water pumps, spray nozzles, and watering cans with rose heads.
4. Crop Protection & Spraying:
   • Battery-operated knapsack sprayers, manual compression sprayers, and ultra-low-volume mist blowers for organic neem oil sprays.
5. Pruning & Harvesting Tools:
   • Bypass pruning shears/secateurs, loppers, hedge shears, grafting knives, and fruit pickers.
6. Soil & Environmental Testing:
   • 3-in-1 soil pH, moisture, and sunlight meters; TDS/EC meters for hydroponics.
7. Protected Cultivation:
   • UV-stabilized shade nets (50% or 75% green), HDPE grow bags (350+ GSM), polyhouse hoops, and plant support trellises.`,
      quickActionLabel: 'Garden & Equipment Tools',
      followUps: [
        'What drip irrigation equipment is best for a terrace?',
        'How do I maintain and clean pruning shears?',
        'Which sprayer is recommended for organic neem oil?'
      ]
    },
    gu: {
      title: 'ખેતી અને બાગકામના સાધનો તથા ઓજારો',
      route: '/app/gardens',
      steps: `ખેતી અને બાગકામ માટે જરૂરી મુખ્ય સાધનો અને ઓજારો:
૧. જમીન તૈયાર કરવાના ઓજારો:
   • ખેતર માટે: ટ્રેક્ટર, રોટાવેટર, કલ્ટીવેટર, હળ (પ્લાઉ).
   • બગીચા/ધાબા માટે: પાવડો, કોદાળી, ત્રિકમ, ખુરપી, પંજેટી (Garden Rake).
૨. વાવણી અને રોપણીના સાધનો:
   • સીડ ડ્રીલ (ઓરણી), પ્રો-ટ્રે (નર્સરી સીડલિંગ ટ્રે - 50/104 ખાનાવાળી), ટ્રાન્સપ્લાન્ટિંગ ટ્રોવેલ.
૩. સિંચાઈ અને પાણી આપવાના સાધનો:
   • ટપક સિંચાઈ પદ્ધતિ (Drip Irrigation Kit), ફુવારા (Micro Sprinklers), સબમર્સિબલ પંપ, વોટરિંગ કેન (ઝારી).
૪. દવા છંટકાવ અને સુરક્ષા:
   • બેટરી સંચાલિત નેપસેક સ્પ્રેયર (Knapsack Sprayer), હેન્ડ પંપ સ્પ્રેયર (ઓર્ગેનિક લીમડાના અર્ક માટે).
૫. કટીંગ અને લણણીના ઓજારો:
   • પ્રૂનિંગ સિકેટર્સ (ડાળી કાપવાની કાતર), ગ્રાફ્ટિંગ છરી, ફ્રૂટ પીકર.
૬. ટેસ્ટિંગ અને ગાર્ડનિંગ સાધનો:
   • જમીનનો pH અને ભેજ માપવા માટેનું મીટર (Soil Moisture & pH Meter), HDPE ગ્રો બેગ્સ અને શેડ નેટ.`,
      quickActionLabel: 'ઓજારો અને સાધનો જુઓ',
      followUps: [
        'ધાબા માટે ટપક સિંચાઈ સાધન કેવી રીતે ગોઠવવું?',
        'ઓર્ગેનિક દવા છાંટવા માટે કયો સ્પ્રેયર સારો?',
        'પ્રૂનિંગ કાતરની જાળવણી કેવી રીતે કરવી?'
      ]
    },
    hi: {
      title: 'कृषि और बागवानी के उपकरण व औजार',
      route: '/app/gardens',
      steps: `खेती और बागवानी के लिए प्रमुख उपकरण और औजार:
१. जुताई और मिट्टी तैयार करने के यंत्र:
   • खेत के लिए: ट्रैक्टर, रोटावेटर, कल्टीवेटर, डिस्क हल।
   • बागवानी के लिए: खुरपी, फावड़ा, कुदाल, गार्डनिंग कांटे (Hand Fork)।
२. बुवाई और पौध रोपाई के उपकरण:
   • सीड ड्रिल (बुवाई यंत्र), सीडलिंग ट्रे (50/104 कैविटी), डिबलर और ट्रांसप्लांटिंग ट्रोवेल।
३. सिंचाई और जल प्रबंधन उपकरण:
   • ड्रिप इरिगेशन किट (टपक सिंचाई पाइप और ड्रिपर्स), मिनी स्प्रिंकलर (फव्वारा), वाटर पंप, वाटरिंग केन (हजारी)।
४. छिड़काव और पौध सुरक्षा उपकरण:
   • बैटरी नेप्सैक स्प्रेयर, हैंड कंप्रेशन स्प्रेयर (नीम तेल और जैविक घोल छिड़कने के लिए)।
५. कटाई-छंटाई और हार्वेस्टिंग औजार:
   • प्रूनिंग सिकेटर (छंटाई कैंची), हेज शीयर, ग्राफ्टिंग चाकू, फल तोड़ने का यंत्र।
६. मिट्टी और वातावरण परीक्षण यंत्र:
   • सॉइल मॉइस्चर और pH मीटर, ग्रो बैग्स (HDPE 350+ GSM) और 50% ग्रीन शेड नेट।`,
      quickActionLabel: 'उपकरण और औजार देखें',
      followUps: [
        'छत के लिए ड्रिप सिंचाई उपकरण कैसे लगाएं?',
        'जैविक नीम स्प्रे के लिए कौन सा स्प्रेयर सही है?',
        'प्रूनिंग कैंची की सफाई और धार कैसे लगाएं?'
      ]
    }
  },

  unknown: {
    en: {
      title: 'Agricultural & Equipment Scope',
      route: '/app/gardens',
      steps: `Krishi AI is dedicated exclusively to farming, plant care, and agricultural tools. 🚜🌱

I can assist you with:
• Crop and plant care, disease diagnosis, and botanical remedies
• Farming and gardening machinery & tools (tractors, tillers, sprayers, drip kits, pruning shears)
• Soil health, organic fertilizers, and pest management
• Smart irrigation and garden planning

Please ask any question related to your crops, garden, or farming equipment!`,
      quickActionLabel: 'Explore Farming Tools',
      followUps: [
        'What equipment is needed for gardening?',
        'How to diagnose a sick plant?',
        'How to start a terrace garden?'
      ]
    },
    gu: {
      title: 'કૃષિ અને સાધન સહાયક',
      route: '/app/gardens',
      steps: `કૃષિ AI ફક્ત ખેતી, છોડ સંભાળ અને બાગકામના સાધનો માટે સમર્પિત છે. 🚜🌱

હું નીચેના વિષયોમાં માર્ગદર્શન આપી શકું છું:
• પાક અને છોડની સંભાળ, રોગ નિદાન અને ઉપચાર
• ખેતી અને બાગકામના ઓજારો તથા સાધનો (ટ્રેક્ટર, ટિલર, સ્પ્રેયર, ટપક સિંચાઈ, કટીંગ ટૂલ્સ)
• જમીનનું સ્વાસ્થ્ય, ઓર્ગેનિક ખાતરો અને કુદરતી જીવાત નિયંત્રણ
• સ્માર્ટ સિંચાઈ અને બગીચાનું આયોજન

કૃપા કરીને તમારા પાક, છોડ કે ખેતીના સાધનો સંબંધિત કોઈપણ પ્રશ્ન પૂછો!`,
      quickActionLabel: 'સાધનો અને ઓજારો જુઓ',
      followUps: [
        'બાગકામ માટે કયા સાધનો જરૂરી છે?',
        'બીમાર છોડનું નિદાન કેવી રીતે કરવું?',
        'ધાબા પર બગીચો કેવી રીતે શરૂ કરવો?'
      ]
    },
    hi: {
      title: 'कृषि एवं उपकरण विशेषज्ञ',
      route: '/app/gardens',
      steps: `कृषि AI विशेष रूप से खेती, पौधों की देखभाल और कृषि उपकरणों के लिए समर्पित है। 🚜🌱

मैं निम्नलिखित विषयों पर मार्गदर्शन प्रदान कर सकती हूँ:
• फसलों और पौधों की देखभाल, रोग निदान व उपचार
• कृषि एवं बागवानी के उपकरण व औजार (ट्रैक्टर, टिलर, स्प्रेयर, ड्रिप सिंचाई किट, छंटाई औजार)
• मिट्टी का स्वास्थ्य, जैविक खाद और प्राकृतिक कीट नियंत्रण
• स्मार्ट सिंचाई और बगीचे का प्रबंधन

कृपया अपनी फसलों, पौधों या कृषि उपकरणों के संबंध में कोई भी प्रश्न पूछें!`,
      quickActionLabel: 'उपकरण और औजार देखें',
      followUps: [
        'बागवानी के लिए कौन से उपकरण आवश्यक हैं?',
        'बीमार पौधे का निदान कैसे करें?',
        'छत या बालकनी में बगीचा कैसे शुरू करें?'
      ]
    }
  }
};

KNOWLEDGE_BASE.out_of_scope = KNOWLEDGE_BASE.unknown;

module.exports = {
  VALID_PLATFORM_ROUTES,
  PLATFORM_ROUTES,
  KNOWLEDGE_BASE,
};
