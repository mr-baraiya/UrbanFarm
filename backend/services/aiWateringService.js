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
    schedule: defaultSchedule
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
You are an expert Agronomist and precision IoT irrigation engine for Indian farmers.
Respond ONLY with a valid JSON object matching the requested schema.

LANGUAGE REQUIREMENT:
The user selected language code "${lang}" (${lang === 'gu' ? 'GUJARATI' : lang === 'hi' ? 'HINDI' : 'ENGLISH'}).
You MUST write all textual fields ("headlineText", "best_time", "explanation", "tips", "weatherAlert", "schedule[].dayLabel", "schedule[].reason") STRICTLY in fluent, natural ${lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English'}.
Use standard digits (e.g. 250 ml).

Plant & Telemetry:
- Crop: Tomato (${cropStage})
- Root Soil Moisture: ${moisture}% (Optimal target band: 50% - 70%)
- Temperature at plant: ${plantTemp}°C
- Air Humidity at plant: ${humidity}%
- Outside Weather: ${outsideTemp}°C, Humidity: ${humidity}%, Wind: ${windSpeedKmh} km/h, Rain Chance: ${rainChance}%
- Current Clock Hour: ${currentHour}:00

Agronomic Rules:
1. When ambient temp is high (>= 35°C) during flowering/fruiting, heat stress is High. Midday watering causes water scalding & fast evaporation. Recommend evening irrigation after 6:30 PM (or pre-dawn before 9 AM) to prevent blossom drop & calcium deficiency.
2. If soil moisture >= 55% or rain chance >= 60%, recommendation_ml MUST be 0 (Rest day).
3. If soil moisture < 48%, recommend 200ml to 250ml.
4. Provide 2 concise actionable tips: (1) Blossom end rot / calcium regulation, (2) Heatwave shade net or mulching.
5. Provide a 7-day schedule matching the real weather for Days 1–3 and agronomic estimates for Days 4–7.

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
            maxOutputTokens: 2048,
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
          const adviceResult = {
            ...defaultAdvice,
            ...parsed,
            schedule: finalSchedule
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

module.exports = { generateSchedule, getAiAdvice };