const axios = require('axios');
const aiConfig = require('../config/aiConfig');

/**
 * Fetch current weather and forecast for a given city/coordinates
 */
exports.getWeather = async (city, units = 'metric') => {
  try {
    const response = await axios.get(
      `${aiConfig.openweather.baseUrl}/weather`,
      {
        params: {
          q: city,
          appid: aiConfig.openweather.apiKey,
          units,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
};

exports.getForecast = async (city, units = 'metric') => {
  try {
    const response = await axios.get(
      `${aiConfig.openweather.baseUrl}/forecast`,
      {
        params: {
          q: city,
          appid: aiConfig.openweather.apiKey,
          units,
          cnt: 7, // 7 days
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Forecast API error:', error.message);
    throw new Error('Failed to fetch forecast data');
  }
};