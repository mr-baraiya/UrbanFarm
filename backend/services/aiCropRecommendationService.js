const axios = require('axios');
const aiConfig = require('../config/aiConfig');

// Whitelist of valid soil types
const VALID_SOIL_TYPES = [
  'Loam',
  'Sandy',
  'Clay',
  'Silty',
  'Peaty',
  'Chalky',
  'Sandy Loam',
  'Potting Mix'
];

/**
 * Validate agronomic input parameters
 */
function validateCropInputs(inputData) {
  const errors = [];
  const { soilType, ph, temperature, humidity, rainfall, season } = inputData;

  if (!soilType || typeof soilType !== 'string') {
    errors.push('Soil type is required.');
  } else if (!VALID_SOIL_TYPES.some(s => s.toLowerCase() === soilType.trim().toLowerCase())) {
    errors.push(`Invalid soil type "${soilType}". Supported types: ${VALID_SOIL_TYPES.join(', ')}.`);
  }

  const numPh = Number(ph);
  if (ph === undefined || ph === null || isNaN(numPh)) {
    errors.push('Soil pH is required.');
  } else if (numPh < 3.5 || numPh > 9.5) {
    errors.push('Soil pH must be between 3.5 and 9.5.');
  }

  const numTemp = Number(temperature);
  if (temperature !== undefined && temperature !== null && !isNaN(numTemp)) {
    if (numTemp < -20 || numTemp > 60) {
      errors.push('Temperature must be between -20°C and 60°C.');
    }
  }

  const numHum = Number(humidity);
  if (humidity !== undefined && humidity !== null && !isNaN(numHum)) {
    if (numHum < 0 || numHum > 100) {
      errors.push('Humidity must be between 0% and 100%.');
    }
  }

  const numRain = Number(rainfall);
  if (rainfall !== undefined && rainfall !== null && !isNaN(numRain)) {
    if (numRain < 0 || numRain > 5000) {
      errors.push('Rainfall must be between 0mm and 5000mm.');
    }
  }

  const validSeasons = ['Spring', 'Summer', 'Fall', 'Winter'];
  if (season && !validSeasons.some(s => s.toLowerCase() === season.trim().toLowerCase())) {
    errors.push('Season must be Spring, Summer, Fall, or Winter.');
  }

  return errors;
}

// Candidate models for Google Gemini
const getCandidateModels = () => Array.from(new Set([
  aiConfig.gemini?.model,
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-pro-latest'
])).filter(Boolean);

/**
 * Get dynamic crop recommendations strictly generated from real Gemini API
 */
async function getRecommendations(inputData) {
  // 1. Input Validation
  const validationErrors = validateCropInputs(inputData);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(' '));
    err.status = 400;
    err.validationErrors = validationErrors;
    throw err;
  }

  // 2. Check API Key
  const apiKey = aiConfig.gemini.apiKey;
  if (!apiKey) {
    const err = new Error('Google Gemini API key is not configured in the environment.');
    err.status = 500;
    throw err;
  }

  const {
    soilType,
    ph,
    temperature,
    humidity,
    rainfall,
    season,
    region,
    spaceAvailable,
    targetCrop,
    language
  } = inputData;

  const lang = ['gu', 'hi'].includes(language) ? language : 'en';

  let langInstruction = '';
  if (lang === 'gu') {
    langInstruction = `CRITICAL LANGUAGE REQUIREMENT:
The user has selected GUJARATI (ગુજરાતી).
You MUST generate ALL text values in the JSON output STRICTLY in fluent, natural Gujarati (ગુજરાતી script).
- "cropName": Standard Gujarati crop names (e.g., "ચેરી ટામેટા", "શિમલા મરચાં", "વાલ / ચોળી", "મેથી", "તુલસી / ડમરો", "પાલક", "ગાજર", "રીંગણ", "કાકડી", "ફુદીનો"). Do NOT mix English words like "Cherry", "Bush", "Determinate" in crop names; write purely in Gujarati (e.g., "ચેરી ટામેટા").
- "soilSuitability", "reason", "plantingTips", "expectedYield", "drainageAndTexture", "soilManagementTip", "soilMismatchReason", "suggestedAlternatives": Write completely in natural, fluent Gujarati script.
Do NOT output English sentences.`;
  } else if (lang === 'hi') {
    langInstruction = `CRITICAL LANGUAGE REQUIREMENT:
The user has selected HINDI (हिन्दी).
You MUST generate ALL text values in the JSON output STRICTLY in fluent, natural Hindi (Devanagari script).
- "cropName": Standard Hindi crop names (e.g., "चेरी टमाटर", "शिमला मिर्च", "लोबिया / सेम", "मेथी", "तुलसी", "पालक", "गाजर", "बैंगन", "खीरा", "पुदीना").
- "soilSuitability", "reason", "plantingTips", "expectedYield", "drainageAndTexture", "soilManagementTip", "soilMismatchReason", "suggestedAlternatives": Write completely in natural, fluent Hindi (Devanagari script).
Do NOT output English sentences.`;
  } else {
    langInstruction = `Language Requirement: Generate all responses in clear, professional English.`;
  }

  const prompt = `You are a senior agronomist, soil scientist, and urban farming expert.
Evaluate the following exact planting conditions:
- Soil Type: "${soilType}"
- Soil pH: ${ph}
- Ambient Temperature: ${temperature || 25}°C
- Relative Humidity: ${humidity || 60}%
- Rainfall / Water Level: ${rainfall || 100} mm
- Growing Season: "${season || 'Summer'}"
- Region / Climate: "${region || 'Temperate'}"
- Space Available: "${spaceAvailable || 'medium'}"
${targetCrop ? `- Specific Inquired Crop to evaluate: "${targetCrop}"` : ''}

${langInstruction}

AGRONOMIC AND SOIL VALIDATION RULES:
1. The soil type ("${soilType}") and pH (${ph}) MUST strictly govern crop viability:
   - Sandy soil: low nutrient and water holding capacity, warms quickly. Excellent for carrots, radishes, sweet potatoes, thymes, and drought-tolerant crops. Unfavorable for high-demand moisture lovers unless heavily amended.
   - Clay soil: heavy, dense, slow drainage, rich in nutrients. Great for brassicas (cabbage, broccoli), beans, and leafy greens. Poor for long root crops (deformity, rot).
   - Chalky / Alkaline soil (pH > 7.5): Acid lovers like blueberries will fail. Brassicas, beets, spinach, and oregano thrive.
   - Peaty / Acidic soil (pH < 5.5): Blueberries and potatoes thrive; brassicas suffer clubroot and nutrient block.
   - Loam / Potting Mix: Balanced, versatile for garden vegetables.
2. If an Inquired Crop ("${targetCrop || ''}") is provided:
   - Rigorously check if it suits "${soilType}" soil and pH ${ph}.
   - If it is incompatible or poor, set "isSuitable": false, explain why in "soilMismatchReason", and recommend 3 suitable alternative crops for this soil.
   - Never recommend a crop that clashes with this soil.
3. Recommend 4 to 5 crops that specifically match "${soilType}" soil and current conditions.

Return STRICT JSON matching this exact schema:
{
  "soilAnalysis": {
    "soilType": "${soilType}",
    "ph": ${ph},
    "drainageAndTexture": "Summary of physical traits of ${soilType} soil in requested language",
    "soilManagementTip": "Practical advice to optimize this ${soilType} soil in requested language"
  },
  ${targetCrop ? `"targetCropCheck": {
    "cropName": "${targetCrop}",
    "isSuitable": true or false,
    "soilMismatchReason": "Explanation in requested language",
    "suggestedAlternatives": ["Alternative 1", "Alternative 2", "Alternative 3"]
  },` : ''}
  "recommendations": [
    {
      "cropName": "Crop Name in requested language",
      "confidence": 0.90,
      "soilSuitability": "Specific reason why this crop thrives in ${soilType} soil in requested language",
      "reason": "Why it suits the climate/season/space in requested language",
      "plantingTips": "Planting depth, spacing, or care tip in requested language",
      "expectedYield": "Estimated yield per plant or square meter in requested language"
    }
  ]
}

Return ONLY valid JSON with no markdown wrapping.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  };

  const candidateModels = getCandidateModels();
  let rawText = null;
  let lastError = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      console.log(`🌾 Querying Gemini model (${model}) for soil: ${soilType}`);
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000
      });
      rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) break;
    } catch (err) {
      lastError = err;
      console.warn(`[Crop AI] Model ${model} failed: ${err.message}`);
    }
  }

  if (!rawText) {
    throw new Error(lastError?.response?.data?.error?.message || lastError?.message || 'Failed to generate recommendations from Gemini AI.');
  }

  try {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    const parsed = JSON.parse(clean);

    let recList = [];
    if (Array.isArray(parsed)) {
      recList = parsed;
    } else if (Array.isArray(parsed.recommendations)) {
      recList = parsed.recommendations;
    } else {
      for (const k of Object.keys(parsed)) {
        if (Array.isArray(parsed[k])) {
          recList = parsed[k];
          break;
        }
      }
    }

    if (!recList || recList.length === 0) {
      throw new Error('No crop recommendations returned in AI response.');
    }

    // Validate crop items
    const validatedRecs = recList.map(item => ({
      cropName: String(item.cropName || 'Crop').trim(),
      confidence: typeof item.confidence === 'number' ? Math.min(Math.max(item.confidence, 0), 1) : 0.85,
      soilSuitability: String(item.soilSuitability || `Suitable for ${soilType} soil condition.`).trim(),
      reason: String(item.reason || `Well suited for ${season || 'current season'}.`).trim(),
      plantingTips: String(item.plantingTips || 'Ensure adequate water and sunlight.').trim(),
      expectedYield: String(item.expectedYield || 'Optimal yield').trim()
    }));

    return {
      soilAnalysis: parsed.soilAnalysis || {
        soilType: soilType,
        ph: ph,
        drainageAndTexture: `${soilType} soil with pH ${ph}`,
        soilManagementTip: 'Maintain organic mulch and monitor soil moisture.'
      },
      targetCropCheck: parsed.targetCropCheck || null,
      recommendations: validatedRecs
    };
  } catch (parseErr) {
    console.error('Failed to parse Gemini crop JSON:', parseErr.message, rawText);
    throw new Error('Failed to parse crop recommendation response from AI service. Please retry.');
  }
}

module.exports = { 
  getRecommendations, 
  validateCropInputs, 
  VALID_SOIL_TYPES 
};