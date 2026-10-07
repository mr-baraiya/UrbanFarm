const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const aiConfig = require('../config/aiConfig');

/**
 * System prompt generator structured for the 9-section clinical agricultural report:
 * 1. Diagnosis (Plant name + diagnosed problem + short explanation)
 * 2. Observed Symptoms (Visual signs seen in the uploaded leaf/crop image)
 * 3. Possible Cause (Pathogen, pest, nutrient, water stress, climate)
 * 4. Severity (Mild / Moderate / Severe + percentage/impact)
 * 5. Immediate Action (Urgent first aid: isolate, prune, flush, remove)
 * 6. Modern Solution (Approved agricultural fungicides/pesticides/bio-controls with active ingredients)
 * 7. Natural Solution (Traditional Indian organic recipes with exact measurements)
 * 8. Prevention (Long-term crop rotation, spacing, sanitation, irrigation)
 * 9. When to Contact Expert (Escalation triggers for Krishi Vigyan Kendra / agricultural officer)
 */
const getSystemPrompt = (language) => `You are an expert plant pathologist and agronomist. Analyze the uploaded image.
Step 1: Decide if the image's main subject is a plant, leaf, flower, fruit, vegetable or crop. If not (people, faces, animals, objects, text, screenshots, anything else), return is_plant=false, set every other field to an empty string or empty array, and stop. Do not describe the image.
Step 2: If it is a plant, formulate your analysis into the 9 clinical agricultural sections in JSON format:
{
  "is_plant": true,
  "plant_name": "Common plant name in ${language}",
  "scientific_name": "Scientific / botanical name",
  "is_healthy": true or false,
  "condition_name": "Section 1: Identified disease, pest, deficiency name or Healthy Plant in ${language}",
  "short_explanation": "Section 1: Concise 2-3 sentence overview in ${language}",
  "observed_symptoms": ["Section 2: Visible sign 1 in ${language}", "Visible sign 2 in ${language}"],
  "possible_causes": ["Section 3: Pathogen or stress cause 1 in ${language}", "Cause 2 in ${language}"],
  "severity_level": "Mild" or "Moderate" or "Severe" or "Healthy",
  "severity_percentage": 0 to 100 integer,
  "severity_description": "Section 4: Severity assessment description in ${language}",
  "immediate_actions": ["Section 5: Urgent first-aid step 1 in ${language}", "Step 2 in ${language}"],
  "modern_solutions": ["Section 6: Chemical / bio-control with active ingredients & dosage in ${language}"],
  "natural_solutions": ["Section 7: Traditional organic desi recipe with exact measurement in ${language}"],
  "prevention_tips": ["Section 8: Long-term preventative cultural practice 1 in ${language}", "Practice 2 in ${language}"],
  "when_to_contact_expert": "Section 9: Clear trigger criteria on when to consult agricultural officers in ${language}",
  "confidence": "high" or "medium" or "low",
  "note_if_unsure": "Advice if diagnosis is uncertain in ${language}"
}
Step 3: Write ALL output text values in ${language}. Keep sentences short, practical, and farmer-friendly. JSON keys stay in English exactly as shown above.`;

// JSON Schema definition for Gemini response fallback
const plantSchema = {
  type: SchemaType.OBJECT,
  properties: {
    is_plant: {
      type: SchemaType.BOOLEAN,
      description: 'True if main subject is plant, leaf, flower, fruit or vegetable. False for people, animals, objects, documents, screenshots, etc.'
    },
    plant_name: {
      type: SchemaType.STRING,
      description: 'Common name of the plant in the requested language'
    },
    scientific_name: {
      type: SchemaType.STRING,
      description: 'Scientific / botanical name of the plant'
    },
    is_healthy: {
      type: SchemaType.BOOLEAN,
      description: 'True if the plant appears healthy without disease or pest damage'
    },
    condition_name: {
      type: SchemaType.STRING,
      description: 'Section 1: Identified disease, pest, deficiency name, or "Healthy Plant"'
    },
    short_explanation: {
      type: SchemaType.STRING,
      description: 'Section 1: Concise botanical diagnosis overview'
    },
    observed_symptoms: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 2: Observed visible symptoms from the image'
    },
    possible_causes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 3: Possible pathogen, environmental or nutritional causes'
    },
    severity_level: {
      type: SchemaType.STRING,
      enum: ['Mild', 'Moderate', 'Severe', 'Healthy'],
      description: 'Section 4: Severity rating (Mild, Moderate, Severe, Healthy)'
    },
    severity_percentage: {
      type: SchemaType.INTEGER,
      description: 'Section 4: Estimated percentage severity of damage (0 to 100)'
    },
    severity_description: {
      type: SchemaType.STRING,
      description: 'Section 4: Brief description of severity and risk level'
    },
    immediate_actions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 5: Urgent immediate first-aid steps to do right now'
    },
    modern_solutions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 6: Scientific/agricultural treatments with active ingredients and dosage'
    },
    natural_solutions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 7: Traditional/organic desi remedies with exact measurements'
    },
    prevention_tips: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Section 8: Long-term preventative cultural practices'
    },
    when_to_contact_expert: {
      type: SchemaType.STRING,
      description: 'Section 9: Clear trigger criteria on when to get professional agricultural help'
    },
    confidence: {
      type: SchemaType.STRING,
      enum: ['high', 'medium', 'low'],
      description: 'Confidence level: high, medium, or low'
    },
    note_if_unsure: {
      type: SchemaType.STRING,
      description: 'Advice if diagnosis is uncertain (e.g., ask for clearer photo in daylight)'
    }
  },
  required: [
    'is_plant',
    'plant_name',
    'scientific_name',
    'is_healthy',
    'condition_name',
    'short_explanation',
    'observed_symptoms',
    'possible_causes',
    'severity_level',
    'severity_percentage',
    'severity_description',
    'immediate_actions',
    'modern_solutions',
    'natural_solutions',
    'prevention_tips',
    'when_to_contact_expert',
    'confidence',
    'note_if_unsure'
  ]
};

function isRateLimitError(err) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode || (err?.response && err?.response.status);
  return status === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

/**
 * Sanitize diagnosis result to guarantee complete 9-section structure
 */
function sanitizeResult(raw) {
  if (!raw || raw.is_plant === false) {
    return {
      is_plant: false,
      isPlant: false,
      plant_name: '',
      plantName: '',
      scientific_name: '',
      scientificName: '',
      is_healthy: false,
      isHealthy: false,
      condition_name: 'Not a Plant',
      diseaseName: 'Not a Plant',
      short_explanation: '',
      description: '',
      observed_symptoms: [],
      symptoms: [],
      possible_causes: [],
      causes: [],
      cause: '',
      severity_level: 'Mild',
      severityLevel: 'Mild',
      severity_percentage: 0,
      severityPercentage: 0,
      severity_description: '',
      severityDescription: '',
      immediate_actions: [],
      immediateActions: [],
      treatment_steps: [],
      treatmentSteps: [],
      modern_solutions: [],
      modernSolutions: [],
      medical_solutions: [],
      medicalSolutions: [],
      natural_solutions: [],
      naturalSolutions: [],
      desi_solutions: [],
      desiSolutions: [],
      prevention_tips: [],
      preventionTips: [],
      when_to_contact_expert: '',
      whenToContactExpert: '',
      when_to_seek_expert_help: '',
      whenToSeekExpertHelp: '',
      confidence: 'low',
      confidenceLevel: 'low',
      confidenceScore: 0.1,
      note_if_unsure: '',
      noteIfUnsure: ''
    };
  }

  const confidenceStr = ['high', 'medium', 'low'].includes(raw.confidence?.toLowerCase()) 
    ? raw.confidence.toLowerCase() 
    : 'medium';
  
  const confidenceScore = confidenceStr === 'high' ? 0.95 : confidenceStr === 'medium' ? 0.75 : 0.45;
  const isHealthy = Boolean(raw.is_healthy);
  const conditionName = raw.condition_name || (isHealthy ? 'Healthy Plant' : 'Condition Detected');
  const shortExplanation = raw.short_explanation || raw.description || '';

  const observedSymptoms = Array.isArray(raw.observed_symptoms) && raw.observed_symptoms.length > 0
    ? raw.observed_symptoms.filter(Boolean)
    : (Array.isArray(raw.symptoms) ? raw.symptoms.filter(Boolean) : []);

  const possibleCauses = Array.isArray(raw.possible_causes) && raw.possible_causes.length > 0
    ? raw.possible_causes.filter(Boolean)
    : (Array.isArray(raw.causes) ? raw.causes.filter(Boolean) : (raw.cause ? [raw.cause] : []));

  const immediateActions = Array.isArray(raw.immediate_actions) && raw.immediate_actions.length > 0
    ? raw.immediate_actions.filter(Boolean)
    : (Array.isArray(raw.treatment_steps) ? raw.treatment_steps.filter(Boolean) : []);

  const modernSolutions = Array.isArray(raw.modern_solutions) && raw.modern_solutions.length > 0
    ? raw.modern_solutions.filter(Boolean)
    : (Array.isArray(raw.medical_solutions) ? raw.medical_solutions.filter(Boolean) : []);

  const naturalSolutions = Array.isArray(raw.natural_solutions) && raw.natural_solutions.length > 0
    ? raw.natural_solutions.filter(Boolean)
    : (Array.isArray(raw.desi_solutions) ? raw.desi_solutions.filter(Boolean) : []);

  const preventionTips = Array.isArray(raw.prevention_tips) && raw.prevention_tips.length > 0
    ? raw.prevention_tips.filter(Boolean)
    : [];

  const rawSeverity = raw.severity_level || (isHealthy ? 'Healthy' : confidenceScore > 0.8 ? 'Severe' : 'Moderate');
  const severityLevel = ['Mild', 'Moderate', 'Severe', 'Healthy'].includes(rawSeverity) ? rawSeverity : 'Moderate';
  const severityPercentage = typeof raw.severity_percentage === 'number'
    ? raw.severity_percentage
    : severityLevel === 'Severe' ? 75 : severityLevel === 'Moderate' ? 45 : severityLevel === 'Mild' ? 20 : 0;

  const severityDescription = raw.severity_description || `${severityLevel} impact on foliage and crop health.`;
  const whenToContactExpert = raw.when_to_contact_expert || raw.when_to_seek_expert_help || '';

  return {
    is_plant: true,
    isPlant: true,
    plant_name: raw.plant_name || '',
    plantName: raw.plant_name || '',
    scientific_name: raw.scientific_name || '',
    scientificName: raw.scientific_name || '',
    is_healthy: isHealthy,
    isHealthy: isHealthy,
    condition_name: conditionName,
    diseaseName: conditionName,
    disease: conditionName,
    short_explanation: shortExplanation,
    shortExplanation: shortExplanation,
    description: shortExplanation,
    observed_symptoms: observedSymptoms,
    observedSymptoms: observedSymptoms,
    symptoms: observedSymptoms,
    possible_causes: possibleCauses,
    possibleCauses: possibleCauses,
    causes: possibleCauses,
    cause: possibleCauses.join('. '),
    severity_level: severityLevel,
    severityLevel: severityLevel,
    severity_percentage: severityPercentage,
    severityPercentage: severityPercentage,
    severity_description: severityDescription,
    severityDescription: severityDescription,
    immediate_actions: immediateActions,
    immediateActions: immediateActions,
    treatment_steps: immediateActions,
    treatmentSteps: immediateActions,
    treatment: immediateActions.join('\n') || (modernSolutions[0] || naturalSolutions[0] || ''),
    modern_solutions: modernSolutions,
    modernSolutions: modernSolutions,
    medical_solutions: modernSolutions,
    medicalSolutions: modernSolutions,
    natural_solutions: naturalSolutions,
    naturalSolutions: naturalSolutions,
    desi_solutions: naturalSolutions,
    desiSolutions: naturalSolutions,
    prevention_tips: preventionTips,
    preventionTips: preventionTips,
    when_to_contact_expert: whenToContactExpert,
    whenToContactExpert: whenToContactExpert,
    when_to_seek_expert_help: whenToContactExpert,
    whenToSeekExpertHelp: whenToContactExpert,
    confidence: confidenceStr,
    confidenceLevel: confidenceStr,
    confidenceScore: confidenceScore,
    note_if_unsure: raw.note_if_unsure || '',
    noteIfUnsure: raw.note_if_unsure || ''
  };
}

/**
 * Extract base64 and mimeType from buffer, dataURI, or fetch from remote URL
 */
async function extractBase64AndMime(imageInput, fileBuffer, fileMime) {
  if (fileBuffer) {
    return {
      base64Data: fileBuffer.toString('base64'),
      mimeType: fileMime || 'image/jpeg'
    };
  }

  if (typeof imageInput === 'string') {
    if (imageInput.startsWith('data:')) {
      const matches = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        return {
          mimeType: matches[1],
          base64Data: matches[2]
        };
      }
      const commaIdx = imageInput.indexOf(',');
      if (commaIdx !== -1) {
        return {
          mimeType: 'image/jpeg',
          base64Data: imageInput.slice(commaIdx + 1)
        };
      }
    }

    if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
      const response = await axios.get(imageInput, { 
        responseType: 'arraybuffer', 
        timeout: 15000,
        headers: { 'User-Agent': 'UrbanFarmBot/1.0' }
      });
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      const base64Data = Buffer.from(response.data).toString('base64');
      return { base64Data, mimeType };
    }
  }

  throw new Error('Invalid image input provided.');
}

/**
 * Normalize language code to descriptive name
 */
function normalizeLanguage(lang) {
  if (!lang) return 'English';
  const l = String(lang).toLowerCase().trim();
  if (l === 'gu' || l.includes('gujarat')) return 'Gujarati (ગુજરાતી)';
  if (l === 'hi' || l.includes('hind')) return 'Hindi (हिन्दी)';
  return 'English';
}

/**
 * Primary: Call Groq Vision API for 9-Section Plant Pathology Diagnosis
 */
async function callGroqVision(apiKey, base64Data, mimeType, targetLanguage) {
  const visionModels = [
    aiConfig.groq?.visionModel || 'qwen/qwen3.8-27b',
    'qwen/qwen3.8-27b'
  ];
  const uniqueModels = Array.from(new Set(visionModels));
  const prompt = getSystemPrompt(targetLanguage);
  const dataUri = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;

  let lastError = null;
  for (const model of uniqueModels) {
    try {
      console.log(`🚀 [Groq Vision] Diagnosing with model ${model} in ${targetLanguage}...`);
      const response = await axios.post(
        `${aiConfig.groq.baseUrl}/chat/completions`,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUri } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Groq Vision API');
      }

      const parsed = JSON.parse(content);
      console.log(`✅ [Groq Vision] Diagnosis succeeded with model ${model}`);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ [Groq Vision] Model ${model} failed:`, err.response?.data || err.message);
      if (isRateLimitError(err)) {
        break; // If rate-limited, fall to Gemini backup
      }
    }
  }

  throw lastError || new Error('All Groq Vision diagnosis attempts failed.');
}

/**
 * Backup: Call Google Gemini Vision if Groq is unavailable
 */
async function callGeminiVision(apiKey, base64Data, mimeType, targetLanguage) {
  const modelsToTry = [
    aiConfig.gemini?.model,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest'
  ].filter(Boolean);

  const uniqueModels = Array.from(new Set(modelsToTry));
  const systemPrompt = getSystemPrompt(targetLanguage);
  const userPrompt = `Analyze this image according to your instructions. Selected language for all output text is: ${targetLanguage}.`;

  let lastError = null;
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of uniqueModels) {
    try {
      console.log(`🤖 [Gemini Backup] Attempting Gemini Vision diagnosis with model: ${modelName} in ${targetLanguage}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: plantSchema
        }
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType || 'image/jpeg'
          }
        },
        userPrompt
      ]);

      const responseText = result.response.text()?.trim() || '';
      const parsed = JSON.parse(responseText);
      console.log(`✅ [Gemini Backup] Diagnosis successful with ${modelName}`);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ [Gemini Backup] Model ${modelName} failed:`, err.message);
      if (isRateLimitError(err)) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini model diagnosis attempts failed.');
}

/**
 * Main function: Identify plant disease using Groq API as Primary
 */
exports.identifyDiseaseWithGroq = async ({ imageInput, fileBuffer, fileMime, language }) => {
  const targetLang = normalizeLanguage(language);
  const { base64Data, mimeType } = await extractBase64AndMime(imageInput, fileBuffer, fileMime);

  // 1. Primary Diagnosis Engine: Groq API
  const groqKey = aiConfig.groq?.apiKey || process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '') {
    try {
      const rawResult = await callGroqVision(groqKey, base64Data, mimeType, targetLang);
      return sanitizeResult(rawResult);
    } catch (groqErr) {
      console.warn('⚠️ Primary Groq Vision diagnosis failed, falling back to Gemini Vision:', groqErr.message);
    }
  } else {
    console.warn('⚠️ Groq API key is missing or not configured. Trying Gemini backup.');
  }

  // 2. Secondary Backup Engine: Gemini Vision
  const geminiKey = aiConfig.gemini?.apiKey || process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    const rawGeminiResult = await callGeminiVision(geminiKey, base64Data, mimeType, targetLang);
    return sanitizeResult(rawGeminiResult);
  }

  throw new Error('No AI diagnosis API keys configured (Groq / Gemini). Please check your environment settings.');
};

// Backward-compatible alias
exports.identifyDiseaseWithGemini = exports.identifyDiseaseWithGroq;

/**
 * Generate 9-section clinical tips via Groq API (with Gemini fallback)
 */
exports.getGroqDiseaseTips = async (diseaseName, description = '', language = 'en') => {
  const targetLang = normalizeLanguage(language);
  const prompt = `You are a professional plant pathologist and agronomist.
Diagnosed Plant Issue: "${diseaseName}"
Additional context: "${description}"
Output language: ${targetLang}

Provide the clinical 9-section agricultural diagnosis in strict JSON format:
{
  "condition_name": "Exact condition name in ${targetLang}",
  "short_explanation": "2-3 sentence overview in ${targetLang}",
  "observed_symptoms": ["Visible symptom 1 in ${targetLang}", "Visible symptom 2 in ${targetLang}"],
  "possible_causes": ["Cause/pathogen 1 in ${targetLang}", "Cause/stressor 2 in ${targetLang}"],
  "severity_level": "Mild" or "Moderate" or "Severe" or "Healthy",
  "severity_percentage": 50,
  "severity_description": "Severity assessment description in ${targetLang}",
  "immediate_actions": ["Immediate first-aid step 1 in ${targetLang}", "Immediate first-aid step 2 in ${targetLang}"],
  "modern_solutions": ["Scientific chemical or bio-control treatment with active ingredient in ${targetLang}"],
  "natural_solutions": ["Traditional organic desi recipe with exact measurement in ${targetLang}"],
  "prevention_tips": ["Long-term prevention practice 1 in ${targetLang}", "Practice 2 in ${targetLang}"],
  "when_to_contact_expert": "Clear criteria for consulting agricultural extension officers in ${targetLang}",
  "note_if_unsure": "Retake photo advice in ${targetLang}"
}

Return ONLY valid JSON with no markdown formatting.`;

  // 1. Primary: Groq API
  const groqKey = aiConfig.groq?.apiKey || process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '') {
    const textModels = [
      aiConfig.groq?.textModel || 'openai/gpt-oss-120b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];
    for (const model of Array.from(new Set(textModels))) {
      try {
        console.log(`🚀 [Groq Tips] Generating recommendations with ${model}...`);
        const res = await axios.post(
          `${aiConfig.groq.baseUrl}/chat/completions`,
          {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 4096
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 25000
          }
        );
        const parsed = JSON.parse(res.data.choices[0].message.content);
        return sanitizeResult(parsed);
      } catch (err) {
        console.warn(`⚠️ [Groq Tips] Model ${model} failed:`, err.response?.data || err.message);
      }
    }
  }

  // 2. Backup: Gemini API
  const geminiKey = aiConfig.gemini?.apiKey || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text()?.trim() || '';
        const parsed = JSON.parse(text);
        return sanitizeResult(parsed);
      } catch (err) {
        console.warn(`[Gemini Tips Backup] ${modelName} failed:`, err.message);
      }
    }
  }

  throw new Error('Failed to generate disease treatment tips from Groq/Gemini API.');
};

// Backward-compatible alias
exports.getGeminiDiseaseTips = exports.getGroqDiseaseTips;

/**
 * Translate 9-section diagnosis result into target language ('en', 'gu', 'hi') via Groq API (with Gemini fallback)
 */
exports.translateDiagnosisWithGroq = async (dataToTranslate, targetLang) => {
  const targetLangName = normalizeLanguage(targetLang);

  const prompt = `Translate the following 9-section botanical plant diagnosis report into ${targetLangName}.
Keep scientific plant and chemical terms clear, natural, and farmer-friendly in ${targetLangName}.
Input JSON:
${JSON.stringify(dataToTranslate, null, 2)}

Return a strict JSON object with identical keys, where all text values are accurately translated into ${targetLangName}:
{
  "plantName": "Translated plant name",
  "diseaseName": "Translated condition / disease name",
  "shortExplanation": "Translated short explanation overview",
  "description": "Translated description",
  "observedSymptoms": ["Translated symptom 1", "Translated symptom 2"],
  "symptoms": ["Translated symptom 1", "Translated symptom 2"],
  "possibleCauses": ["Translated cause 1", "Translated cause 2"],
  "causes": ["Translated cause 1", "Translated cause 2"],
  "cause": "Translated cause summary",
  "severityLevel": "Translated severity level (Mild / Moderate / Severe / Healthy)",
  "severityDescription": "Translated severity description",
  "immediateActions": ["Translated immediate action 1", "Translated immediate action 2"],
  "treatmentSteps": ["Translated immediate action 1", "Translated immediate action 2"],
  "modernSolutions": ["Translated chemical/scientific remedy 1", "Translated remedy 2"],
  "medicalSolutions": ["Translated chemical/scientific remedy 1", "Translated remedy 2"],
  "naturalSolutions": ["Translated organic desi recipe 1", "Translated recipe 2"],
  "desiSolutions": ["Translated organic desi recipe 1", "Translated recipe 2"],
  "preventionTips": ["Translated prevention tip 1", "Translated prevention tip 2"],
  "whenToContactExpert": "Translated expert help guidance",
  "whenToSeekExpertHelp": "Translated expert help guidance",
  "noteIfUnsure": "Translated retake/unsure note"
}

Return ONLY valid JSON with no markdown formatting.`;

  // 1. Primary: Groq API
  const groqKey = aiConfig.groq?.apiKey || process.env.GROQ_API_KEY;
  if (groqKey && groqKey.trim() !== '') {
    const textModels = [
      aiConfig.groq?.textModel || 'openai/gpt-oss-120b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];
    for (const model of Array.from(new Set(textModels))) {
      try {
        console.log(`🚀 [Groq Translate] Translating diagnosis into ${targetLangName} with ${model}...`);
        const res = await axios.post(
          `${aiConfig.groq.baseUrl}/chat/completions`,
          {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 4096
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 25000
          }
        );
        const parsed = JSON.parse(res.data.choices[0].message.content);
        return {
          plantName: String(parsed.plantName || dataToTranslate.plantName || '').trim(),
          diseaseName: String(parsed.diseaseName || dataToTranslate.diseaseName || '').trim(),
          shortExplanation: String(parsed.shortExplanation || parsed.description || dataToTranslate.shortExplanation || dataToTranslate.description || '').trim(),
          description: String(parsed.description || parsed.shortExplanation || dataToTranslate.description || '').trim(),
          observedSymptoms: Array.isArray(parsed.observedSymptoms) ? parsed.observedSymptoms.map(String) : (Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : (dataToTranslate.observedSymptoms || dataToTranslate.symptoms || [])),
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : (Array.isArray(parsed.observedSymptoms) ? parsed.observedSymptoms.map(String) : (dataToTranslate.symptoms || [])),
          possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses.map(String) : (Array.isArray(parsed.causes) ? parsed.causes.map(String) : (dataToTranslate.possibleCauses || dataToTranslate.causes || [])),
          causes: Array.isArray(parsed.causes) ? parsed.causes.map(String) : (dataToTranslate.causes || []),
          cause: String(parsed.cause || dataToTranslate.cause || '').trim(),
          severityLevel: String(parsed.severityLevel || dataToTranslate.severityLevel || 'Moderate').trim(),
          severityPercentage: dataToTranslate.severityPercentage || 50,
          severityDescription: String(parsed.severityDescription || dataToTranslate.severityDescription || '').trim(),
          immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions.map(String) : (Array.isArray(parsed.treatmentSteps) ? parsed.treatmentSteps.map(String) : (dataToTranslate.immediateActions || dataToTranslate.treatmentSteps || [])),
          treatmentSteps: Array.isArray(parsed.treatmentSteps) ? parsed.treatmentSteps.map(String) : (dataToTranslate.treatmentSteps || []),
          modernSolutions: Array.isArray(parsed.modernSolutions) ? parsed.modernSolutions.map(String) : (Array.isArray(parsed.medicalSolutions) ? parsed.medicalSolutions.map(String) : (dataToTranslate.modernSolutions || dataToTranslate.medicalSolutions || [])),
          medicalSolutions: Array.isArray(parsed.medicalSolutions) ? parsed.medicalSolutions.map(String) : (dataToTranslate.medicalSolutions || []),
          naturalSolutions: Array.isArray(parsed.naturalSolutions) ? parsed.naturalSolutions.map(String) : (Array.isArray(parsed.desiSolutions) ? parsed.desiSolutions.map(String) : (dataToTranslate.naturalSolutions || dataToTranslate.desiSolutions || [])),
          desiSolutions: Array.isArray(parsed.desiSolutions) ? parsed.desiSolutions.map(String) : (dataToTranslate.desiSolutions || []),
          preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips.map(String) : (dataToTranslate.preventionTips || []),
          whenToContactExpert: String(parsed.whenToContactExpert || parsed.whenToSeekExpertHelp || dataToTranslate.whenToContactExpert || dataToTranslate.whenToSeekExpertHelp || '').trim(),
          whenToSeekExpertHelp: String(parsed.whenToSeekExpertHelp || parsed.whenToContactExpert || dataToTranslate.whenToSeekExpertHelp || '').trim(),
          noteIfUnsure: String(parsed.noteIfUnsure || dataToTranslate.noteIfUnsure || '').trim()
        };
      } catch (err) {
        console.warn(`⚠️ [Groq Translate] Model ${model} failed:`, err.response?.data || err.message);
      }
    }
  }

  // 2. Backup: Gemini API
  const geminiKey = aiConfig.gemini?.apiKey || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text()?.trim() || '';
        const parsed = JSON.parse(text);
        return {
          plantName: String(parsed.plantName || dataToTranslate.plantName || '').trim(),
          diseaseName: String(parsed.diseaseName || dataToTranslate.diseaseName || '').trim(),
          shortExplanation: String(parsed.shortExplanation || parsed.description || dataToTranslate.shortExplanation || dataToTranslate.description || '').trim(),
          description: String(parsed.description || parsed.shortExplanation || dataToTranslate.description || '').trim(),
          observedSymptoms: Array.isArray(parsed.observedSymptoms) ? parsed.observedSymptoms.map(String) : (Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : (dataToTranslate.observedSymptoms || dataToTranslate.symptoms || [])),
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.map(String) : (Array.isArray(parsed.observedSymptoms) ? parsed.observedSymptoms.map(String) : (dataToTranslate.symptoms || [])),
          possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses.map(String) : (Array.isArray(parsed.causes) ? parsed.causes.map(String) : (dataToTranslate.possibleCauses || dataToTranslate.causes || [])),
          causes: Array.isArray(parsed.causes) ? parsed.causes.map(String) : (dataToTranslate.causes || []),
          cause: String(parsed.cause || dataToTranslate.cause || '').trim(),
          severityLevel: String(parsed.severityLevel || dataToTranslate.severityLevel || 'Moderate').trim(),
          severityPercentage: dataToTranslate.severityPercentage || 50,
          severityDescription: String(parsed.severityDescription || dataToTranslate.severityDescription || '').trim(),
          immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions.map(String) : (Array.isArray(parsed.treatmentSteps) ? parsed.treatmentSteps.map(String) : (dataToTranslate.immediateActions || dataToTranslate.treatmentSteps || [])),
          treatmentSteps: Array.isArray(parsed.treatmentSteps) ? parsed.treatmentSteps.map(String) : (dataToTranslate.treatmentSteps || []),
          modernSolutions: Array.isArray(parsed.modernSolutions) ? parsed.modernSolutions.map(String) : (Array.isArray(parsed.medicalSolutions) ? parsed.medicalSolutions.map(String) : (dataToTranslate.modernSolutions || dataToTranslate.medicalSolutions || [])),
          medicalSolutions: Array.isArray(parsed.medicalSolutions) ? parsed.medicalSolutions.map(String) : (dataToTranslate.medicalSolutions || []),
          naturalSolutions: Array.isArray(parsed.naturalSolutions) ? parsed.naturalSolutions.map(String) : (Array.isArray(parsed.desiSolutions) ? parsed.desiSolutions.map(String) : (dataToTranslate.naturalSolutions || dataToTranslate.desiSolutions || [])),
          desiSolutions: Array.isArray(parsed.desiSolutions) ? parsed.desiSolutions.map(String) : (dataToTranslate.desiSolutions || []),
          preventionTips: Array.isArray(parsed.preventionTips) ? parsed.preventionTips.map(String) : (dataToTranslate.preventionTips || []),
          whenToContactExpert: String(parsed.whenToContactExpert || parsed.whenToSeekExpertHelp || dataToTranslate.whenToContactExpert || dataToTranslate.whenToSeekExpertHelp || '').trim(),
          whenToSeekExpertHelp: String(parsed.whenToSeekExpertHelp || parsed.whenToContactExpert || dataToTranslate.whenToSeekExpertHelp || '').trim(),
          noteIfUnsure: String(parsed.noteIfUnsure || dataToTranslate.noteIfUnsure || '').trim()
        };
      } catch (err) {
        console.warn(`[Gemini Translate Backup] ${modelName} failed:`, err.message);
      }
    }
  }

  throw new Error('Failed to translate diagnosis using Groq/Gemini API.');
};

// Backward-compatible alias
exports.translateDiagnosisWithGemini = exports.translateDiagnosisWithGroq;

/**
 * Legacy Plant.id fallback function
 */
exports.identifyDisease = async (imageUrl) => {
  try {
    console.log('🔬 Diagnosing plant disease with Plant.id API...');
    if (!aiConfig.plantId.apiKey) {
      throw new Error('Plant.id API key is missing');
    }

    const form = new FormData();
    form.append('images', imageUrl);
    form.append('organs', 'leaf');
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

    const data = response.data;
    if (!data.is_plant || data.is_plant_probability < 0.5) {
      return {
        isPlant: false,
        disease: 'Not a Plant',
        confidence: data.is_plant_probability || 0,
        treatment: 'The uploaded image does not appear to be a plant. Please upload a clear photo of a plant leaf.',
        description: 'The AI could not identify this as a plant.',
        scientificName: '',
      };
    }

    if (data.health_assessment?.is_healthy) {
      return {
        isPlant: true,
        isHealthy: true,
        disease: 'Healthy Plant',
        confidence: data.health_assessment.is_healthy_probability || 0.95,
        treatment: 'Your plant appears healthy! Continue with good care practices.',
        description: 'No diseases detected. The plant looks healthy.',
        scientificName: '',
      };
    }

    const diseases = data.health_assessment?.diseases || [];
    const topDisease = diseases.length > 0
      ? diseases.reduce((a, b) => (a.probability || 0) > (b.probability || 0) ? a : b)
      : { name: 'Unknown Condition', probability: 0.5 };

    return {
      isPlant: true,
      isHealthy: false,
      disease: topDisease.name,
      confidence: topDisease.probability || 0.7,
      treatment: `Apply appropriate treatment for ${topDisease.name}.`,
      description: `Detected ${topDisease.name}`,
      scientificName: '',
    };
  } catch (error) {
    console.error('Plant.id API error:', error.message);
    throw error;
  }
};