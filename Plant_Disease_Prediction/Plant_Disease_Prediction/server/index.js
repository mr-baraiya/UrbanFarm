import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - allow up to 10MB JSON payloads for base64 images
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// System prompt generator
const getSystemPrompt = (language) => `You are an expert plant pathologist and agronomist. Analyze the uploaded image.
Step 1: Decide if the image's main subject is a plant, leaf, flower, fruit, vegetable or crop. If not (people, faces, animals, objects, text, screenshots, anything else), return is_plant=false, set every other field to an empty string or empty array, and stop. Do not describe the image.
Step 2: If it is a plant, identify the plant (common name + scientific name if confident). Check for disease, pest damage, nutrient deficiency, or environmental stress. If the plant looks healthy, say so clearly and give general care tips instead.
Step 3: Be honest about uncertainty. Give a confidence level (high/medium/low) and, if low, tell the user to upload a clearer, closer photo of the affected part in daylight. Never invent a diagnosis. If more than one condition is possible, list the most likely first and mention alternatives.
Step 4: Write ALL text values in ${language}. Keep sentences short and simple, written so a farmer or home gardener can follow them. JSON keys stay in English.
For chemical treatments, name the active ingredient (e.g. mancozeb, copper oxychloride, neem-based products) with typical usage guidance, and remind the user to follow the product label and wear protection. For desi remedies, use ingredients easily available in India (neem oil/neem leaf spray, buttermilk spray, turmeric, cow-dung/cow-urine based preparations, garlic-chilli spray, baking soda spray, wood ash, etc.) with simple quantities.`;

// JSON Schema definition for Gemini response
const plantSchema = {
  type: SchemaType.OBJECT,
  properties: {
    is_plant: {
      type: SchemaType.BOOLEAN,
      description: 'True if main subject is plant, leaf, flower, fruit or vegetable. False for people, animals, objects, documents, screenshots, etc.'
    },
    plant_name: {
      type: SchemaType.STRING,
      description: 'Common name of the plant in the requested language, or empty string if not a plant'
    },
    scientific_name: {
      type: SchemaType.STRING,
      description: 'Scientific / botanical name of the plant, or empty string if not a plant'
    },
    is_healthy: {
      type: SchemaType.BOOLEAN,
      description: 'True if the plant appears healthy without disease or pest damage'
    },
    condition_name: {
      type: SchemaType.STRING,
      description: 'Disease/pest/deficiency name, or "Healthy" if no issues'
    },
    confidence: {
      type: SchemaType.STRING,
      enum: ['high', 'medium', 'low'],
      description: 'Confidence level: high, medium, or low'
    },
    description: {
      type: SchemaType.STRING,
      description: 'Detailed explanation of the condition and why it happens'
    },
    symptoms: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of observed symptoms'
    },
    causes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'List of causes (fungal, bacterial, pest, weather, nutrient, etc.)'
    },
    treatment_steps: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Step-by-step actionable treatment guide'
    },
    medical_solutions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Fungicides/pesticides/fertilizers with active ingredients and dosage guidelines'
    },
    desi_solutions: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Traditional Indian desi remedies with easily available ingredients and exact quantities'
    },
    recovery_tips: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Tips for aiding quick recovery'
    },
    prevention_tips: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: 'Preventative measures to stop future outbreaks'
    },
    when_to_seek_expert_help: {
      type: SchemaType.STRING,
      description: 'Guidelines on when to consult local agricultural experts'
    },
    note_if_unsure: {
      type: SchemaType.STRING,
      description: 'Advice if diagnosis is uncertain (e.g. ask for clearer photo in daylight)'
    }
  },
  required: [
    'is_plant',
    'plant_name',
    'scientific_name',
    'is_healthy',
    'condition_name',
    'confidence',
    'description',
    'symptoms',
    'causes',
    'treatment_steps',
    'medical_solutions',
    'desi_solutions',
    'recovery_tips',
    'prevention_tips',
    'when_to_seek_expert_help',
    'note_if_unsure'
  ]
};

// Standard OpenAPI format schema (for @google/genai SDK)
const genaiOpenApiSchema = {
  type: 'OBJECT',
  properties: {
    is_plant: { type: 'BOOLEAN' },
    plant_name: { type: 'STRING' },
    scientific_name: { type: 'STRING' },
    is_healthy: { type: 'BOOLEAN' },
    condition_name: { type: 'STRING' },
    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
    description: { type: 'STRING' },
    symptoms: { type: 'ARRAY', items: { type: 'STRING' } },
    causes: { type: 'ARRAY', items: { type: 'STRING' } },
    treatment_steps: { type: 'ARRAY', items: { type: 'STRING' } },
    medical_solutions: { type: 'ARRAY', items: { type: 'STRING' } },
    desi_solutions: { type: 'ARRAY', items: { type: 'STRING' } },
    recovery_tips: { type: 'ARRAY', items: { type: 'STRING' } },
    prevention_tips: { type: 'ARRAY', items: { type: 'STRING' } },
    when_to_seek_expert_help: { type: 'STRING' },
    note_if_unsure: { type: 'STRING' }
  },
  required: [
    'is_plant',
    'plant_name',
    'scientific_name',
    'is_healthy',
    'condition_name',
    'confidence',
    'description',
    'symptoms',
    'causes',
    'treatment_steps',
    'medical_solutions',
    'desi_solutions',
    'recovery_tips',
    'prevention_tips',
    'when_to_seek_expert_help',
    'note_if_unsure'
  ]
};

// Helper function to call Gemini model with retry on invalid JSON
async function callGeminiWithFallback(apiKey, base64Data, mimeType, targetLanguage) {
  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const systemPrompt = getSystemPrompt(targetLanguage);
  const userPrompt = `Analyze this image according to your instructions. Selected language for all output text is: ${targetLanguage}.`;

  let lastError = null;

  for (const modelName of modelsToTry) {
    // Attempt with @google/genai first
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || 'image/jpeg'
                }
              },
              { text: userPrompt }
            ]
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: genaiOpenApiSchema
        }
      });

      const responseText = response.text?.trim() || '';
      return JSON.parse(responseText);
    } catch (err) {
      lastError = err;
      // If error is 429 / RESOURCE_EXHAUSTED, don't try other models, propagate directly
      if (isRateLimitError(err)) {
        throw err;
      }

      // If @google/genai failed, try @google/generative-ai for this model
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
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
        return JSON.parse(responseText);
      } catch (genAiErr) {
        lastError = genAiErr;
        if (isRateLimitError(genAiErr)) {
          throw genAiErr;
        }
        // Continue to next model if model not found
        console.warn(`Attempt with ${modelName} failed:`, genAiErr.message);
      }
    }
  }

  throw lastError;
}

function isRateLimitError(err) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode || (err?.response && err?.response.status);
  return status === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

// Ensure non-plant result sanitization
function sanitizeResult(raw) {
  if (!raw.is_plant) {
    return {
      is_plant: false,
      plant_name: '',
      scientific_name: '',
      is_healthy: false,
      condition_name: '',
      confidence: 'low',
      description: '',
      symptoms: [],
      causes: [],
      treatment_steps: [],
      medical_solutions: [],
      desi_solutions: [],
      recovery_tips: [],
      prevention_tips: [],
      when_to_seek_expert_help: '',
      note_if_unsure: ''
    };
  }

  return {
    is_plant: true,
    plant_name: raw.plant_name || '',
    scientific_name: raw.scientific_name || '',
    is_healthy: Boolean(raw.is_healthy),
    condition_name: raw.condition_name || (raw.is_healthy ? 'Healthy' : 'Unknown Condition'),
    confidence: ['high', 'medium', 'low'].includes(raw.confidence?.toLowerCase()) ? raw.confidence.toLowerCase() : 'medium',
    description: raw.description || '',
    symptoms: Array.isArray(raw.symptoms) ? raw.symptoms : [],
    causes: Array.isArray(raw.causes) ? raw.causes : [],
    treatment_steps: Array.isArray(raw.treatment_steps) ? raw.treatment_steps : [],
    medical_solutions: Array.isArray(raw.medical_solutions) ? raw.medical_solutions : [],
    desi_solutions: Array.isArray(raw.desi_solutions) ? raw.desi_solutions : [],
    recovery_tips: Array.isArray(raw.recovery_tips) ? raw.recovery_tips : [],
    prevention_tips: Array.isArray(raw.prevention_tips) ? raw.prevention_tips : [],
    when_to_seek_expert_help: raw.when_to_seek_expert_help || '',
    note_if_unsure: raw.note_if_unsure || ''
  };
}

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
  const { image, mimeType, language } = req.body;

  // Validate API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
    return res.status(401).json({
      error: 'GEMINI_API_KEY is not configured. Please add your free Google Gemini API key to server/.env'
    });
  }

  // Validate request inputs
  if (!image) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  // Clean base64 string (strip data:image/...;base64, prefix if present)
  let base64Data = image;
  let detectedMime = mimeType || 'image/jpeg';
  if (image.startsWith('data:')) {
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      detectedMime = matches[1];
      base64Data = matches[2];
    } else {
      const commaIdx = image.indexOf(',');
      if (commaIdx !== -1) {
        base64Data = image.slice(commaIdx + 1);
      }
    }
  }

  const selectedLanguage = language || 'English';

  // Try calling Gemini, with 1 retry on JSON parsing error
  let result = null;
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const rawResult = await callGeminiWithFallback(apiKey, base64Data, detectedMime, selectedLanguage);
      result = sanitizeResult(rawResult);
      break;
    } catch (err) {
      console.error(`Attempt ${attempt} error:`, err.message || err);

      // Handle Rate Limit (429)
      if (isRateLimitError(err)) {
        return res.status(429).json({
          error: 'Too many requests, try again in a minute'
        });
      }

      // Handle Invalid API key
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        return res.status(401).json({
          error: 'Your Google Gemini API key is invalid. Please verify the key in server/.env.'
        });
      }

      // Handle network failure
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || (err.message && err.message.includes('fetch failed'))) {
        return res.status(503).json({
          error: 'Network failure while connecting to Gemini AI service. Please check your internet connection.'
        });
      }

      // If it's a JSON parse error and we haven't retried yet, retry once
      if ((err instanceof SyntaxError || (err.message && err.message.includes('JSON'))) && attempt < maxAttempts) {
        console.log('JSON parse error from Gemini, retrying once...');
        continue;
      }

      // If reached last attempt, return detailed error
      if (attempt >= maxAttempts) {
        return res.status(500).json({
          error: err.message || 'Failed to analyze image. Please try again with a clearer image.'
        });
      }
    }
  }

  return res.json(result);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE');
  res.json({ status: 'ok', keyConfigured: hasKey });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌿 Plant Doctor server running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log(`⚠️  Warning: GEMINI_API_KEY is not set in server/.env. Please configure your key.`);
  }
});
