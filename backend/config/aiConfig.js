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
    // ✅ Update to gemini-3.6-flash
    model: 'gemini-3.6-flash',  // <-- CHANGED HERE
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  openweather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },
};

console.log('🔧 AI Config loaded:');
console.log('  Plant.id API Key:', process.env.PLANT_ID_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  OpenWeather API Key:', process.env.OPENWEATHER_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  Gemini Model:', module.exports.gemini.model);