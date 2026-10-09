const axios = require('axios');
const aiConfig = require('../config/aiConfig');

// Cooldown and caching mechanism to avoid rate limits (429) and spamming API
let geminiCooldownUntil = 0;
const adviceCache = new Map();

/**
 * Generate a 7-day smart watering and agronomy schedule based on:
 * - Plant type & growth stage
 * - Live ESP32 IoT sensor telemetry (Soil moisture, temp, humidity, light)
 * - Weather conditions & 7-day forecast
 * Uses Google Gemini AI with resilient rule-based agronomic fallback
 */
async function generateSchedule(plant, weatherData, iotData = null) {
  // 1. Rule-based fallback with full IoT and weather awareness
  const ruleBasedSchedule = generateRuleBasedSchedule(plant, weatherData, iotData);

  // 2. Try to enhance with Gemini AI if available and not in rate-limit cooldown
  if (!aiConfig.gemini.apiKey || Date.now() < geminiCooldownUntil) {
    return ruleBasedSchedule;
  }

  try {
    const model = aiConfig.gemini.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.gemini.apiKey}`;

    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const moisture = iotData?.soilMoisture ?? 45.0;
    const temp = iotData?.temperature ?? (weatherData?.main?.temp || 28);
    const humidity = iotData?.humidity ?? (weatherData?.main?.humidity || 55);
    const light = iotData?.light ?? 650;

    const prompt = `
You are an expert Agronomist and IoT Irrigation AI for Urban Farming.
Generate an intelligent 7-day watering and care schedule for:
- Plant: ${plant?.name || "Priya's Balcony Tomato"} (${plant?.variety || 'Sweet 100 Cherry & Roma'})
- Growth Stage: Flowering & Fruit-Set Phase
- Real-time IoT Telemetry: Soil Moisture: ${moisture}%, Air Temp: ${temp}°C, Humidity: ${humidity}%, Sunlight: ${light} lux
- Target Soil Moisture: 50% - 70% (Tomato ideal root-zone moisture)
- Weather Context: Current temp ${temp}°C, Forecast: ${weatherData?.weather?.[0]?.description || 'Clear/Hot'}
- Schedule Dates (7 consecutive days starting today):
${dates.join(', ')}

Guidelines for 7-Day Agronomy & IoT Irrigation:
1. If soil moisture < 45%, schedule a 250ml - 350ml root-zone drip today (Day 1). If moisture >= 60%, schedule 0ml (Rest Day).
2. For high heat (>32°C), recommend Pre-dawn (before 9 AM) or Evening soak (+20% volume) to minimize evaporation.
3. Include specific Tomato care tips: Blossom End Rot prevention (calcium uptake via steady moisture), Direct root drip (avoid wetting leaves to prevent Early Blight), rest/aeration days, and light pruning.
4. Alternate active watering days with rest days or light sips (e.g. 100ml, 250ml, 400ml, 0ml).

Return a valid JSON array of exactly 7 objects.
Each object schema:
{
  "date": "YYYY-MM-DD",
  "amount": "250ml",
  "timeOfDay": "morning",
  "actionType": "drip",
  "notes": "Clear concise reason mentioning soil moisture, heat, or blossom end rot prevention"
}

Return ONLY the JSON array starting with [ and ending with ]. No explanation.
`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (textResponse.length < 50) {
      return ruleBasedSchedule;
    }

    let jsonStr = textResponse.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    const startIdx = jsonStr.indexOf('[');
    const endIdx = jsonStr.lastIndexOf(']');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length >= 7) {
        return parsed;
      }
    }

    return ruleBasedSchedule;
  } catch (error) {
    if (error.response?.status === 429) {
      geminiCooldownUntil = Date.now() + 60000; // 1 min cooldown
      console.warn('Gemini API quota rate-limited (429), activated 60s cooldown. Using rule-based agronomic engine.');
    } else {
      console.warn('Gemini AI schedule fallback:', error.message);
    }
    return ruleBasedSchedule;
  }
}

/**
 * Robust rule-based fallback schedule generator
 */
function generateRuleBasedSchedule(plant, weatherData, iotData) {
  const moisture = iotData?.soilMoisture ?? 42.0;
  const temp = iotData?.temperature ?? (weatherData?.main?.temp || 30);
  const isHot = temp >= 32;

  const today = new Date();
  const schedule = [];

  const actions = [
    {
      amount: moisture < 48 ? (isHot ? '300ml' : '250ml') : '0ml',
      timeOfDay: isHot ? 'evening' : 'morning',
      actionType: moisture < 48 ? 'drip' : 'rest',
      notes: moisture < 48
        ? (isHot ? 'Evening root drip to beat midday evaporation and heat stress.' : 'Morning root drip for steady calcium absorption.')
        : 'Rest day: Root zone moisture buffer is optimal.'
    },
    {
      amount: '0ml',
      timeOfDay: 'morning',
      actionType: 'rest',
      notes: 'Soil aeration rest day: Promotes healthy root respiration.'
    },
    {
      amount: isHot ? '300ml' : '250ml',
      timeOfDay: isHot ? 'evening' : 'morning',
      actionType: 'calcium_feed',
      notes: 'Flowering feed: Consistent hydration prevents Blossom End Rot.'
    },
    {
      amount: '0ml',
      timeOfDay: 'morning',
      actionType: 'rest',
      notes: 'Estimated schedule: Soil moisture retained.'
    },
    {
      amount: '200ml',
      timeOfDay: 'morning',
      actionType: 'drip',
      notes: 'Light maintenance sip for flowering vigor.'
    },
    {
      amount: '0ml',
      timeOfDay: 'morning',
      actionType: 'rest',
      notes: 'Estimated schedule: Moisture buffer optimal.'
    },
    {
      amount: isHot ? '300ml' : '250ml',
      timeOfDay: isHot ? 'evening' : 'morning',
      actionType: 'drip',
      notes: 'Weekly deep root soak cycle.'
    }
  ];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    schedule.push({
      date: d.toISOString().split('T')[0],
      ...actions[i]
    });
  }

  return schedule;
}

/**
 * Precision IoT-driven Disease Prediction & Early Prevention Engine
 * Correlates real-time sensor metrics (Moisture, Temp, Humidity, Light, Rain)
 * to anticipate physiological disorders & fungal pathogens before symptoms manifest.
 * "Prevention is better than cure" (નિવારણ એ ઉપચાર કરતાં શ્રેષ્ઠ છે / इलाज से रोकथाम बेहतर है)
 */
function predictDiseaseRisks(sensorData = {}, weather = {}, forecast = null, lang = 'gu') {
  const moisture = Number(sensorData.soilMoisture ?? 40.6);
  const plantTemp = Number(sensorData.temperature ?? 29.7);
  const humidity = Number(sensorData.humidity ?? 46.4);
  const outsideTemp = Math.round(weather?.main?.temp || 36);
  const lightLux = Number(sensorData.light ?? 669);
  const rainChance = Number(forecast?.list?.[0]?.pop ? Math.round(forecast.list[0].pop * 100) : 10);

  const predictions = [];

  // 1. Blossom End Rot (BER) / કેલ્શિયમની ખામી અને ફળનો સડો
  // Triggered by low moisture (< 48%) or erratic watering + heat (>32°C) during flowering/fruiting
  if (moisture < 48 || (outsideTemp >= 33 && moisture < 52)) {
    const riskLevel = moisture < 38 ? 'High' : 'Medium';
    const riskScore = moisture < 38 ? 88 : 64;
    predictions.push({
      id: 'blossom_end_rot',
      name: lang === 'gu'
        ? 'બ્લોસમ એન્ડ રોટ (ફળનો તળિયેથી સડો / કેલ્શિયમ ખામી)'
        : lang === 'hi'
        ? 'ब्लॉसम एंड रॉट (फल का नीचे से सड़ना / कैल्शियम की कमी)'
        : 'Blossom End Rot (Distal Fruit Necrosis & Calcium Deficiency)',
      riskLevel,
      riskScore,
      statusLabel: lang === 'gu' ? (riskLevel === 'High' ? 'ઉચ્ચ જોખમ' : 'સંભવિત જોખમ') : lang === 'hi' ? (riskLevel === 'High' ? 'उच्च जोखिम' : 'संभावित जोखिम') : (riskLevel === 'High' ? 'High Threat' : 'Potential Risk'),
      triggerReason: lang === 'gu'
        ? `જમીનમાં ઓછો ભેજ (${moisture.toFixed(1)}%) અને ${outsideTemp}°C ગરમીના કારણે મૂળિયાંમાંથી કેલ્શિયમનું વહન અટકે છે, જેનાથી ફળના તળિયા કાળા પડી સડી શકે છે.`
        : lang === 'hi'
        ? `मिट्टी में कम नमी (${moisture.toFixed(1)}%) और ${outsideTemp}°C गर्मी के कारण जड़ों से फल तक कैल्शियम का संचरण रुक जाता है, जिससे फल नीचे से काला पड़ सकता है।`
        : `Low root-zone moisture (${moisture.toFixed(1)}%) combined with ${outsideTemp}°C ambient heat halts xylem calcium transpiration to developing tomato tips.`,
      iotTriggerText: lang === 'gu'
        ? `જમીનનો ભેજ (${moisture.toFixed(1)}% < 50% લક્ષ્ય)`
        : lang === 'hi'
        ? `मिट्टी की नमी (${moisture.toFixed(1)}% < 50% लक्ष्य)`
        : `Soil Moisture (${moisture.toFixed(1)}% < 50% target)`,
      prevention: lang === 'gu'
        ? [
            'સિંચાઈમાં એકસમાન 50-70% ભેજ જાળવી રાખો (ક્યારેય માટી સાવ સૂકી ન થવા દો).',
            'કૂંડામાં 2 ઇંચ લાકડાનો વહેર, કોકોપીટ કે સૂકા પાંદડાનું મલ્ચિંગ કરો જેથી ભેજ જળવાય.',
            'દર 15 દિવસે કૂંડામાં અડધી ચમચી ચૂનાનું પાણી (Calcium) અથવા બોનમીલ/ઈંડાના છોતરાંનો પાવડર ઉમેરો.'
          ]
        : lang === 'hi'
        ? [
            'सिंचाई में एकसमान 50-70% नमी बनाए रखें (मिट्टी को कभी एकदम सूखने न दें)।',
            'गमले में 2 इंच सूखी घास या कोकोपीट की मल्चिंग करें ताकि नमी सुरक्षित रहे।',
            'हर 15 दिन में गमले में आधा चम्मच बुझा हुआ चूना पानी (कैल्शियम) या बोनमील मिलाएं।'
          ]
        : [
            'Maintain steady 50–70% root-zone moisture; avoid dramatic wet-to-bone-dry moisture swings.',
            'Apply a 2-inch organic straw/cocopeat mulch layer over the container soil to conserve moisture.',
            'Supplement root zone with diluted calcium nitrate, gypsum, or bone meal/eggshell tea bi-weekly.'
          ],
      cureTip: lang === 'gu'
        ? 'અસરગ્રસ્ત કાળા થયેલાં ફળ તાત્કાલિક તોડી લો જેથી નવો ફાલ સ્વસ્થ વિકસે, અને સાંજે મૂળમાં હળવું કેલ્શિયમ ડ્રિપ આપો.'
        : lang === 'hi'
        ? 'प्रभावित काले फल तुरंत तोड़कर हटा दें ताकि नया फल स्वस्थ बने, और शाम को जड़ों में हल्का कैल्शियम घोल दें।'
        : 'Prune away any fruits showing sunken black bases so the plant redirects calcium to new setting fruit; apply evening root calcium drip.'
    });
  }

  // 2. Early Blight & Foliar Fungi (Alternaria solani / પાંદડાના કાળા ચકામા)
  // Triggered by high humidity (> 65%) or warm humid microclimate
  if (humidity >= 65 || (rainChance >= 40 && plantTemp >= 22)) {
    const riskLevel = humidity >= 78 ? 'High' : 'Medium';
    const riskScore = humidity >= 78 ? 82 : 60;
    predictions.push({
      id: 'early_blight',
      name: lang === 'gu'
        ? 'અર્લી બ્લાઇટ અને પાંદડાના કાળા ચકામા (ફૂગજન્ય રોગ)'
        : lang === 'hi'
        ? 'अगेती झुलसा व पत्ती धब्बा (फफूंद रोग)'
        : 'Early Blight & Foliar Fungal Spot (Alternaria)',
      riskLevel,
      riskScore,
      statusLabel: lang === 'gu' ? (riskLevel === 'High' ? 'ઉચ્ચ ફૂગ જોખમ' : 'સંભવિત ફૂગ જોખમ') : lang === 'hi' ? (riskLevel === 'High' ? 'उच्च फफूंद जोखिम' : 'संभावित फफूंद जोखिम') : (riskLevel === 'High' ? 'High Fungal Risk' : 'Fungal Spore Risk'),
      triggerReason: lang === 'gu'
        ? `હવામાં ઊંચો ભેજ (${humidity.toFixed(1)}%) અને ${plantTemp.toFixed(1)}°C તાપમાન ફૂગના બીજાણુઓ (Spores) ફેલાવા અને પાંદડા પર કાળા ગોળ ચકામા કરવા માટે અનુકૂળ છે.`
        : lang === 'hi'
        ? `हवा में अधिक नमी (${humidity.toFixed(1)}%) और ${plantTemp.toFixed(1)}°C तापमान फफूंद बीजाणुओं के अंकुरण और पत्तियों पर काले छल्लेदार धब्बों के अनुकूल है।`
        : `High air humidity (${humidity.toFixed(1)}%) combined with ${plantTemp.toFixed(1)}°C creates a prime humid microclimate for Alternaria spore germination.`,
      iotTriggerText: lang === 'gu'
        ? `હવામાં ભેજ (${humidity.toFixed(1)}% > 65% જોખમ રેન્જ)`
        : lang === 'hi'
        ? `हवा में नमी (${humidity.toFixed(1)}% > 65% जोखिम स्तर)`
        : `Air Humidity (${humidity.toFixed(1)}% > 65% threshold)`,
      prevention: lang === 'gu'
        ? [
            'પાણી હંમેશા માત્ર મૂળમાં જ આપો — પાંદડા પર પાણી છાંટવાનું સદંતર ટાળો.',
            'છોડના તળિયાના 15 સે.મી. સુધીના નીચેના જૂના પાંદડા કાપી નાખો જેથી હવા-ઉજાસ રહે અને માટીના છાંટા ન ઉડે.',
            'દર 10 દિવસે સવારે ઓર્ગેનિક લીમડાનું તેલ (Neem Oil 5ml/L) અથવા બેકિંગ સોડા (3g/L) નો સાવચેતીરૂપ છંટકાવ કરો.'
          ]
        : lang === 'hi'
        ? [
            'पानी हमेशा केवल जड़ों में ड्रिप से दें — पत्तियों पर पानी छिड़कने से बचें।',
            'पौधे के निचले 15 सेमी तक की पुरानी पत्तियों की छंटाई करें ताकि हवा का आवागमन बना रहे।',
            'हर 10 दिन में सुबह ऑर्गेनिक नीम का तेल (5ml/L) या बेकिंग सोडा (3g/L) का बचाव स्प्रे करें।'
          ]
        : [
            'Strictly apply water to root base via drip; never wet foliage or splash potting soil onto stems.',
            'Prune off bottom 15–20 cm of lower foliage to maximize airflow and prevent soilborne splashback.',
            'Apply preventative organic cold-pressed Neem oil (5ml/L) or baking soda spray (3g/L) every 10–14 days in early morning.'
          ],
      cureTip: lang === 'gu'
        ? 'પીળા કે કાળા ગોળ ચકામાવાળા પાંદડા કાપીને કચરાપેટીમાં નાખી દો (ખાતરમાં ન નાખશો), અને ટ્રાઈકોડર્મા કે ઓર્ગેનિક ફૂગનાશકનો છંટકાવ કરો.'
        : lang === 'hi'
        ? 'काले छल्लेदार धब्बों वाली पत्तियों को काटकर फेंक दें (कम्पोस्ट में न डालें), और ट्राइकोडर्मा या जैविक फफूंदनाशक का स्प्रे करें।'
        : 'Immediately snip and bag infected lower leaves with concentric spots (do not compost); spray organic bio-fungicide (Trichoderma or Copper).'
    });
  }

  // 3. Root Rot & Soil Hypoxia (મૂળનો સડો અને ઓક્સિજનની ખામી / जड़ गलन)
  // Triggered by moisture > 70% or overwatering
  if (moisture >= 70) {
    const riskLevel = moisture >= 78 ? 'High' : 'Medium';
    const riskScore = moisture >= 78 ? 86 : 62;
    predictions.push({
      id: 'root_rot',
      name: lang === 'gu'
        ? 'મૂળનો સડો અને ઓક્સિજન અવરોધ (Root Rot & Hypoxia)'
        : lang === 'hi'
        ? 'जड़ गलन और ऑक्सीजन अवरोध (Root Rot & Hypoxia)'
        : 'Root Rot & Soil Hypoxia (Pythium / Anaerobic Suffocation)',
      riskLevel,
      riskScore,
      statusLabel: lang === 'gu' ? (riskLevel === 'High' ? 'જળબંબાકાર ચેતવણી' : 'વધુ પડતો ભેજ') : lang === 'hi' ? (riskLevel === 'High' ? 'अति-नमी चेतावनी' : 'अधिक नमी') : (riskLevel === 'High' ? 'Over-Saturation Alert' : 'Moisture Excess'),
      triggerReason: lang === 'gu'
        ? `જમીનમાં વધુ પડતો ભેજ (${moisture.toFixed(1)}%) છે, જેનાથી માટીમાંથી ઓક્સિજન ખલાસ થઈ મૂળ સડવા લાગે છે.`
        : lang === 'hi'
        ? `मिट्टी में अत्यधिक नमी (${moisture.toFixed(1)}%) है, जिससे जड़ों को ऑक्सीजन नहीं मिलती और जड़ सड़न शुरू हो जाती है।`
        : `Root zone saturation (${moisture.toFixed(1)}%) displaces air pockets, suffocating feeder roots in anaerobic conditions.`,
      iotTriggerText: lang === 'gu'
        ? `જમીનનો ભેજ (${moisture.toFixed(1)}% > 70% મહત્તમ)`
        : lang === 'hi'
        ? `मिट्टी की नमी (${moisture.toFixed(1)}% > 70% अधिकतम)`
        : `Soil Saturation (${moisture.toFixed(1)}% > 70% ceiling)`,
      prevention: lang === 'gu'
        ? [
            'સિંચાઈ તુરંત રોકી દો અને માટી ઉપરથી 1 ઇંચ સુકાય ત્યાં સુધી પાણી ન આપો.',
            'કૂંડાના તળિયાના ડ્રેનેજ હોલ તપાસો અને તળીયાની પ્લેટમાં ભરાયેલું વધારાનું પાણી ફેંકી દો.',
            'કૂંડાની ઉપરની માટીને નાની ખુરપીથી હળવેથી ઢીલી કરો જેથી હવા અંદર ઉતરે.'
          ]
        : lang === 'hi'
        ? [
            'सिंचाई तुरंत रोकें और ऊपरी 1 इंच मिट्टी सूखने तक पानी न दें।',
            'गमले के ड्रेनेज छेद की जांच करें और ड्रेन ट्रे से रुका हुआ पानी तुरंत निकालें।',
            'गमले की ऊपरी मिट्टी की हल्की गुड़ाई करें ताकि जड़ों तक हवा पहुंच सके।'
          ]
        : [
            'Pause all irrigation immediately until top 2 cm of potting mix is dry to the touch.',
            'Ensure container bottom drainage holes are unobstructed and empty standing water from saucer.',
            'Gently aerate top 1 inch of soil with a hand trowel to introduce atmospheric oxygen.'
          ],
      cureTip: lang === 'gu'
        ? 'જો છોડ ઢીલો પડી જાય, તો માટીમાં ટ્રાઈકોડર્મા (Trichoderma viride) 5 ગ્રામ ઓગાળીને રેડો જેથી હાનિકારક ફૂગ નાશ પામે.'
        : lang === 'hi'
        ? 'यदि पौधा मुरझाए, तो मिट्टी में ट्राइकोडर्मा (5 ग्राम/लीटर) का घोल डालें ताकि सड़न पैदा करने वाले जीवाणु खत्म हों।'
        : 'If wilting persists despite wet soil, drench root zone with bio-fungicide (Trichoderma viride) or 3% hydrogen peroxide (diluted 1:10).'
    });
  }

  // 4. Heat Induced Flower Drop & Sunscald (તાપમાનથી ફૂલ ખરી પડવા / अत्यधिक गर्मी से फूल झड़ना)
  // Triggered by temp >= 35°C or strong sun
  if (outsideTemp >= 35 || plantTemp >= 35 || (plantTemp >= 32 && lightLux > 18000)) {
    const riskLevel = outsideTemp >= 37 ? 'High' : 'Medium';
    const riskScore = outsideTemp >= 37 ? 84 : 62;
    predictions.push({
      id: 'heat_flower_drop',
      name: lang === 'gu'
        ? 'ગરમીથી ફૂલ ખરી પડવા અને ફળ બળવું (Heat Stress & Blossom Drop)'
        : lang === 'hi'
        ? 'तेज धूप से फूल झड़ना व फल झुलसना (Heat Stress & Blossom Drop)'
        : 'High Heat Flower Drop & Fruit Sunscald',
      riskLevel,
      riskScore,
      statusLabel: lang === 'gu' ? (riskLevel === 'High' ? 'તીવ્ર લૂ/તાપમાન જોખમ' : 'મધ્યમ ગરમી તણાવ') : lang === 'hi' ? (riskLevel === 'High' ? 'अत्यधिक गर्मी चेतावनी' : 'मध्यम ताप तनाव') : (riskLevel === 'High' ? 'Severe Thermal Risk' : 'Moderate Heat Stress'),
      triggerReason: lang === 'gu'
        ? `બપોરનું તાપમાન ${outsideTemp}°C છે. 35°C થી વધુ તાપમાને ટામેટાના પરાગરજ (Pollen) સુકાઈ જતાં ફૂલ ફળમાં ફેરવાયા વગર ખરી પડે છે.`
        : lang === 'hi'
        ? `दोपहर का तापमान ${outsideTemp}°C है। 35°C से अधिक तापमान पर परागकण सूखने से फूल बिना फल बने गिर जाते हैं।`
        : `Ambient temp (${outsideTemp}°C) exceeds 35°C, causing pollen desiccation and blossom drop before fruit setting.`,
      iotTriggerText: lang === 'gu'
        ? `તાપમાન (${outsideTemp}°C > 35°C થ્રેશોલ્ડ)`
        : lang === 'hi'
        ? `तापमान (${outsideTemp}°C > 35°C सीमा)`
        : `Air Temp (${outsideTemp}°C > 35°C threshold)`,
      prevention: lang === 'gu'
        ? [
            'બાલ્કનીમાં 50% ગ્રીન શેડ નેટ લગાવો જેથી બપોરનો તીવ્ર તડકો છોડને ન દાઝે.',
            'ક્યારેય બપોરે પાણી ન આપો; સિંચાઈ માત્ર સાંજે 6:30 પછી અથવા વહેલી સવારે કરો.',
            'છોડની આસપાસની ફ્લોરિંગ પર પાણી છાંટી ઠંડક જાળવો (છોડના ફૂલ પર પાણી ન છાંટવું).'
          ]
        : lang === 'hi'
        ? [
            'बालकनी में 50% ग्रीन शेड नेट लगाएं ताकि दोपहर की सीधी धूप से बचाव हो।',
            'दोपहर में कभी पानी न दें; सिंचाई केवल शाम 6:30 के बाद या सुबह करें।',
            'गमले के आसपास के फर्श पर पानी छिड़ककर ठंडक बनाए रखें।'
          ]
        : [
            'Erect 50% green agro-shade netting to filter fierce midday UV radiation.',
            'Avoid midday irrigation (prevents root scalding); water post 6:30 PM or pre-dawn.',
            'Keep ambient balcony floor humidified by misting surrounding walls/flooring.'
          ],
      cureTip: lang === 'gu'
        ? 'સવારે 7 થી 9 વાગ્યા વચ્ચે ફૂલની ડાળીઓને હળવેથી હલાવો જેથી કુદરતી પરાગનયન (Pollination) સરળતાથી થઈ જાય.'
        : lang === 'hi'
        ? 'सुबह 7 से 9 बजे के बीच फूलों के गुच्छों को हल्के से हिलाएं ताकि परागण (Pollination) ठीक से हो सके।'
        : 'Gently vibrate flower trusses between 7–9 AM to assist vibration-based self-pollination before peak daily heat.'
    });
  }

  // 5. Fruit Splitting / Cracking (ફળ ફાટવાનું જોખમ / फलों का फटना)
  // Triggered by dry soil + sudden rain forecast or uneven irrigation
  if ((moisture < 45 && rainChance >= 50) || (moisture < 35 && outsideTemp >= 32)) {
    predictions.push({
      id: 'fruit_splitting',
      name: lang === 'gu'
        ? 'ફળ ફાટવું અને તિરાડો પડવી (Fruit Cracking & Splitting)'
        : lang === 'hi'
        ? 'फलों का फटना व दरारें (Fruit Splitting / Cracking)'
        : 'Fruit Cracking & Splitting (Osmotic Shock)',
      riskLevel: 'Medium',
      riskScore: 58,
      statusLabel: lang === 'gu' ? 'મધ્યમ જોખમ' : lang === 'hi' ? 'मध्यम जोखिम' : 'Moderate Threat',
      triggerReason: lang === 'gu'
        ? `સૂકી જમીન (${moisture.toFixed(1)}%) પછી અચાનક વધુ પાણી કે વરસાદ (${rainChance}%) થી ટામેટાની છાલ ફાટી જઈ શકે છે.`
        : lang === 'hi'
        ? `सूखी मिट्टी (${moisture.toFixed(1)}%) के बाद अचानक अधिक पानी या बारिश (${rainChance}%) से फल की त्वचा फट सकती है।`
        : `Dry soil (${moisture.toFixed(1)}%) followed by rapid water influx (${rainChance}% rain) causes pulp expansion faster than skin elasticity.`,
      iotTriggerText: lang === 'gu'
        ? `ભેજ અને વરસાદની વિસંગતતા (${moisture.toFixed(1)}% / ${rainChance}% rain)`
        : lang === 'hi'
        ? `नमी व बारिश का अंतर (${moisture.toFixed(1)}% / ${rainChance}% rain)`
        : `Moisture & Rain Imbalance (${moisture.toFixed(1)}% / ${rainChance}% rain)`,
      prevention: lang === 'gu'
        ? [
            'એકસાથે વધુ પાણી આપવાને બદલે ધીમી ડ્રિપ પદ્ધતિથી નિયમિત હળવું પાણી આપો.',
            'પાકવા આવેલા લાલ-ગુલાબી ટામેટાં વરસાદ પહેલાં જ ઉતારી લો.',
            'માટીમાં કાર્બનિક મલ્ચનું સ્તર રાખો જેથી પાણી અચાનક અંદર ન ઘૂસી જાય.'
          ]
        : lang === 'hi'
        ? [
            'एक साथ ज्यादा पानी देने के बजाय धीमी ड्रिप से नियमित हल्का पानी दें।',
            'पकने वाले लाल-गुलाबी टमाटर बारिश आने से पहले ही तोड़ लें।',
            'मिट्टी पर मल्चिंग रखें ताकि नमी का स्तर अचानक न बदले।'
          ]
        : [
            'Administer measured, steady micro-drips instead of sudden large deluge waterings.',
            'Harvest mature pink/blushing tomatoes early to finish ripening safely on kitchen counter before rain.',
            'Maintain a thick mulch shield to buffer against sudden downpours.'
          ],
      cureTip: lang === 'gu'
        ? 'તિરાડ પડેલા ટામેટાં તાત્કાલિક ઉતારીને રસોઈમાં વાપરી લો જેથી તેમાં કીડા કે ફૂગ ન બેસે.'
        : lang === 'hi'
        ? 'फटे हुए टमाटर तुरंत तोड़कर उपयोग करें ताकि उनमें फफूंद या कीड़े न लगें।'
        : 'Immediately harvest any cracked fruit for immediate culinary use before fungal rot or vinegar flies colonize wounds.'
    });
  }

  // 6. If no high risks are detected, provide baseline preventative health prediction
  if (predictions.length === 0) {
    predictions.push({
      id: 'healthy_optimal',
      name: lang === 'gu'
        ? 'શ્રેષ્ઠ પાક સ્થિતિ (સક્રિય રોગ જોખમ મુક્ત)'
        : lang === 'hi'
        ? 'उत्तम फसल स्थिति (सक्रिय रोग मुक्त)'
        : 'Optimal Crop Conditions (Disease Free Zone)',
      riskLevel: 'Low',
      riskScore: 15,
      statusLabel: lang === 'gu' ? 'સ્વસ્થ / નિમ્ન જોખમ' : lang === 'hi' ? 'स्वस्थ / कम जोखिम' : 'Healthy / Low Risk',
      triggerReason: lang === 'gu'
        ? `બધા IoT સેન્સર પરિમાણો (ભેજ ${moisture.toFixed(1)}%, તાપમાન ${plantTemp.toFixed(1)}°C, હવામાં ભેજ ${humidity.toFixed(1)}%) શ્રેષ્ઠ મર્યાદામાં છે.`
        : lang === 'hi'
        ? `सभी IoT सेंसर पैरामीटर (नमी ${moisture.toFixed(1)}%, तापमान ${plantTemp.toFixed(1)}°C, हवा नमी ${humidity.toFixed(1)}%) इष्टतम सीमा में हैं।`
        : `All IoT parameters (Moisture ${moisture.toFixed(1)}%, Temp ${plantTemp.toFixed(1)}°C, Humidity ${humidity.toFixed(1)}%) are within the ideal horticultural sweet spot.`,
      iotTriggerText: lang === 'gu'
        ? `બધા સેન્સર્સ સંતુલિત છે`
        : lang === 'hi'
        ? `सभी सेंसर संतुलित हैं`
        : `All Telemetry Balanced`,
      prevention: lang === 'gu'
        ? [
            '“નિવારણ એ ઉપચાર કરતાં શ્રેષ્ઠ છે” — હાલનું ડ્રિપ શેડ્યૂલ યથાવત રાખો.',
            'દર અઠવાડિયે પાંદડાની નીચે અને ડાળીઓની કાળજીપૂર્વક તપાસ કરતા રહો.',
            'છોડની આસપાસ ગલગોટા (Marigold) કે તુલસી વાવો જે કુદરતી કીટક નિયંત્રક તરીકે કામ કરે છે.'
          ]
        : lang === 'hi'
        ? [
            '“इलाज से रोकथाम बेहतर है” — वर्तमान ड्रिप शेड्यूल बनाए रखें।',
            'हर हफ्ते पत्तियों के नीचे और शाखाओं का नियमित निरीक्षण करते रहें।',
            'पौधे के पास गेंदा (Marigold) या तुलसी लगाएं जो कीटों को प्राकृतिक रूप से दूर रखते हैं।'
          ]
        : [
            '“Prevention is better than cure” — maintain consistent automated drip schedule.',
            'Inspect underside of leaves weekly for early signs of spider mites or aphid clusters.',
            'Interplant companion marigold or basil to naturally deter pests and enhance tomato resilience.'
          ],
      cureTip: lang === 'gu'
        ? 'પાંદડા હંમેશા સ્વચ્છ રાખો અને જરૂરિયાત મુજબ ઓર્ગેનિક વર્મીવોશ કે સીવીડ લિક્વિડનું પોષણ આપો.'
        : lang === 'hi'
        ? 'पत्तियों को साफ रखें और जरूरत अनुसार जैविक वर्मीवॉश या समुद्री शैवाल तरल का पोषण दें।'
        : 'Keep foliage clean and supply monthly balanced seaweed liquid extract / vermicompost tea for sustained disease immunity.'
    });
  }

  return predictions;
}

/**
 * P0 Unified AI Agronomy Decision Engine
 * Accepts live sensorData, weather, forecast, and language
 */
async function getAiAdvice(reqData = {}) {
  const {
    sensorData = {},
    weather = {},
    forecast = null,
    cropStage = 'Flowering & Fruit-Set',
    language = 'gu'
  } = reqData;

  let lang = 'gu';
  if (language) {
    const l = String(language).toLowerCase();
    if (l.startsWith('hi')) lang = 'hi';
    else if (l.startsWith('en')) lang = 'en';
    else if (l.startsWith('gu')) lang = 'gu';
    else if (['mr', 'ta', 'te', 'bn', 'kn', 'pa'].includes(l.substring(0, 2))) lang = l.substring(0, 2);
  }

  const moisture = Number(sensorData.soilMoisture ?? 40.6);
  const plantTemp = Number(sensorData.temperature ?? 29.7);
  const humidity = Number(sensorData.humidity ?? 46.4);
  const outsideTemp = Math.round(weather?.main?.temp || 36);
  const windSpeedKmh = Number(((weather?.wind?.speed || 0.93) * 3.6).toFixed(1));
  const rainChance = Number(forecast?.list?.[0]?.pop ? Math.round(forecast.list[0].pop * 100) : 10);

  const now = new Date();
  const currentHour = now.getHours();

  // Cache key based on rounded metrics to save requests
  const cacheKey = `${lang}_${Math.round(moisture)}_${Math.round(plantTemp)}_${Math.round(outsideTemp)}_${currentHour}`;
  const cached = adviceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }

  // Determine agronomic conditions
  const isExtremeHeat = outsideTemp >= 35 || plantTemp >= 35;
  const isRainHigh = rainChance >= 60;
  const isOptimal = moisture >= 55 && moisture <= 70;
  const isWet = moisture > 70;
  const isDry = moisture < 48;

  let recMl = 0;
  let headline = '';
  let bestTimeStr = '';
  let nextHours = 0;

  if (isRainHigh) {
    recMl = 0;
    headline = lang === 'gu' ? 'આજે પાણી આપવાની જરૂર નથી' : lang === 'hi' ? 'आज पानी देने की आवश्यकता नहीं है' : 'No Water Needed Today';
    bestTimeStr = lang === 'gu' ? 'વરસાદની આગાહી' : lang === 'hi' ? 'बारिश का अनुमान' : 'Rain Expected';
    nextHours = 24;
  } else if (isOptimal || isWet) {
    recMl = 0;
    headline = lang === 'gu' ? 'આજે પાણી આપવાની જરૂર નથી' : lang === 'hi' ? 'आज पानी देने की आवश्यकता नहीं है' : 'No Water Needed Today';
    bestTimeStr = lang === 'gu' ? 'ભેજ પૂરતો છે' : lang === 'hi' ? 'नमी पर्याप्त है' : 'Moisture Optimal';
    nextHours = isOptimal ? 12 : 24;
  } else if (isExtremeHeat) {
    recMl = 250;
    headline = lang === 'gu' ? '250 મિ.લિ. સાંજે 6:30 પછી આપો' : lang === 'hi' ? '250 मि.ली. शाम 6:30 के बाद दें' : 'Dispense 250 ml in Evening';
    bestTimeStr = lang === 'gu' ? 'આજે સાંજે 6:30' : lang === 'hi' ? 'आज शाम 6:30' : 'Today 6:30 PM';
    if (currentHour >= 18 && currentHour <= 21) {
      nextHours = 0;
    } else if (currentHour > 21) {
      nextHours = 10;
    } else {
      nextHours = Math.max(1, 18 - currentHour);
    }
  } else {
    recMl = 250;
    headline = lang === 'gu' ? `${recMl} મિ.લિ. પાણી આપો` : lang === 'hi' ? `${recMl} मि.ली. पानी दें` : `Water now: ${recMl} ml`;
    bestTimeStr = currentHour < 12 
      ? (lang === 'gu' ? 'આજે સવારે' : lang === 'hi' ? 'आज सुबह' : 'This Morning') 
      : (lang === 'gu' ? 'આજે સાંજે 6:30' : lang === 'hi' ? 'आज शाम 6:30' : 'Evening 6:30 PM');
    nextHours = currentHour < 12 ? 0 : Math.max(1, 18 - currentHour);
  }

  const heatStress = isExtremeHeat ? 'High' : outsideTemp > 30 ? 'Medium' : 'Low';
  const waterStress = moisture < 35 ? 'High' : moisture < 48 ? 'Medium' : 'Low';
  const healthScore = Math.max(65, Math.min(96, Math.round(100 - (heatStress === 'High' ? 14 : heatStress === 'Medium' ? 6 : 0) - (waterStress === 'High' ? 16 : waterStress === 'Medium' ? 6 : 0))));

  const dayNamesGu = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
  const dayNamesHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const defaultSchedule = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayIdx = d.getDay();
    const dateStr = d.toISOString().split('T')[0];
    const isLiveForecast = i < 3;

    const dayName = i === 0 
      ? (lang === 'gu' ? 'આજે' : lang === 'hi' ? 'आज' : 'Today')
      : (lang === 'gu' ? dayNamesGu[dayIdx] : lang === 'hi' ? dayNamesHi[dayIdx] : dayNamesEn[dayIdx]);

    let amt = '0 ml';
    let rsn = '';
    if (i === 0) {
      amt = `${recMl} ml`;
      rsn = lang === 'gu' 
        ? `જમીનમાં ભેજ ${moisture.toFixed(1)}% છે. ${bestTimeStr} આપવાથી બાષ્પીભવન ઓછું થશે.`
        : lang === 'hi'
        ? `मिट्टी में नमी ${moisture.toFixed(1)}% है। ${bestTimeStr} पानी देने से वाष्पीकरण कम होगा।`
        : `Soil moisture is ${moisture.toFixed(1)}%. Evening watering avoids heat evaporation.`;
    } else if (i === 1) {
      amt = '0 ml';
      rsn = lang === 'gu' ? 'મૂળના શ્વસન અને ઓક્સિજન માટે આરામનો દિવસ.' : lang === 'hi' ? 'जड़ों के श्वसन और आराम का दिन।' : 'Rest day for root oxygenation. Moisture retained.';
    } else if (i === 2) {
      amt = '250 ml';
      rsn = lang === 'gu' ? 'ફૂલ અને ફળ ધારણ માટે કેલ્શિયમ પોષણ ડ્રિપ.' : lang === 'hi' ? 'फूल व फल लगने के लिए कैल्शियम पोषण ड्रिप।' : 'Flowering and fruit-set calcium feed drip.';
    } else if (i === 3) {
      amt = '0 ml';
      rsn = lang === 'gu' ? 'અંદાજિત શેડ્યૂલ: જમીનમાં પૂરતો ભેજ સંગ્રહાયેલ છે.' : lang === 'hi' ? 'अनुमानित शेड्यूल: मिट्टी में पर्याप्त नमी उपलब्ध।' : 'Agronomic estimate: Optimal moisture buffer.';
    } else if (i === 4) {
      amt = '200 ml';
      rsn = lang === 'gu' ? 'અંદાજિત શેડ્યૂલ: સામાન્ય જાળવણી માટે હળવું પાણી.' : lang === 'hi' ? 'अनुमानित शेड्यूल: हल्की सिंचाई।' : 'Agronomic estimate: Light hydration maintenance.';
    } else {
      amt = i % 2 === 0 ? '200 ml' : '0 ml';
      rsn = lang === 'gu' ? 'અંદાજિત શેડ્યૂલ: સાપ્તાહિક ચક્ર.' : lang === 'hi' ? 'अनुमानित शेड्यूल: साप्ताहिक चक्र।' : 'Agronomic estimate: Weekly cycle.';
    }

    defaultSchedule.push({
      dayIndex: i,
      date: dateStr,
      dayLabel: dayName,
      amount: amt,
      timeOfDay: bestTimeStr,
      isLiveForecast,
      reason: rsn
    });
  }

  // Pre-calculate IoT disease predictions
  const predictedDiseases = predictDiseaseRisks(sensorData, weather, forecast, lang);

  const defaultAdvice = {
    headlineText: headline,
    recommendation_ml: recMl,
    best_time: bestTimeStr,
    next_watering_hours: nextHours,
    stress: { heat: heatStress, water: waterStress },
    plant_health_score: healthScore,
    explanation: lang === 'gu'
      ? (isDry ? `બપોરે ${outsideTemp}°C ગરમી છે, તેથી પાણી સાંજે 6:30 પછી આપો જેથી બાષ્પીભવન ન થાય અને કેલ્શિયમ યોગ્ય રીતે મળે.` : 'જમીનમાં ભેજનું પ્રમાણ શ્રેષ્ઠ છે, તેથી આજે વધારાના પાણીની જરૂર નથી.')
      : lang === 'hi'
      ? (isDry ? `दोपहर में ${outsideTemp}°C तेज धूप है, इसलिए पानी शाम 6:30 के बाद दें ताकि वाष्पीकरण न हो और कैल्शियम अवशोषण सही रहे।` : 'मिट्टी में नमी का स्तर उत्तम है, आज अतिरिक्त पानी की आवश्यकता नहीं है।')
      : (isDry ? `Peak midday heat (${outsideTemp}°C). Delay irrigation until 6:30 PM to avoid rapid evaporation and ensure calcium absorption.` : 'Soil moisture is in the optimal range. No watering needed today.'),
    tips: lang === 'gu'
      ? [
          'કેલ્શિયમ સંતુલન (Blossom End Rot બચાવ): જમીનમાં 50-70% સમાન ભેજ રાખવાથી ટામેટાના તળિયા કાળા પડી સડતા અટકે છે.',
          'ગરમીથી રક્ષણ: તાપમાન 35°C થી વધતાં ફૂલ ખરી જવાની સંભાવના રહે છે. ગ્રીન શેડ નેટ અને પાંદડાનું મલ્ચિંગ વાપરો.'
        ]
      : lang === 'hi'
      ? [
          'कैल्शियम संतुलन (Blossom End Rot बचाव): मिट्टी में 50-70% एकसमान नमी बनाए रखने से टमाटर नीचे से सड़ने से बचते हैं।',
          'गर्मी से सुरक्षा: तापमान 35°C से ऊपर जाने पर फूल झड़ने लगते हैं। ग्रीन शेड नेट और मल्चिंग का उपयोग करें।'
        ]
      : [
          'Blossom End Rot Prevention: Steady 50–70% moisture ensures steady calcium uptake and prevents fruit rot.',
          'Heatwave Defense: Flowers drop above 35°C. Use green shade net and organic mulch.'
        ],
    weatherAlert: lang === 'gu'
      ? `તીવ્ર ગરમી (${outsideTemp}°C) — બપોરે પાણી ન આપો. સાંજે 6:30 પછી આપો.`
      : lang === 'hi'
      ? `तेज गर्मी (${outsideTemp}°C) — दोपहर में पानी न दें। शाम 6:30 के बाद दें।`
      : `Extreme Heat (${outsideTemp}°C) — Avoid midday irrigation. Water in the evening after 6:30 PM.`,
    schedule: defaultSchedule,
    predictedDiseases
  };

  // Check if API key is present and not currently in rate-limit cooldown
  if (!aiConfig.gemini.apiKey || Date.now() < geminiCooldownUntil) {
    adviceCache.set(cacheKey, { timestamp: Date.now(), data: defaultAdvice });
    return defaultAdvice;
  }

  const candidateModels = [
    aiConfig.gemini?.model,
    'gemini-1.5-flash',
    'gemini-2.0-flash'
  ].filter(Boolean);

  const prompt = `
You are an expert Agronomist and precision IoT irrigation & crop disease diagnostic AI.
Respond ONLY with a valid JSON object matching the requested schema.

LANGUAGE REQUIREMENT:
The user selected language code "${lang}" (${lang === 'gu' ? 'GUJARATI' : lang === 'hi' ? 'HINDI' : 'ENGLISH'}).
You MUST write all textual fields ("headlineText", "best_time", "explanation", "tips", "weatherAlert", "schedule[].dayLabel", "schedule[].reason", "predictedDiseases[].name", "predictedDiseases[].triggerReason", "predictedDiseases[].iotTriggerText", "predictedDiseases[].prevention", "predictedDiseases[].cureTip") STRICTLY in fluent, natural ${lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English'}.
Use standard digits (e.g. 250 ml).

Plant & Telemetry:
- Crop: Tomato (${cropStage})
- Root Soil Moisture: ${moisture}% (Optimal target band: 50% - 70%)
- Temperature at plant: ${plantTemp}°C
- Air Humidity at plant: ${humidity}%
- Outside Weather: ${outsideTemp}°C, Humidity: ${humidity}%, Wind: ${windSpeedKmh} km/h, Rain Chance: ${rainChance}%
- Current Clock Hour: ${currentHour}:00

Agronomic & Disease Prediction Rules:
1. Predict potential diseases that could occur based on current IoT telemetry (e.g., Blossom End Rot if moisture < 48% or temp > 33°C, Early Blight if humidity > 65%, Root Rot if moisture > 70%, Flower Drop if temp > 35°C, Fruit Splitting if dry soil + rain).
2. "Prevention is better than cure": Provide concrete preventative steps (irrigation adjustments, organic neem spray, pruning lower leaves, calcium feed, mulching, green shade net) and resolution cure tips.
3. If ambient temp is high (>= 35°C), heat stress is High. Recommend evening irrigation after 6:30 PM.
4. If soil moisture >= 55% or rain chance >= 60%, recommendation_ml MUST be 0 (Rest day).

JSON Schema:
{
  "headlineText": "string",
  "recommendation_ml": number,
  "best_time": "string",
  "next_watering_hours": number,
  "stress": {
    "heat": "Low" | "Medium" | "High",
    "water": "Low" | "Medium" | "High"
  },
  "plant_health_score": number,
  "explanation": "string",
  "tips": ["string", "string"],
  "weatherAlert": "string",
  "predictedDiseases": [
    {
      "id": "string",
      "name": "string",
      "riskLevel": "Low" | "Medium" | "High",
      "riskScore": number,
      "statusLabel": "string",
      "triggerReason": "string",
      "iotTriggerText": "string",
      "prevention": ["string", "string", "string"],
      "cureTip": "string"
    }
  ],
  "schedule": [
    {
      "dayIndex": number,
      "date": "YYYY-MM-DD",
      "dayLabel": "string",
      "amount": "string",
      "timeOfDay": "string",
      "isLiveForecast": boolean,
      "reason": "string"
    }
  ]
}
`;

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.gemini.apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2500,
            topK: 40,
            topP: 0.95,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 12000,
        }
      );

      const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let jsonStr = textResponse.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.headlineText && parsed.explanation) {
          const finalSchedule = (parsed.schedule && parsed.schedule.length >= 7) ? parsed.schedule : defaultSchedule;
          const finalDiseases = (parsed.predictedDiseases && Array.isArray(parsed.predictedDiseases) && parsed.predictedDiseases.length > 0)
            ? parsed.predictedDiseases
            : predictedDiseases;

          const adviceResult = {
            ...defaultAdvice,
            ...parsed,
            schedule: finalSchedule,
            predictedDiseases: finalDiseases
          };
          adviceCache.set(cacheKey, { timestamp: Date.now(), data: adviceResult });
          return adviceResult;
        }
      }
    } catch (err) {
      if (err.response?.status === 429) {
        geminiCooldownUntil = Date.now() + 180000;
        console.warn(`Gemini rate-limited (429). Setting 3-minute cooldown and serving agronomic engine.`);
        break; // Stop looping through other models on the same rate-limited key
      }
      // Continue to next model if not 429
    }
  }

  adviceCache.set(cacheKey, { timestamp: Date.now(), data: defaultAdvice });
  return defaultAdvice;
}

module.exports = { generateSchedule, getAiAdvice, predictDiseaseRisks };