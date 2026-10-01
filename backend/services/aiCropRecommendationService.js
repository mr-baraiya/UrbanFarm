const axios = require('axios');
const aiConfig = require('../config/aiConfig');

/**
 * Get crop recommendations using Google Gemini API
 */
async function getRecommendations(inputData) {
  const {
    soilType,
    ph,
    temperature,
    humidity,
    rainfall,
    season,
    region,
  } = inputData;

  // Check if Gemini API key exists
  if (!aiConfig.gemini.apiKey) {
    console.warn('⚠️ Gemini API key missing, using fallback recommendations');
    return getFallbackRecommendations();
  }

  const model = aiConfig.gemini.model;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.gemini.apiKey}`;

  const prompt = `
You are an expert agricultural advisor. Based on the following conditions, recommend 5 most suitable crops to grow.

Conditions:
- Soil type: ${soilType || 'Loam'}
- Soil pH: ${ph || 6.5}
- Temperature: ${temperature || 25}°C
- Humidity: ${humidity || 60}%
- Rainfall: ${rainfall || 100} mm
- Season: ${season || 'Summer'}
- Region: ${region || 'Temperate'}

Return a JSON array with exactly 5 objects containing:
- cropName: string
- confidence: number (0-1)
- reason: string
- plantingTips: string
- expectedYield: string

Example: [{"cropName":"Tomato","confidence":0.9,"reason":"Grows well in warm temperatures","plantingTips":"Plant in well-drained soil","expectedYield":"10-15 kg per plant"}]

IMPORTANT: Return ONLY the JSON array, no other text.
`;

  try {
    console.log(`📡 Calling Gemini API (${model}) for crop recommendations`);

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          // ✅ INCREASED TOKEN LIMIT
          maxOutputTokens: 1024, // Increased from 800
          topK: 40,
          topP: 0.95,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('✅ Gemini crop response received');
    console.log('📝 Raw response length:', textResponse.length);

    if (textResponse.length < 50) {
      console.warn('⚠️ Response too short, using fallback');
      return getFallbackRecommendations();
    }

    // Extract JSON from the response
    let jsonStr = textResponse;
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    jsonStr = jsonStr.trim();
    
    if (!jsonStr || jsonStr.length < 10) {
      console.warn('⚠️ Empty JSON response from Gemini, using fallback');
      return getFallbackRecommendations();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        return parsed.recommendations;
      } else {
        const keys = Object.keys(parsed);
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            return parsed[key];
          }
        }
        throw new Error('Unexpected response format');
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse Gemini JSON:', parseError.message);
      
      // Try to fix common JSON issues
      try {
        jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        // Close any open quotes
        const openQuotes = (jsonStr.match(/"/g) || []).length;
        if (openQuotes % 2 !== 0) {
          jsonStr += '"';
        }
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          console.log('✅ Fixed and parsed JSON successfully');
          return parsed;
        }
      } catch (fixError) {
        console.warn('⚠️ Still cannot parse JSON, using fallback');
      }
      
      return getFallbackRecommendations();
    }
  } catch (error) {
    console.error('❌ Gemini Crop Recommendation error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return getFallbackRecommendations();
  }
}

/**
 * Fallback recommendations when API fails
 */
function getFallbackRecommendations() {
  return [
    {
      cropName: 'Tomato',
      confidence: 0.9,
      reason: 'Grows well in warm temperatures with moderate water. High yield in most soil types.',
      plantingTips: 'Plant in well-drained soil, full sun, 60-90 cm apart. Water consistently.',
      expectedYield: '10-15 kg per plant',
    },
    {
      cropName: 'Lettuce',
      confidence: 0.85,
      reason: 'Cool-season crop, fast growing. Great for continuous harvest.',
      plantingTips: 'Plant in partial shade, keep soil moist. Sow every 2 weeks for continuous supply.',
      expectedYield: '2-3 heads per plant',
    },
    {
      cropName: 'Pepper',
      confidence: 0.8,
      reason: 'Heat-loving, productive in warm climates. Both sweet and hot varieties.',
      plantingTips: 'Space plants 45cm apart, consistent watering. Stake for support.',
      expectedYield: '5-8 kg per plant',
    },
    {
      cropName: 'Carrot',
      confidence: 0.75,
      reason: 'Cool-season root vegetable. Grows well in loose, sandy soil.',
      plantingTips: 'Sow directly in loose soil, thin to 5cm apart. Keep soil consistently moist.',
      expectedYield: '3-5 kg per m²',
    },
    {
      cropName: 'Basil',
      confidence: 0.7,
      reason: 'Warm-season herb. Excellent companion plant, continuous harvest.',
      plantingTips: 'Plant in full sun, well-drained soil. Pinch flowers for bushier growth.',
      expectedYield: '1-2 kg per plant per season',
    },
  ];
}

module.exports = { getRecommendations };