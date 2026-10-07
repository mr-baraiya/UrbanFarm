// Centralized AI service configuration
module.exports = {
  plantId: {
    apiKey: process.env.PLANT_ID_API_KEY,
    baseUrl: 'https://api.plant.id/v2',
    endpoints: {
      healthAssessment: '/health_assessment',
    },
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    visionModel: process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b',
    textModel: process.env.GROQ_TEXT_MODEL || 'openai/gpt-oss-120b',
    baseUrl: 'https://api.groq.com/openai/v1',
  },
  openweather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
};

console.log('🔧 AI Config loaded:');
console.log('  Plant.id API Key:', process.env.PLANT_ID_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  Groq API Key:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  OpenWeather API Key:', process.env.OPENWEATHER_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  Gemini Model:', module.exports.gemini.model);
console.log('  Groq Vision Model:', module.exports.groq.visionModel);