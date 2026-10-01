const axios = require('axios');
const aiConfig = require('../config/aiConfig');

/**
 * Generate a watering schedule based on plant type, weather, and soil
 * Uses Google Gemini for intelligent recommendations
 */
async function generateSchedule(plant, weatherData) {
  // 1. Rule-based fallback (works without Gemini API)
  const ruleBasedSchedule = generateRuleBasedSchedule(plant, weatherData);

  // 2. Try to enhance with Gemini if available
  if (!aiConfig.gemini.apiKey) {
    console.warn('⚠️ Gemini API key missing, using rule-based schedule');
    return ruleBasedSchedule;
  }

  try {
    const model = aiConfig.gemini.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.gemini.apiKey}`;
    
    console.log(`📡 Calling Gemini API (${model}) for watering schedule`);

    // ✅ Even more explicit prompt with all dates
    const today = new Date();
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const prompt = `
Generate a watering schedule for a ${plant.name} plant for these 7 days:
${dates.join(', ')}

Plant info:
- Type: ${plant.name}
- Sunlight: ${plant.sunlight || 'full'}
- Status: ${plant.status || 'growing'}
- Water every: ${plant.waterFrequency || 3} days

Return a JSON array with 7 objects, one for each day.
Each object: {"date":"YYYY-MM-DD","amount":"500ml or 1L","timeOfDay":"morning or evening","notes":"reason"}

Example: {"date":"2026-08-28","amount":"1L","timeOfDay":"morning","notes":"Deep watering"}

Return ONLY the JSON array. No explanations.
`;

    console.log('📝 Prompt sent to Gemini (with all 7 dates)');

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
          // ✅ MAXIMUM TOKEN LIMIT
          maxOutputTokens: 8192,  // Max for Gemini
          topK: 40,
          topP: 0.95,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // Increased timeout
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('✅ Gemini responded');
    console.log('📝 Response length:', textResponse.length);
    console.log('📝 Full response:');
    console.log(textResponse);

    // If response is too short, use fallback
    if (textResponse.length < 50) {
      console.warn('⚠️ Response too short, using fallback');
      return ruleBasedSchedule;
    }

    // Clean the response
    let jsonStr = textResponse.trim();
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to find JSON array
    let startIdx = jsonStr.indexOf('[');
    if (startIdx === -1) {
      console.warn('⚠️ No JSON array found, using fallback');
      return ruleBasedSchedule;
    }
    
    // Extract the complete JSON array
    let bracketCount = 0;
    let endIdx = -1;
    let inString = false;
    let escapeNext = false;
    
    for (let i = startIdx; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '[') bracketCount++;
        if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            endIdx = i;
            break;
          }
        }
      }
    }
    
    if (endIdx === -1 || endIdx === startIdx) {
      console.warn('⚠️ Could not find complete JSON array, using fallback');
      return ruleBasedSchedule;
    }
    
    jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    
    // Count how many objects we have
    const itemCount = (jsonStr.match(/\{/g) || []).length;
    console.log(`📊 Found ${itemCount} items in response`);

    // If we have less than 3 items, use fallback
    if (itemCount < 3) {
      console.warn(`⚠️ Only ${itemCount} items generated, using fallback`);
      return ruleBasedSchedule;
    }

    // If we have less than 7 items, try to complete the array
    let finalSchedule = [];
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        finalSchedule = parsed;
        console.log(`✅ Gemini generated ${finalSchedule.length} watering events`);
        
        // If we have less than 7, fill remaining days with rule-based
        if (finalSchedule.length < 7) {
          console.log(`📝 Filling remaining ${7 - finalSchedule.length} days with rule-based data`);
          const ruleBased = generateRuleBasedSchedule(plant, weatherData);
          
          // Get existing dates from Gemini
          const existingDates = new Set(finalSchedule.map(e => e.date));
          
          // Add rule-based events for missing dates
          for (const ruleEvent of ruleBased) {
            if (!existingDates.has(ruleEvent.date)) {
              finalSchedule.push(ruleEvent);
              existingDates.add(ruleEvent.date);
            }
          }
          
          // Sort by date
          finalSchedule.sort((a, b) => new Date(a.date) - new Date(b.date));
          console.log(`📊 Final schedule has ${finalSchedule.length} events`);
        }
        
        return finalSchedule;
      } else {
        console.warn('⚠️ Gemini returned invalid array, using fallback');
        return ruleBasedSchedule;
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse Gemini response:', parseError.message);
      
      // Try to fix common JSON issues
      try {
        // Remove trailing commas
        jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
        // Close any open strings
        const openQuotes = (jsonStr.match(/"/g) || []).length;
        if (openQuotes % 2 !== 0) {
          jsonStr += '"';
        }
        // Close any open arrays
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        if (openBrackets > closeBrackets) {
          jsonStr += ']'.repeat(openBrackets - closeBrackets);
        }
        
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ Fixed and parsed JSON successfully with ${parsed.length} items`);
          return parsed;
        }
      } catch (fixError) {
        console.warn('⚠️ Still cannot parse JSON, using fallback');
      }
      
      // If all parsing fails, use rule-based schedule
      return ruleBasedSchedule;
    }
  } catch (error) {
    console.warn('⚠️ Gemini watering fallback to rule-based:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return ruleBasedSchedule;
  }
}

/**
 * Simple rule-based watering schedule generator
 */
function generateRuleBasedSchedule(plant, weatherData) {
  const schedule = [];
  const baseInterval = plant.waterFrequency || 3;
  const today = new Date();

  // Adjust based on temperature (if weatherData is available)
  let tempAdjustment = 0;
  if (weatherData && weatherData.list && weatherData.list.length > 0) {
    const avgTemp = weatherData.list.reduce((acc, d) => acc + d.main.temp, 0) / weatherData.list.length;
    if (avgTemp > 30) tempAdjustment = -1; // water more often
    else if (avgTemp < 15) tempAdjustment = 1; // water less often
  }

  const interval = Math.max(1, baseInterval + tempAdjustment);

  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    schedule.push({
      date: date.toISOString().split('T')[0],
      amount: plant.size === 'large' ? '1L' : '500ml',
      timeOfDay: i % 2 === 0 ? 'morning' : 'evening',
      notes: tempAdjustment < 0 ? '☀️ Hot weather – extra water' : '🌤️ Normal watering',
    });
  }
  return schedule;
}

module.exports = { generateSchedule };