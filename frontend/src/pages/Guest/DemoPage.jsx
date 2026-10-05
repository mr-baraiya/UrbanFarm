import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaRobot,
  FaMicroscope,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaLeaf,
  FaSeedling,
  FaMagic,
  FaLightbulb,
  FaArrowRight,
  FaRedo,
  FaUser,
  FaComments,
  FaInfoCircle,
  FaCheck,
  FaShareAlt,
  FaSearch,
  FaTint,
  FaSun,
  FaThermometerHalf,
  FaFlask,
  FaSlidersH,
  FaGlobe
} from 'react-icons/fa';
import { RiSparklingLine } from 'react-icons/ri';
import SEO from '../../components/SEO/SEO';
import LanguageSelector from '../../components/Common/LanguageSelector';
import './DemoPage.css';

// Multilingual Static Diagnosis Reports Data (EN, HI, GU)
const SAMPLE_REPORTS_MULTILINGUAL = [
  {
    id: 'report-1',
    status: 'warning',
    confidence: 97.4,
    image: '/demo/tomato_blight.jpg',
    detectionTime: '1.2s',
    cropName: {
      en: 'Tomato (Solanum lycopersicum)',
      hi: 'टमाटर (सोलेनम लाइकोपर्सिकम)',
      gu: 'ટામેટા (સોલેનમ લાયકોપર્સિકમ)'
    },
    variety: {
      en: 'Roma / Cherry Hybrid',
      hi: 'रोमा / चेरी हाइब्रिड',
      gu: 'રોમા / ચેરી હાઇબ્રિડ'
    },
    condition: {
      en: 'Early Blight (Alternaria solani)',
      hi: 'अगेती झुलसा (अल्ट्रानेरिया सोलेनाई)',
      gu: 'અગેતી સુકારો (અલ્ટરનેરિયા સોલેનાઇ)'
    },
    statusText: {
      en: 'Disease Detected (Moderate Risk)',
      hi: 'रोग की पहचान (मध्यम जोखिम)',
      gu: 'રોગ શોધાયો (મધ્યમ જોખમ)'
    },
    organ: {
      en: 'Lower Foliage & Leaves',
      hi: 'निचली पत्तियां और पर्णसमूह',
      gu: 'નીચલા પાંદડા અને પર્ણસમૂહ'
    },
    severity: {
      en: 'Tier 2 (Action Required)',
      hi: 'स्तर 2 (कार्रवाई आवश्यक)',
      gu: 'સ્તર 2 (પગલાં જરૂરી)'
    },
    symptoms: {
      en: [
        'Concentric dark brown rings with "target spot" pattern on lower leaves',
        'Yellow chlorotic halos surrounding early leaf lesions',
        'Stem dark spots appearing near ground level nodes',
        'Premature leaf drop starting from lower plant canopy'
      ],
      hi: [
        'निचली पत्तियों पर "टारगेट स्पॉट" पैटर्न के साथ संकेंद्री गहरे भूरे रंग के छल्ले',
        'प्रारंभिक पत्ती के घावों के आसपास पीले हेलो (पीलापन)',
        'जमीन के स्तर के नोड्स के पास तने के काले धब्बे',
        'पौधे की निचली छतरी से समय से पहले पत्तियां गिरना'
      ],
      gu: [
        'નીચલા પાંદડા પર "ટાર્ગેટ સ્પોટ" પેટર્ન સાથે ઘેરા બદામી રંગના વલયો',
        'શરૂઆતના પાંદડાના ઘાની આસપાસ પીળા રંગના કુંડાળા',
        'જમીન સ્તરના નોડ્સ પાસે થડ પર કાળા ધબ્બા',
        'છોડના નીચલા ભાગમાંથી સમય પહેલા પાંદડા ખરવા'
      ]
    },
    organicTreatments: {
      en: [
        'Prune all infected leaves showing lesions and dispose away from compost.',
        'Apply organic Copper Octanoate fungicide every 7 days until clear.',
        'Spray cold-pressed Neem Oil solution (2 tbsp/gallon) at dusk.',
        'Mulch soil surface with straw to prevent soil-splash fungal spores.'
      ],
      hi: [
        'घाव दिखाने वाली सभी संक्रमित पत्तियों को काटें और खाद से दूर फेंकें।',
        'साफ होने तक हर 7 दिन में जैविक कॉपर ऑक्टानोएट कवकनाशी लगाएं।',
        'शाम के समय नीम के तेल (2 चम्मच/गैलन) का छिड़काव करें।',
        'मिट्टी के बीजाणुओं को रोकने के लिए पुआल से मल्चिंग करें।'
      ],
      gu: [
        'ઘા દર્શાવતા તમામ ચેપગ્રસ્ત પાંદડા કાપી લો અને કમ્પોસ્ટથી દૂર ફેંકી દો.',
        'સાફ ન થાય ત્યાં સુધી દર 7 દિવસે જૈવિક કોપર ઓક્ટેનોએટ ફૂગનાશક લગાવો.',
        'સાંજે લીમડાના તેલના દ્રાવણ (2 ચમચી/ગેલન) નો છંટકાવ કરો.',
        'જમીનમાંથી ઉડતા ફૂગના બીજાણુઓને રોકવા માટે ઘાસનું મલ્ચિંગ કરો.'
      ]
    },
    chemicalTreatments: {
      en: [
        'Apply Chlorothalonil or Mancozeb protective foliar spray as per package dosage.',
        'Rotate with Azoxystrobin to prevent pathogen chemical resistance.'
      ],
      hi: [
        'पैकेज की खुराक के अनुसार क्लोरोथालोनिल या मैंकोजेब सुरक्षात्मक छिड़काव लागू करें।',
        'रोगज़नक़ रासायनिक प्रतिरोध को रोकने के लिए एज़ोक्सीस्ट्रोबिन के साथ चक्रण करें।'
      ],
      gu: [
        'પેકેજ ડોઝ મુજબ ક્લોરોથાલોનિલ અથવા મેન્કોઝેબ રક્ષણાત્મક છંટકાવ કરો.',
        'પેથોજેન રસાયણ પ્રતિકાર રોકવા માટે એઝોક્સીસ્ટ્રોબિન સાથે ફેરબદલ કરો.'
      ]
    },
    prevention: {
      en: [
        'Switch to drip or soak watering at base; avoid wetting leaf foliage.',
        'Ensure 18-24 inch spacing between tomato plants for optimal airflow.',
        'Maintain soil pH between 6.0 and 6.8 with well-draining organic compost.'
      ],
      hi: [
        'आधार पर ड्रिप सिंचाई अपनाएं; पत्तियों को गीला करने से बचें।',
        'सर्वोत्तम वायु प्रवाह के लिए टमाटर के पौधों के बीच 18-24 इंच की दूरी रखें।',
        'जैविक खाद के साथ मिट्टी का पीएच 6.0 और 6.8 के बीच बनाए रखें।'
      ],
      gu: [
        'મૂળ પાસે ટપક સિંચાઈ કરો; પાંદડા ભીના કરવાનું ટાળો.',
        'હવાની અવરજવર માટે ટામેટાના છોડ વચ્ચે 18-24 ઇંચનું અંતર રાખો.',
        'જૈવિક ખાતર સાથે જમીનનું pH 6.0 થી 6.8 વચ્ચે જાળવો.'
      ]
    },
    stats: {
      en: [
        { label: 'Primary Pathogen', value: 'Alternaria solani' },
        { label: 'Risk Factor', value: 'High Humidity' },
        { label: 'Recovery Forecast', value: '92% with Treatment' }
      ],
      hi: [
        { label: 'मुख्य रोगजनक', value: 'अल्ट्रानेरिया सोलेनाई' },
        { label: 'जोखिम कारक', value: 'उच्च आर्द्रता' },
        { label: 'पुनर्प्राप्ति पूर्वानुमान', value: 'उपचार के साथ 92%' }
      ],
      gu: [
        { label: 'મુખ્ય રોગકારક', value: 'અલ્ટરનેરિયા સોલેનાઇ' },
        { label: 'જોખમ પરિબળ', value: 'ઉચ્ચ ભેજ' },
        { label: 'રિકવરી પૂર્વાનુમાન', value: 'સારવાર સાથે 92%' }
      ]
    }
  },
  {
    id: 'report-2',
    status: 'healthy',
    confidence: 99.1,
    image: '/demo/pepper_healthy.jpg',
    detectionTime: '0.9s',
    cropName: {
      en: 'Sweet Bell Pepper (Capsicum annuum)',
      hi: 'शिमला मिर्च (कैप्सिकम एनुअम)',
      gu: 'સિમલા મરચાં (કેપ્સિકમ એન્યુમ)'
    },
    variety: {
      en: 'California Wonder',
      hi: 'कैलिफ़ोर्निया वंडर',
      gu: 'કેલિફોર્નિયા વન્ડર'
    },
    condition: {
      en: 'Healthy Plant (No Disease Detected)',
      hi: 'स्वस्थ पौधा (कोई बीमारी नहीं पाई गई)',
      gu: 'તંદુરસ્ત છોડ (કોઈ રોગ મળ્યો નથી)'
    },
    statusText: {
      en: 'Optimal Crop Health',
      hi: 'उत्कृष्ट फसल स्वास्थ्य',
      gu: 'ઉત્કૃષ્ટ પાક સ્વાસ્થ્ય'
    },
    organ: {
      en: 'Full Canopy & Stems',
      hi: 'पूर्ण छतरी और तने',
      gu: 'સંપૂર્ણ પર્ણસમૂહ અને થડ'
    },
    severity: {
      en: 'None (Healthy)',
      hi: 'कोई नहीं (स्वस्थ)',
      gu: 'કોઈ નહીં (તંદુરસ્ત)'
    },
    symptoms: {
      en: [
        'Vibrant deep green foliage with sturdy cell structure',
        'Clean leaf venation free from chlorosis or fungal spots',
        'Active flower bud development with healthy node elongation',
        'Root zone showing clean white feeding roots'
      ],
      hi: [
        'मजबूत कोशिका संरचना के साथ जीवंत गहरा हरा पर्णसमूह',
        'पीलेपन या फंगल धब्बों से मुक्त साफ पत्ती नसें',
        'स्वस्थ नोड बढ़ाव के साथ सक्रिय फूल कली विकास',
        'रूट ज़ोन साफ सफेद पोषण जड़ें दिखा रहा है'
      ],
      gu: [
        'મજબૂત કોષ રચના સાથે ઘેરા લીલા પાંદડા',
        'પીળાશ અથવા ફૂગના ધબ્બા વગરની સ્વચ્છ નસો',
        'સ્વસ્થ વૃદ્ધિ સાથે સક્રિય ફૂલ કળીઓનો વિકાસ',
        'મૂળ વિસ્તારમાં સ્વચ્છ સફેદ મૂળિયા'
      ]
    },
    organicTreatments: {
      en: [
        'No chemical treatment required.',
        'Apply balanced 5-10-10 organic liquid fertilizer bi-weekly during flowering.'
      ],
      hi: [
        'किसी रासायनिक उपचार की आवश्यकता नहीं है।',
        'फूल आने के दौरान पाक्षिक रूप से संतुलित 5-10-10 जैविक तरल उर्वरक लगाएं।'
      ],
      gu: [
        'કોઈ રાસાયણિક સારવારની જરૂર નથી.',
        'ફૂલો આવે ત્યારે દર બે અઠવાડિયે 5-10-10 જૈવિક પ્રવાહી ખાતર આપો.'
      ]
    },
    chemicalTreatments: {
      en: [
        'None required. Keep monitoring bi-weekly with Krishi AI scans.'
      ],
      hi: [
        'कोई आवश्यकता नहीं है। कृषि एआई स्कैन के साथ पाक्षिक निगरानी जारी रखें।'
      ],
      gu: [
        'કોઈ જરૂર નથી. કૃષિ AI સ્કેન સાથે નિયમિત નિરીક્ષણ ચાલુ રાખો.'
      ]
    },
    prevention: {
      en: [
        'Keep ambient soil moisture between 55% and 65%.',
        'Provide at least 6-8 hours of direct full sun daily.',
        'Inspect underside of leaves weekly for early aphid hitchhikers.'
      ],
      hi: [
        'मिट्टी की नमी 55% और 65% के बीच रखें।',
        'प्रतिदिन कम से कम 6-8 घंटे की सीधी धूप प्रदान करें।',
        'माहू कीटों के लिए साप्ताहिक रूप से पत्तियों के निचले हिस्से का निरीक्षण करें।'
      ],
      gu: [
        'જમીનમાં ભેજનું પ્રમાણ 55% થી 65% વચ્ચે રાખો.',
        'દરરોજ ઓછામાં ઓછું 6-8 કલાક સીધો સૂર્યપ્રકાશ આપો.',
        'જીવાતો માટે અઠવાડિયામાં એકવાર પાંદડાની નીચેની બાજુ તપાસો.'
      ]
    },
    stats: {
      en: [
        { label: 'Vigor Index', value: '98 / 100' },
        { label: 'Nutrient Status', value: 'Balanced (N-P-K)' },
        { label: 'Hydration Level', value: 'Optimal (62%)' }
      ],
      hi: [
        { label: 'विकास सूचकांक', value: '98 / 100' },
        { label: 'पोषण स्थिति', value: 'संतुलित (N-P-K)' },
        { label: 'नमी स्तर', value: 'उत्कृष्ट (62%)' }
      ],
      gu: [
        { label: 'વૃદ્ધિ સૂચકાંક', value: '98 / 100' },
        { label: 'પોષણ સ્થિતિ', value: 'સંતુલિત (N-P-K)' },
        { label: 'ભેજનું સ્તર', value: 'ઉત્કૃષ્ટ (62%)' }
      ]
    }
  },
  {
    id: 'report-3',
    status: 'warning',
    confidence: 94.8,
    image: '/demo/corn_rust.jpg',
    detectionTime: '1.4s',
    cropName: {
      en: 'Maize / Sweet Corn (Zea mays)',
      hi: 'मक्का / स्वीट कॉर्न (जिया मेज़)',
      gu: 'મકાઈ / સ્વીટ કોર્ન (ઝીયા મેઝ)'
    },
    variety: {
      en: 'Golden Bantam',
      hi: 'गोल्डन बैंटम',
      gu: 'ગોલ્ડન બેન્ટમ'
    },
    condition: {
      en: 'Common Rust (Puccinia sorghi)',
      hi: 'सामान्य गेरुई / रस्ट (पुसिनिया सोरघी)',
      gu: 'સામાન્ય ગેરુ / રસ્ટ (પુસિિનિયા સોરગી)'
    },
    statusText: {
      en: 'Early Stage Infection',
      hi: 'प्रारंभिक चरण का संक्रमण',
      gu: 'શરૂઆતી તબક્કાનો ચેપ'
    },
    organ: {
      en: 'Upper Leaf Surface',
      hi: 'ऊपरी पत्ती की सतह',
      gu: 'ઉપરના પાંદડાની સપાટી'
    },
    severity: {
      en: 'Tier 1 (Early Stage)',
      hi: 'स्तर 1 (प्रारंभिक चरण)',
      gu: 'સ્તર 1 (શરૂઆતી તબક્કો)'
    },
    symptoms: {
      en: [
        'Small reddish-brown powdery pustules on both upper and lower leaf surfaces',
        'Pustules rupture epiderm to release rust-colored spores when touched',
        'Minor leaf yellowing surrounding dense spore cluster areas'
      ],
      hi: [
        'ऊपरी और निचली दोनों पत्ती सतहों पर छोटे लाल-भूरे रंग के पाउडर वाले फफोले',
        'स्पर्श करने पर जंग के रंग के बीजाणु छोड़ने के लिए फफोले फूटते हैं',
        'घने बीजाणु समूह क्षेत्रों के आसपास थोड़ा पीलापन'
      ],
      gu: [
        'ઉપરના અને નીચલા પાંદડા પર નાના લાલ-બદામી પાવડરી ફોલ્લા',
        'અડવાથી રસ્ટ રંગના બીજાણુ મુક્ત કરવા માટે ફોલ્લા ફૂટે છે',
        'બીજાણુ વિસ્તારોની આસપાસ થોડી પીળાશ'
      ]
    },
    organicTreatments: {
      en: [
        'Apply bio-fungicide containing Bacillus subtilis early in the morning.',
        'Dust leaf surfaces with fine agricultural sulfur powder.'
      ],
      hi: [
        'सुबह जल्दी बेसिलस सबटाइलिस युक्त जैव-कवकनाशी लगाएं।',
        'पत्ती की सतहों पर बारीक कृषि सल्फर पाउडर का छिड़काव करें।'
      ],
      gu: [
        'વહેલી સવારે બેસિલસ સબટિલિસ ધરાવતી બાયો-ફૂગનાશક લગાવો.',
        'પાંદડા પર દંડ કૃષિ સલ્ફર પાવડર છાંટો.'
      ]
    },
    chemicalTreatments: {
      en: [
        'Foliar spray with Propiconazole or Tebuconazole if rust spreads past 5% canopy.'
      ],
      hi: [
        'यदि रस्ट 5% से अधिक फैलता है तो प्रोपिकोनाज़ोल या टेबूकोनाज़ोल का पर्ण छिड़काव करें।'
      ],
      gu: [
        'જો રસ્ટ 5% થી વધુ ફેલાય તો પ્રોપિકોનાઝોલ અથવા ટેબુકોનાઝોલનો છંટકાવ કરો.'
      ]
    },
    prevention: {
      en: [
        'Plant rust-resistant corn cultivars during damp seasons.',
        'Destroy crop residue post-harvest to eliminate overwintering spores.'
      ],
      hi: [
        'नमी वाले मौसम के दौरान रस्ट-प्रतिरोधी मक्का की किस्में लगाएं।',
        'बीजाणुओं को खत्म करने के लिए फसल के अवशेषों को नष्ट करें।'
      ],
      gu: [
        'ભેજવાળી ઋતુમાં રસ્ટ-પ્રતિકારક મકાઈની વાવણી કરો.',
        'બીજાણુઓને નાબૂદ કરવા માટે લણણી પછી પાકના અવશેષોનો નાશ કરો.'
      ]
    },
    stats: {
      en: [
        { label: 'Spore Density', value: 'Low to Moderate' },
        { label: 'Weather Impact', value: 'Cool & Humid Nights' },
        { label: 'Yield Projection', value: '95% (If Treated)' }
      ],
      hi: [
        { label: 'बीजाणु घनत्व', value: 'कम से मध्यम' },
        { label: 'मौसम का प्रभाव', value: 'ठंडी और नम रातें' },
        { label: 'उपज का अनुमान', value: '95% (यदि उपचारित)' }
      ],
      gu: [
        { label: 'બીજાણુ ઘનતા', value: 'ઓછી થી મધ્યમ' },
        { label: 'હવામાન અસર', value: 'ઠંડી અને ભેજવાળી રાતો' },
        { label: 'ઉત્પાદન પૂર્વાનુમાન', value: '95% (જો સારવાર કરાય)' }
      ]
    }
  }
];

// Preset Prompts per language
const PRESET_PROMPTS_MULTILINGUAL = {
  en: [
    '🌱 How do I treat yellow leaves on tomatoes?',
    '💧 What is the best watering schedule for urban balcony plants?',
    '🐛 How to organically control aphids and whiteflies?',
    '🧪 What soil pH is best for indoor microgreens?'
  ],
  hi: [
    '🌱 टमाटर की पीली पत्तियों का इलाज कैसे करें?',
    '💧 बालकनी के पौधों के लिए पानी देने का सही तरीका क्या है?',
    '🐛 कीटों और सफेद मक्खी को जैविक रूप से कैसे नियंत्रित करें?',
    '🧪 इनडोर माइक्रोग्रीन्स के लिए मिट्टी का पीएच कितना होना चाहिए?'
  ],
  gu: [
    '🌱 ટામેટાના પીળા પાંદડાની સારવાર કેવી રીતે કરવી?',
    '💧 બાલ્કનીના છોડ માટે પાણી આપવાનો યોગ્ય સમય કયો છે?',
    '🐛 જીવાતો અને સફેદ માખીનું જૈવિક નિયંત્રણ કેવી રીતે કરવું?',
    '🧪 ઇન્ડોર માઇક્રોગ્રીન્સ માટે જમીનનું pH કેટલું હોવું જોઈએ?'
  ]
};

// AI Answers per language
const AI_RESPONSES_MULTILINGUAL = {
  en: {
    yellow_leaves: `Yellow leaves on tomatoes usually point to **Nitrogen deficiency** or **Early Blight**. Here is your step-by-step diagnostic solution:\n\n1. **Check Leaf Position**: If bottom leaves yellow first, it's often nitrogen loss or moisture stress.\n2. **Check for Spots**: Dark spots with yellow rings mean fungal blight. Prune affected foliage immediately.\n3. **Soil Feeding**: Feed with a balanced organic kelp or fish emulsion fertilizer high in nitrogen.\n4. **Water Control**: Allow the top 1 inch of soil to dry out between waterings.`,
    watering_schedule: `For urban balcony container farming, follow this smart watering rule:\n\n• **Summer Heat (>30°C)**: Deep water once early morning and check moisture again at dusk.\n• **Spring / Autumn (18–25°C)**: Water every 2–3 days when top soil feels dry.\n• **Container Tip**: Ensure pots have drainage holes & elevate 1 cm so roots don't waterlog!`,
    aphids_control: `Here is a 100% natural remedy for aphids and soft-bodied pests:\n\n1. **Soap & Oil Spray**: Mix 1 tsp mild liquid Castile soap + 1 tsp neem oil + 1 liter lukewarm water.\n2. **Application**: Spray thoroughly, especially on leaf undersides, every 3 days for 2 weeks.\n3. **Physical Blast**: Spray off heavy infestations with a firm jet of water first!`,
    soil_ph: `For indoor microgreens and herbs:\n\n• **Ideal Soil pH**: **6.0 to 6.8** (Slightly Acidic).\n• **Why it matters**: In this range, essential minerals (Iron, Magnesium, Phosphorus) are easily absorbed.\n• **Quick Test**: Use an inexpensive digital probe or pH strip with distilled water test.`,
    default: `Thank you for asking! Krishi AI analyzes real-time weather forecasts, soil sensor feeds, and leaf photo uploads to give precise localized advice.`
  },
  hi: {
    yellow_leaves: `टमाटर पर पीली पत्तियां आमतौर पर **नाइट्रोजन की कमी** या **अगेती झुलसा (अर्ली ब्लाइट)** का संकेत देती हैं:\n\n1. **पत्ती की स्थिति देखें**: यदि निचली पत्तियां पहले पीली होती हैं, तो यह नाइट्रोजन की कमी या नमी का तनाव है।\n2. **धब्बों की जांच करें**: पीले छल्लों वाले काले धब्बों का मतलब फंगल ब्लाइट है। प्रभावित पत्तियों को तुरंत काटें।\n3. **जैविक खाद**: नाइट्रोजन युक्त जैविक तरल खाद या नीम/समुद्री घास खाद दें।\n4. **सिंचाई नियंत्रण**: पानी देने के बीच मिट्टी की ऊपरी 1 इंच सतह को सूखने दें।`,
    watering_schedule: `शहरी बालकनी के गमलों के लिए स्मार्ट सिंचाई नियम:\n\n• **गर्मी का मौसम (>30°C)**: सुबह जल्दी गहरा पानी दें और शाम को नमी की जांच करें।\n• **सामान्य मौसम (18–25°C)**: जब ऊपरी मिट्टी सूखी लगे तब 2-3 दिनों में एक बार पानी दें।\n• **सुझाव**: सुनिश्चित करें कि गमलों में ड्रेनेज छेद हों ताकि जड़ों में पानी न रुके!`,
    aphids_control: `कीटों और माहू के लिए 100% प्राकृतिक उपाय:\n\n1. **नीम तेल स्प्रे**: 1 चम्मच नीम का तेल + 1 चम्मच तरल साबुन + 1 लीटर गुनगुना पानी मिलाएं।\n2. **छिड़काव**: पत्तियों के निचले हिस्से पर 2 सप्ताह तक हर 3 दिन में छिड़काव करें।\n3. **पानी का छिड़काव**: भारी कीटों को पहले पानी की तेज धार से धो लें!`,
    soil_ph: `इनडोर माइक्रोग्रीन्स और जड़ी-बूटियों के लिए:\n\n• **आदर्श मिट्टी पीएच**: **6.0 से 6.8** (हल्का अम्लीय)।\n• **महत्व**: इस सीमा में, आवश्यक खनिज (आयरन, मैग्नीशियम) पौधे आसानी से अवशोषित करते हैं।\n• **परीक्षण**: डिजिटल प्रोब या पीएच स्ट्रिप का उपयोग करें।`,
    default: `पूछने के लिए धन्यवाद! कृषि एआई सटीक सलाह देने के लिए वास्तविक समय के मौसम और पत्तियों का विश्लेषण करता है।`
  },
  gu: {
    yellow_leaves: `ટામેટા પર પીળા પાંદડા સામાન્ય રીતે **નાઇટ્રોજનની ઉણપ** અથવા **અગેતી સુકારો** દર્શાવે છે:\n\n1. **પાંદડાની સ્થિતિ તપાસો**: જો નીચલા પાંદડા પહેલા પીળા થાય તો તે નાઇટ્રોજનની ઉણપ છે.\n2. **ધબ્બા જુઓ**: પીળા કુંડાળા સાથે કાળા ધબ્બા એટલે ફૂગનો રોગ. અસરગ્રસ્ત પાંદડા તરત કાપી લો.\n3. **જૈવિક ખાતર**: નાઇટ્રોજન યુક્ત જૈવિક ખાતર આપો.\n4. **સિંચાઈ નિયંત્રણ**: ઉપરની 1 ઇંચ જમીન સુકાય પછી જ પાણી આપો.`,
    watering_schedule: `બાલ્કનીના છોડ માટે ખાસ સિંચાઈ ટિપ્સ:\n\n• **ઉનાળો (>30°C)**: વહેલી સવારે પાણી આપો અને સાંજે જમીનની ભેજ ચકાસો.\n• **સામાન્ય ઋતુ (18–25°C)**: જમીન સુકાય ત્યારે 2-3 દિવસે પાણી આપો.\n• **ટિપ**: કુંડામાં કાણાં હોવા જરૂરી છે જેથી મૂળ કોહવાઈ ન જાય!`,
    aphids_control: `મોલો-મશી અને જીવાતો માટે 100% કુદરતી ઉપાય:\n\n1. **લીમડાના તેલનો છંટકાવ**: 1 ચમચી લીમડાનું તેલ + 1 ચમચી સાબુનું દ્રાવણ + 1 લિટર નવશેકું પાણી મિશ્ર કરો.\n2. **છંટકાવ**: પાંદડાની પાછળ 2 અઠવાડિયા સુધી દર 3 દિવસે છંટકાવ કરો.`,
    soil_ph: `ઇન્ડોર છોડ અને માઇક્રોગ્રીન્સ માટે:\n\n• **યોગ્ય pH**: **6.0 થી 6.8** (હળવું એસિડિક).\n• **મહત્વ**: આ પ્રમાણમાં છોડ આયર્ન અને મેગ્નેશિયમ સરળતાથી શોષી શકે છે.`,
    default: `પૂછવા માટે આભાર! કૃષિ AI રીઅલ-ટાઇમ હવામાન અને પાંદડાના ફોટાનું પૃથ્થકરણ કરીને ચોક્કસ માર્ગદર્શન આપે છે.`
  }
};

// UI UI Text Labels per language
const LABELS_MULTILINGUAL = {
  en: {
    heroTag: 'INTERACTIVE GUEST DEMO',
    heroTitle: 'Try AI Plant Diagnosis &',
    heroTitleGrad: 'Crop AI Assistant',
    heroSub: 'Explore live interactive previews of our cutting-edge AI plant disease diagnosis reports and our intelligent Krishi Crop Assistant designed for urban farmers & growers.',
    allDemos: 'All Demos',
    diagnosisDemo: 'Diagnosis Report Demo',
    assistantDemo: 'Crop AI Assistant Demo',
    sampleScanLabel: 'Choose Sample Scan:',
    scanSpeed: 'Scan Speed',
    severityLevel: 'Severity Level',
    aiMatch: 'AI Match Confidence',
    symptomsTab: 'Symptoms',
    organicTab: 'Organic Remedies',
    chemicalTab: 'Chemical Controls',
    preventionTab: 'Prevention & Care',
    symptomsHeading: 'Key Visual Diagnostic Markers:',
    organicHeading: 'Recommended Eco-Friendly Treatment:',
    chemicalHeading: 'Targeted Crop Protection:',
    preventionHeading: 'Preventive Environmental Rules:',
    diagnoseBtn: 'Diagnose Your Own Plant',
    shareBtn: 'Share Sample Report',
    assistantTitle: 'Interactive Smart Farming Assistant',
    assistantSub: 'Test our localized agronomic AI assistant! Click any preset question or enter your own query to see how Krishi AI provides real-time farming solutions.',
    online: 'Online',
    resetDemo: 'Reset Demo',
    quickPrompts: 'Quick Prompts:',
    placeholder: 'Ask Krishi AI about crops, watering, pests, or soil...',
    send: 'Send',
    hl1Title: '98.4% Accuracy Scan',
    hl1Sub: 'Instant computer vision models trained on thousands of crop disease datasets.',
    hl2Title: '24/7 Agronomist Bot',
    hl2Sub: 'Get immediate, context-aware answers to soil, irrigation, fertilizer, and weather challenges.',
    hl3Title: 'Organic First Advice',
    hl3Sub: 'Prioritizes eco-friendly, non-toxic bio-fungicides and natural repellents for safe urban harvesting.',
    ctaBadge: 'READY TO BOOST YOUR FARM YIELD?',
    ctaTitle: 'Start Diagnosing & Managing Your Garden Free',
    ctaSub: 'Create your free account today and unlock full live AI leaf scanning, smart watering alerts, and garden management.',
    getStarted: 'Get Started Free',
    exploreFeatures: 'Explore Full Features'
  },
  hi: {
    heroTag: 'इंटरएक्टिव गेस्ट डेमो',
    heroTitle: 'एआई पौधा रोग निदान और',
    heroTitleGrad: 'फसल एआई सहायक आज़माएं',
    heroSub: 'शहरी किसानों और उत्पादकों के लिए डिज़ाइन की गई हमारी अत्याधुनिक एआई पौधा रोग निदान रिपोर्ट और बुद्धिमान कृषि फसल सहायक का लाइव इंटरएक्टिव पूर्वावलोकन करें।',
    allDemos: 'सभी डेमो',
    diagnosisDemo: 'निदान रिपोर्ट डेमो',
    assistantDemo: 'फसल एआई सहायक डेमो',
    sampleScanLabel: 'नमूना स्कैन चुनें:',
    scanSpeed: 'स्कैन गति',
    severityLevel: 'गंभीरता स्तर',
    aiMatch: 'एआई मिलान विश्वास',
    symptomsTab: 'लक्षण',
    organicTab: 'जैविक उपचार',
    chemicalTab: 'रासायनिक नियंत्रण',
    preventionTab: 'रोकथाम और देखभाल',
    symptomsHeading: 'मुख्य दृश्य नैदानिक लक्षण:',
    organicHeading: 'अनुशंसित पर्यावरण-अनुकूल उपचार:',
    chemicalHeading: 'लक्षित फसल सुरक्षा:',
    preventionHeading: 'निवारक पर्यावरणीय नियम:',
    diagnoseBtn: 'अपने पौधे का निदान करें',
    shareBtn: 'रिपोर्ट साझा करें',
    assistantTitle: 'इंटरएक्टिव स्मार्ट फार्मिंग सहायक',
    assistantSub: 'हमारे स्थानीयकृत कृषि एआई सहायक का परीक्षण करें! कृषि एआई वास्तविक समय के समाधान कैसे प्रदान करता है यह देखने के लिए किसी भी प्रश्न पर क्लिक करें।',
    online: 'ऑनलाइन',
    resetDemo: 'डेमो रीसेट करें',
    quickPrompts: 'त्वरित प्रश्न:',
    placeholder: 'कृषि एआई से फसलों, सिंचाई, कीटों या मिट्टी के बारे में पूछें...',
    send: 'भेजें',
    hl1Title: '98.4% सटीक स्कैन',
    hl1Sub: 'हजारों फसल रोग डेटासेट पर प्रशिक्षित कंप्यूटर विज़न मॉडल।',
    hl2Title: '24/7 कृषि विशेषज्ञ बोट',
    hl2Sub: 'मिट्टी, सिंचाई, उर्वरक और मौसम की चुनौतियों के तत्काल उत्तर प्राप्त करें।',
    hl3Title: 'जैविक प्रथम सलाह',
    hl3Sub: 'सुरक्षित शहरी कटाई के लिए पर्यावरण के अनुकूल जैविक-कवकनाशी को प्राथमिकता देता है।',
    ctaBadge: 'क्या आप अपनी फसल की उपज बढ़ाने के लिए तैयार हैं?',
    ctaTitle: 'निःशुल्क अपने बगीचे का निदान और प्रबंधन शुरू करें',
    ctaSub: 'आज ही अपना निःशुल्क खाता बनाएं और लाइव एआई स्कैन और स्मार्ट सिंचाई अलर्ट अनलॉक करें।',
    getStarted: 'मुफ्त में शुरू करें',
    exploreFeatures: 'सभी सुविधाएं देखें'
  },
  gu: {
    heroTag: 'ઇન્ટરેક્ટિવ ગેસ્ટ ડેમો',
    heroTitle: 'એઆઈ છોડ રોગ નિદાન અને',
    heroTitleGrad: 'પાક એઆઈ સહાયક અજમાવો',
    heroSub: 'શહેરી ખેડૂતો માટે ડિઝાઇન કરાયેલ અદ્યતન એઆઈ છોડ રોગ નિદાન અહેવાલો અને કૃષિ સહાયકનું લાઇવ ઇન્ટરેક્ટિવ પૂર્વાવલોકન કરો.',
    allDemos: 'બધા ડેમો',
    diagnosisDemo: 'નિદાન અહેવાલ ડેમો',
    assistantDemo: 'પાક એઆઈ સહાયક ડેમો',
    sampleScanLabel: 'સેમ્પલ સ્કેન પસંદ કરો:',
    scanSpeed: 'સ્કેન ઝડપ',
    severityLevel: 'તીવ્રતા સ્તર',
    aiMatch: 'AI મેચ વિશ્વાસ',
    symptomsTab: 'લક્ષણો',
    organicTab: 'જૈવિક ઉપચાર',
    chemicalTab: 'રાસાયણિક નિયંત્રણ',
    preventionTab: 'સંભાળ અને નિવારણ',
    symptomsHeading: 'મુખ્ય દ્રશ્ય નિદાન લક્ષણો:',
    organicHeading: 'ભલામણ કરેલ જૈવિક ઉપચાર:',
    chemicalHeading: 'લક્ષિત પાક સુરક્ષા:',
    preventionHeading: 'નિવારક પર્યાવરણીય નિયમો:',
    diagnoseBtn: 'તમારા છોડનું નિદાન કરો',
    shareBtn: 'અહેવાલ શેર કરો',
    assistantTitle: 'ઇન્ટરેક્ટિવ સ્માર્ટ ફાર્મિંગ સહાયક',
    assistantSub: 'અમારા કૃષિ AI સહાયકનું પરીક્ષણ કરો! કૃષિ AI રીઅલ-ટાઇમ ઉકેલો કેવી રીતે આપે છે તે જોવા માટે પ્રશ્ન પર ક્લિક કરો.',
    online: 'ઓનલાઇન',
    resetDemo: 'ડેમો રીસેટ કરો',
    quickPrompts: 'ઝડપી પ્રશ્નો:',
    placeholder: 'કૃષિ AI ને પાક, સિંચાઈ, જીવાત કે જમીન વિશે પૂછો...',
    send: 'મોકલો',
    hl1Title: '98.4% ચોક્કસ સ્કેન',
    hl1Sub: 'હજારો પાક રોગ ડેટાસેટ્સ પર તાલીમ પામેલા કોમ્પ્યુટર વિઝન મોડલ્સ.',
    hl2Title: '24/7 કૃષિ નિષ્ણાત બોટ',
    hl2Sub: 'જમીન, સિંચાઈ, ખાતર અને હવામાનના પડકારોના તાત્કાલિક જવાબો મેળવો.',
    hl3Title: 'પ્રથમ જૈવિક સલાહ',
    hl3Sub: 'સુરક્ષિત લણણી માટે પર્યાવરણને અનુકૂળ જૈવિક ઉપચારોને પ્રાધાન્ય આપે છે.',
    ctaBadge: 'શું તમે તમારું ઉત્પાદન વધારવા તૈયાર છો?',
    ctaTitle: 'મફતમાં તમારા બગીચાનું નિદાન અને સંચાલન શરૂ કરો',
    ctaSub: 'આજે જ તમારું ફ્રી એકાઉન્ટ બનાવો અને લાઇવ AI લીફ સ્કેનિંગ અને સિંચાઈ એલર્ટ્સ અનલોક કરો.',
    getStarted: 'મફતમાં શરૂ કરો',
    exploreFeatures: 'તમામ સુવિધાઓ જુઓ'
  }
};

const DemoPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language && ['en', 'hi', 'gu'].includes(i18n.language) ? i18n.language : 'en';
  const L = LABELS_MULTILINGUAL[lang] || LABELS_MULTILINGUAL.en;

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'diagnosis', 'assistant'
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [reportSubTab, setReportSubTab] = useState('symptoms');

  // Multi-lingual initial messages
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Reset initial chat on language change
    const initialText = {
      en: "Hello! I'm **Krishi AI**, your Smart Crop Assistant. How can I help you optimize your harvest today?",
      hi: "नमस्ते! मैं **कृषि एआई** हूँ, आपका स्मार्ट फसल सहायक। आज मैं आपकी फसल को बेहतर बनाने में कैसे मदद कर सकता हूँ?",
      gu: "નમસ્તે! હું **કૃષિ AI** છું, તમારો સ્માર્ટ પાક સહાયક. આજે હું તમને કેવી રીતે મદદ કરી શકું?"
    }[lang];

    const sampleUserText = {
      en: 'My tomato plant leaves have dark spots with yellow circles. What should I do?',
      hi: 'मेरे टमाटर के पौधे की पत्तियों पर पीले घेरों के साथ काले धब्बे हैं। मुझे क्या करना चाहिए?',
      gu: 'મારા ટામેટાના છોડના પાંદડા પર પીળા કુંડાળા સાથે કાળા ધબ્બા છે. મારે શું કરવું જોઈએ?'
    }[lang];

    const sampleAiText = {
      en: `Based on your description, this is **Early Blight (Alternaria solani)**.\n\n1. ✂️ **Prune**: Remove yellowing lower leaves immediately.\n2. 💧 **Drip Water**: Avoid wetting leaves.\n3. 🌿 **Organic Spray**: Apply organic copper spray every 7 days.`,
      hi: `आपके विवरण के आधार पर, यह **अगेती झुलसा (अल्ट्रानेरिया सोलेनाई)** है।\n\n1. ✂️ **कटाई**: निचली पीली पत्तियों को तुरंत हटा दें।\n2. 💧 **सिंचाई**: पत्तियों को गीला करने से बचें।\n3. 🌿 **जैविक स्प्रे**: हर 7 दिन में कॉपर स्प्रे का प्रयोग करें।`,
      gu: `તમારા વર્ણન અનુસાર, આ **અગેતી સુકારો** છે.\n\n1. ✂️ **કાપણી**: પીળા પાંદડા તરત દૂર કરો.\n2. 💧 **સિંચાઈ**: પાંદડા ભીના ન કરો.\n3. 🌿 **જૈવિક સ્પ્રે**: દર 7 દિવસે લીમડાનું દ્રાવણ છાંટો.`
    }[lang];

    setMessages([
      { id: 1, sender: 'ai', text: initialText, timestamp: '10:00 AM' },
      { id: 2, sender: 'user', text: sampleUserText, timestamp: '10:01 AM' },
      { id: 3, sender: 'ai', text: sampleAiText, timestamp: '10:01 AM' }
    ]);
  }, [lang]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  const rawReport = SAMPLE_REPORTS_MULTILINGUAL[selectedReportIndex];
  const activeReport = {
    ...rawReport,
    cropName: rawReport.cropName[lang] || rawReport.cropName.en,
    variety: rawReport.variety[lang] || rawReport.variety.en,
    condition: rawReport.condition[lang] || rawReport.condition.en,
    statusText: rawReport.statusText[lang] || rawReport.statusText.en,
    organ: rawReport.organ[lang] || rawReport.organ.en,
    severity: rawReport.severity[lang] || rawReport.severity.en,
    symptoms: rawReport.symptoms[lang] || rawReport.symptoms.en,
    organicTreatments: rawReport.organicTreatments[lang] || rawReport.organicTreatments.en,
    chemicalTreatments: rawReport.chemicalTreatments[lang] || rawReport.chemicalTreatments.en,
    prevention: rawReport.prevention[lang] || rawReport.prevention.en,
    stats: rawReport.stats[lang] || rawReport.stats.en
  };

  const presetPrompts = PRESET_PROMPTS_MULTILINGUAL[lang] || PRESET_PROMPTS_MULTILINGUAL.en;

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    document.documentElement.lang = code;
  };

  const handleSendPrompt = (promptText) => {
    if (!promptText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReplyText = '';
      const lower = promptText.toLowerCase();
      const responses = AI_RESPONSES_MULTILINGUAL[lang] || AI_RESPONSES_MULTILINGUAL.en;

      if (lower.includes('yellow') || lower.includes('पीली') || lower.includes('પીળા') || lower.includes('tomato')) {
        aiReplyText = responses.yellow_leaves;
      } else if (lower.includes('water') || lower.includes('पानी') || lower.includes('પાણી')) {
        aiReplyText = responses.watering_schedule;
      } else if (lower.includes('aphid') || lower.includes('कीट') || lower.includes('જીવાત')) {
        aiReplyText = responses.aphids_control;
      } else if (lower.includes('ph') || lower.includes('soil') || lower.includes('मिट्टी') || lower.includes('જમીન')) {
        aiReplyText = responses.soil_ph;
      } else {
        aiReplyText = responses.default;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(inputQuery);
  };

  const formatMessageText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="chat-line">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="demo-page">
      <SEO
        title="Interactive Guest Demo - Plant Diagnosis & AI Assistant | UrbanFarm"
        description="Experience UrbanFarm's live static interactive demo in English, Hindi, and Gujarati."
      />

      {/* Hero Header Banner */}
      <section className="demo-hero">
        <div className="demo-container text-center">
          <span className="demo-tag">
            <RiSparklingLine /> {L.heroTag}
          </span>
          <h1 className="demo-hero-title">
            {L.heroTitle} <span className="demo-gradient-text">{L.heroTitleGrad}</span>
          </h1>
          <p className="demo-hero-subtitle">{L.heroSub}</p>

          {/* Interactive Filter Pills */}
          <div className="demo-filter-bar">
            <button
              className={`demo-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <FaSlidersH /> {L.allDemos}
            </button>
            <button
              className={`demo-filter-btn ${activeFilter === 'diagnosis' ? 'active' : ''}`}
              onClick={() => setActiveFilter('diagnosis')}
            >
              <FaMicroscope /> {L.diagnosisDemo}
            </button>
            <button
              className={`demo-filter-btn ${activeFilter === 'assistant' ? 'active' : ''}`}
              onClick={() => setActiveFilter('assistant')}
            >
              <FaRobot /> {L.assistantDemo}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="demo-content-section">
        <div className="demo-container">

          {/* SECTION 1: AI DIAGNOSIS REPORT DEMO */}
          {(activeFilter === 'all' || activeFilter === 'diagnosis') && (
            <div className="demo-card-block demo-diagnosis-block" id="diagnosis-demo">
              <div className="demo-block-header">
                <div className="demo-block-badge">
                  <FaMicroscope /> {L.diagnosisDemo}
                </div>
                <h2>{activeReport.condition}</h2>
                <p>{L.heroSub}</p>
              </div>

              {/* Sample Selector Buttons */}
              <div className="demo-sample-selector">
                <span className="selector-label">{L.sampleScanLabel}</span>
                <div className="selector-pills">
                  {SAMPLE_REPORTS_MULTILINGUAL.map((rep, idx) => {
                    const cName = rep.cropName[lang] || rep.cropName.en;
                    const cond = rep.condition[lang] || rep.condition.en;
                    return (
                      <button
                        key={rep.id}
                        className={`sample-pill ${selectedReportIndex === idx ? 'active' : ''}`}
                        onClick={() => setSelectedReportIndex(idx)}
                      >
                        <span className={`pill-dot ${rep.status}`} />
                        {cName.split(' ')[0]} - {cond.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Diagnosis Card Container */}
              <div className="demo-report-card">
                {/* Top Banner Row */}
                <div className="report-card-top">
                  <div className="report-title-meta">
                    <span className={`report-status-badge ${activeReport.status}`}>
                      {activeReport.status === 'healthy' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      {activeReport.statusText}
                    </span>
                    <h3 className="report-crop-title">{activeReport.cropName}</h3>
                    <p className="report-sub-meta">Variety: <strong>{activeReport.variety}</strong> • Organ: <strong>{activeReport.organ}</strong></p>
                  </div>

                  <div className="report-confidence-pill">
                    <div className="conf-value">{activeReport.confidence}%</div>
                    <div className="conf-label">{L.aiMatch}</div>
                  </div>
                </div>

                {/* Grid Body */}
                <div className="report-card-body-grid">
                  {/* Left Column */}
                  <div className="report-left-col">
                    <div className="report-img-wrapper">
                      <img
                        src={activeReport.image}
                        alt={activeReport.cropName}
                        className="report-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="report-img-overlay-tag">
                        <RiSparklingLine /> Instant Vision Analysis
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="report-quick-stats">
                      <div className="qstat-item">
                        <span className="qstat-label">{L.scanSpeed}</span>
                        <strong className="qstat-val">{activeReport.detectionTime}</strong>
                      </div>
                      <div className="qstat-item">
                        <span className="qstat-label">{L.severityLevel}</span>
                        <strong className="qstat-val">{activeReport.severity}</strong>
                      </div>
                      {activeReport.stats.map((st, i) => (
                        <div key={i} className="qstat-item">
                          <span className="qstat-label">{st.label}</span>
                          <strong className="qstat-val">{st.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="report-right-col">
                    <div className="report-nav-tabs">
                      <button
                        className={`rnav-tab ${reportSubTab === 'symptoms' ? 'active' : ''}`}
                        onClick={() => setReportSubTab('symptoms')}
                      >
                        <FaSearch /> {L.symptomsTab}
                      </button>
                      <button
                        className={`rnav-tab ${reportSubTab === 'organic' ? 'active' : ''}`}
                        onClick={() => setReportSubTab('organic')}
                      >
                        <FaLeaf /> {L.organicTab}
                      </button>
                      <button
                        className={`rnav-tab ${reportSubTab === 'chemical' ? 'active' : ''}`}
                        onClick={() => setReportSubTab('chemical')}
                      >
                        <FaFlask /> {L.chemicalTab}
                      </button>
                      <button
                        className={`rnav-tab ${reportSubTab === 'prevention' ? 'active' : ''}`}
                        onClick={() => setReportSubTab('prevention')}
                      >
                        <FaShieldAlt /> {L.preventionTab}
                      </button>
                    </div>

                    {/* Tab Content Panels */}
                    <div className="report-tab-content">
                      {reportSubTab === 'symptoms' && (
                        <div className="rtab-panel">
                          <h4>{L.symptomsHeading}</h4>
                          <ul className="report-bullet-list">
                            {activeReport.symptoms.map((s, idx) => (
                              <li key={idx}>
                                <FaCheck className="bullet-icon" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reportSubTab === 'organic' && (
                        <div className="rtab-panel">
                          <h4>{L.organicHeading}</h4>
                          <ul className="report-bullet-list">
                            {activeReport.organicTreatments.map((s, idx) => (
                              <li key={idx}>
                                <FaLeaf className="bullet-icon organic" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reportSubTab === 'chemical' && (
                        <div className="rtab-panel">
                          <h4>{L.chemicalHeading}</h4>
                          <ul className="report-bullet-list">
                            {activeReport.chemicalTreatments.map((s, idx) => (
                              <li key={idx}>
                                <FaFlask className="bullet-icon chemical" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {reportSubTab === 'prevention' && (
                        <div className="rtab-panel">
                          <h4>{L.preventionHeading}</h4>
                          <ul className="report-bullet-list">
                            {activeReport.prevention.map((s, idx) => (
                              <li key={idx}>
                                <FaShieldAlt className="bullet-icon prevention" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="report-action-bar">
                      <Link to="/register" className="demo-btn demo-btn-primary">
                        <FaMicroscope /> {L.diagnoseBtn}
                      </Link>
                      <button
                        className="demo-btn demo-btn-outline"
                        onClick={() => alert('Summary copied!')}
                      >
                        <FaShareAlt /> {L.shareBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CROP AI ASSISTANT DEMO */}
          {(activeFilter === 'all' || activeFilter === 'assistant') && (
            <div className="demo-card-block demo-assistant-block" id="assistant-demo">
              <div className="demo-block-header">
                <div className="demo-block-badge assistant">
                  <FaRobot /> {L.assistantDemo}
                </div>
                <h2>{L.assistantTitle}</h2>
                <p>{L.assistantSub}</p>
              </div>

              {/* Chat Container Card */}
              <div className="demo-chat-card">
                {/* Chat Top Header */}
                <div className="chat-card-header">
                  <div className="chat-bot-avatar">
                    <FaRobot />
                  </div>
                  <div className="chat-bot-info">
                    <h4>Krishi AI Assistant <span className="online-indicator">{L.online}</span></h4>
                    <p>UrbanFarm Neural Agronomy Engine • 30+ Crops</p>
                  </div>
                  <button
                    className="chat-reset-btn"
                    onClick={() => {
                      setMessages([
                        {
                          id: Date.now(),
                          sender: 'ai',
                          text: L.assistantSub,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                  >
                    <FaRedo /> {L.resetDemo}
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="chat-preset-bar">
                  <span className="preset-label">{L.quickPrompts}</span>
                  <div className="preset-chips">
                    {presetPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        className="preset-chip-btn"
                        onClick={() => handleSendPrompt(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages-window">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                      <div className="chat-avatar">
                        {msg.sender === 'ai' ? <FaRobot /> : <FaUser />}
                      </div>
                      <div className="chat-bubble">
                        <div className="chat-text">{formatMessageText(msg.text)}</div>
                        <span className="chat-time">{msg.timestamp}</span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="chat-bubble-row ai typing">
                      <div className="chat-avatar">
                        <FaRobot />
                      </div>
                      <div className="chat-bubble">
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Form */}
                <form className="chat-input-form" onSubmit={handleFormSubmit}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={L.placeholder}
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn" disabled={!inputQuery.trim()}>
                    <FaPaperPlane /> {L.send}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* HIGHLIGHTS CARDS */}
          <div className="demo-highlights-grid">
            <div className="highlight-card">
              <div className="hl-icon-box">
                <FaMicroscope />
              </div>
              <h3>{L.hl1Title}</h3>
              <p>{L.hl1Sub}</p>
            </div>

            <div className="highlight-card">
              <div className="hl-icon-box">
                <FaComments />
              </div>
              <h3>{L.hl2Title}</h3>
              <p>{L.hl2Sub}</p>
            </div>

            <div className="highlight-card">
              <div className="hl-icon-box">
                <FaShieldAlt />
              </div>
              <h3>{L.hl3Title}</h3>
              <p>{L.hl3Sub}</p>
            </div>
          </div>

          {/* CTA CARD */}
          <div className="demo-cta-card">
            <div className="cta-content">
              <span className="cta-badge"><FaSeedling /> {L.ctaBadge}</span>
              <h2>{L.ctaTitle}</h2>
              <p>{L.ctaSub}</p>
              <div className="cta-actions">
                <Link to="/register" className="demo-btn demo-btn-primary demo-btn-lg">
                  {L.getStarted} <FaArrowRight />
                </Link>
                <Link to="/features" className="demo-btn demo-btn-outline demo-btn-lg">
                  {L.exploreFeatures}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default DemoPage;
