const axios = require('axios');
const FormData = require('form-data');
const aiConfig = require('../config/aiConfig');

/**
 * Identify plant disease from an image URL using Plant.id API
 */
exports.identifyDisease = async (imageUrl) => {
  try {
    console.log('🔬 Diagnosing plant disease with Plant.id API...');
    console.log('Image URL:', imageUrl);
    console.log('API Key exists:', !!aiConfig.plantId.apiKey);

    if (!aiConfig.plantId.apiKey) {
      console.error('❌ Plant.id API key is missing!');
      return getFallbackResponse('API key not configured');
    }

    const form = new FormData();
    form.append('images', imageUrl);
    form.append('organs', 'leaf');
    // Add health assessment modifier
    form.append('modifiers', 'health_only');

    const response = await axios.post(
      `${aiConfig.plantId.baseUrl}${aiConfig.plantId.endpoints.healthAssessment}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Api-Key': aiConfig.plantId.apiKey,
        },
        timeout: 30000,
      }
    );

    console.log('✅ Plant.id API response received');

    const data = response.data;
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Check if it's a plant
    if (!data.is_plant || data.is_plant_probability < 0.5) {
      return {
        disease: 'Not a Plant',
        confidence: data.is_plant_probability || 0,
        treatment: 'The uploaded image does not appear to be a plant. Please upload a clear photo of a plant leaf.',
        description: 'The AI could not identify this as a plant.',
        scientificName: '',
      };
    }

    // Check if healthy
    if (data.health_assessment?.is_healthy) {
      return {
        disease: 'Healthy Plant',
        confidence: data.health_assessment.is_healthy_probability || 0.95,
        treatment: 'Your plant appears healthy! Continue with good care practices: proper watering, adequate sunlight, and regular monitoring.',
        description: 'No diseases detected. The plant looks healthy.',
        scientificName: '',
      };
    }

    // Get diseases from health assessment
    const diseases = data.health_assessment?.diseases || [];
    
    if (diseases.length === 0) {
      return {
        disease: 'Unidentified Issue',
        confidence: 0.5,
        treatment: 'The AI detected an issue but could not identify it specifically. Please consult a local plant expert.',
        description: 'Health issues detected but not classified.',
        scientificName: '',
      };
    }

    // Get the disease with highest probability
    const topDisease = diseases.reduce((a, b) => 
      (a.probability || 0) > (b.probability || 0) ? a : b
    );

    // Format treatment based on disease
    let treatment = 'No specific treatment available. Consult a local plant expert.';
    if (topDisease.name.toLowerCase().includes('water')) {
      treatment = 'Adjust watering schedule. Allow soil to dry between waterings. Ensure proper drainage. Water early in the morning.';
    } else if (topDisease.name.toLowerCase().includes('fungal') || topDisease.name.toLowerCase().includes('mildew')) {
      treatment = 'Apply appropriate fungicide. Improve air circulation. Remove affected leaves. Avoid overhead watering.';
    } else if (topDisease.name.toLowerCase().includes('pest') || topDisease.name.toLowerCase().includes('insect')) {
      treatment = 'Apply insecticidal soap or neem oil. Isolate affected plant. Remove visible pests.';
    } else if (topDisease.name.toLowerCase().includes('nutrient')) {
      treatment = 'Apply balanced fertilizer. Check soil pH. Ensure proper drainage.';
    } else {
      treatment = `Treatment: ${topDisease.name}. Consult a local plant expert for specific treatment.`;
    }

    return {
      disease: topDisease.name || 'Unknown Disease',
      confidence: topDisease.probability || 0,
      treatment: treatment,
      description: `The AI detected: ${topDisease.name} with ${Math.round((topDisease.probability || 0) * 100)}% confidence. ${getDiseaseDescription(topDisease.name)}`,
      scientificName: topDisease.entity_id ? `Disease ID: ${topDisease.entity_id}` : '',
      isHealthy: false,
      allDiseases: diseases.map(d => ({
        name: d.name,
        probability: d.probability,
      })),
    };
  } catch (error) {
    console.error('❌ Plant.id API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(error.response?.data?.message || error.message || 'Plant diagnosis service failed. Please retry with a clear image.');
  }
};

// Candidate models for Google Gemini
const getCandidateModels = () => Array.from(new Set([
  aiConfig.gemini?.model,
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash'
])).filter(Boolean);

/**
 * Generate real disease treatment and prevention tips via Google Gemini API
 */
exports.getGeminiDiseaseTips = async (diseaseName, description = '') => {
  const apiKey = aiConfig.gemini.apiKey;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in the environment.');
  }

  const prompt = `You are a professional plant pathologist and agronomist.
Diagnosed Plant Issue: "${diseaseName}"
Additional context: "${description}"

Provide precise, actionable botanical care instructions in strict JSON format:
{
  "cause": "A concise explanation (2-3 sentences) detailing why this occurs, the pathogen/environmental stressor, and conditions favoring it.",
  "treatmentSteps": [
    "Step 1: Immediate practical intervention (e.g., pruning, organic fungicide, watering adjustment).",
    "Step 2: Follow-up treatment with specific application rate or timing.",
    "Step 3: Recovery monitoring step."
  ],
  "preventionTips": [
    "Practical long-term preventive cultural practice 1.",
    "Soil or humidity management preventive practice 2.",
    "Spacing or sanitation practice 3."
  ]
}

Return ONLY valid JSON matching this schema with no markdown wrapping or additional text.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      response_mime_type: 'application/json'
    }
  };

  const candidateModels = getCandidateModels();
  let rawText = null;
  let lastError = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) break;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Tips] Model ${model} failed: ${err.message}`);
    }
  }

  if (!rawText) {
    throw new Error(lastError?.message || 'Failed to generate disease treatment tips from Gemini API.');
  }

  try {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    const parsed = JSON.parse(clean);
    if (!parsed.cause || !Array.isArray(parsed.treatmentSteps) || !Array.isArray(parsed.preventionTips)) {
      throw new Error('Incomplete tips structure returned from Gemini.');
    }
    return {
      cause: String(parsed.cause).trim(),
      treatmentSteps: parsed.treatmentSteps.map(s => String(s).trim()).filter(Boolean),
      preventionTips: parsed.preventionTips.map(p => String(p).trim()).filter(Boolean)
    };
  } catch (parseErr) {
    console.error('Failed to parse Gemini tips JSON:', parseErr.message, rawText);
    throw new Error('Invalid JSON format received from AI diagnosis service. Please retry.');
  }
};

/**
 * Translate diagnosis result into target language ('en', 'gu', 'hi') via Google Gemini API
 */
exports.translateDiagnosisWithGemini = async (dataToTranslate, targetLang) => {
  const apiKey = aiConfig.gemini.apiKey;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in the environment.');
  }

  const langNames = {
    en: 'English',
    gu: 'Gujarati (ગુજરાતી)',
    hi: 'Hindi (हिन्दी)'
  };
  const targetLangName = langNames[targetLang] || 'English';

  const prompt = `Translate the following botanical plant diagnosis report into ${targetLangName}.
Keep scientific plant and chemical terms clear and natural in ${targetLangName}.
Input JSON:
${JSON.stringify(dataToTranslate, null, 2)}

Return a strict JSON object with identical keys, where all text values are accurately translated into ${targetLangName}:
{
  "diseaseName": "Translated disease name",
  "description": "Translated description",
  "cause": "Translated cause",
  "treatmentSteps": ["Translated step 1", "Translated step 2", "Translated step 3"],
  "preventionTips": ["Translated tip 1", "Translated tip 2", "Translated tip 3"]
}

Return ONLY valid JSON with no markdown formatting.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1500,
      response_mime_type: 'application/json'
    }
  };

  const candidateModels = getCandidateModels();
  let rawText = null;
  let lastError = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) break;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Translate] Model ${model} failed: ${err.message}`);
    }
  }

  if (!rawText) {
    throw new Error(lastError?.message || 'Failed to translate diagnosis using Gemini API.');
  }

  try {
    let clean = rawText.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    const parsed = JSON.parse(clean);
    return {
      diseaseName: String(parsed.diseaseName || dataToTranslate.diseaseName || '').trim(),
      description: String(parsed.description || dataToTranslate.description || '').trim(),
      cause: String(parsed.cause || dataToTranslate.cause || '').trim(),
      treatmentSteps: Array.isArray(parsed.treatmentSteps) ? parsed.treatmentSteps.map(s => String(s).trim()) : [],
      preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips.map(p => String(p).trim()) : []
    };
  } catch (parseErr) {
    console.error('Failed to parse Gemini translation JSON:', parseErr.message, rawText);
    throw new Error('Invalid translation response format received from AI service.');
  }
};

// Helper function to get disease descriptions
function getDiseaseDescription(diseaseName) {
  const descriptions = {
    'water excess or uneven watering': 'This condition is caused by overwatering or inconsistent watering practices. Symptoms include yellowing leaves, wilting, and root rot.',
    'powdery mildew': 'A fungal disease that appears as white powdery spots on leaves. Common in humid conditions with poor air circulation.',
    'leaf spot': 'Characterized by brown or black spots with yellow halos on leaves. Caused by various fungal or bacterial pathogens.',
    'rust': 'Orange or rust-colored pustules on leaf undersides. A fungal disease that thrives in moist conditions.',
    'aphid infestation': 'Small insects on new growth and undersides of leaves. They suck plant sap and can transmit diseases.',
    'nutrient deficiency': 'Caused by lack of essential nutrients. Symptoms vary but often include yellowing, stunted growth, and poor development.',
    'fungal infection': 'Various fungal diseases affecting plants. Often appear as spots, powdery growth, or rotting tissue.',
    'bacterial infection': 'Bacterial diseases that cause spots, wilting, or rot. Often spread through water splash or contaminated tools.',
    'viral infection': 'Viral diseases that cause mosaic patterns, stunting, or distorted growth. Often spread by insects.',
  };

  for (const [key, desc] of Object.entries(descriptions)) {
    if (diseaseName.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }
  return 'A plant disease has been detected. Follow the treatment steps and prevention tips below.';
}