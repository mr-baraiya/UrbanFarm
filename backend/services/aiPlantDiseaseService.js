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

    // Return a more informative fallback
    return getFallbackResponse(error.message);
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
  return 'A plant disease has been detected. Please consult a local plant expert for accurate diagnosis and treatment.';
}

function getFallbackResponse(errorMessage = '') {
  return {
    disease: `Unable to identify (${errorMessage || 'API error'})`,
    confidence: 0,
    treatment: 'Please consult a local plant expert or try again later.',
    description: `The disease identification service is temporarily unavailable. Error: ${errorMessage || 'Unknown error'}`,
    isHealthy: false,
  };
}