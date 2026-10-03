const axios = require('axios');
const aiConfig = require('../config/aiConfig');

// Helper mock generator for fallback weather when API key is missing or invalid
const getMockWeather = (city) => {
  return {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }
    ],
    main: {
      temp: 22,
      feels_like: 22,
      temp_min: 18,
      temp_max: 25,
      pressure: 1015,
      humidity: 55
    },
    wind: { speed: 3.6, deg: 180 },
    name: city || 'Urban Farm',
    sys: { country: 'UF' }
  };
};

const getMockForecast = (city) => {
  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const conditions = [
    { main: 'Clear', description: 'Sunny & mild', icon: '01d', temp: 23, humidity: 50 },
    { main: 'Clouds', description: 'Partly cloudy', icon: '02d', temp: 21, humidity: 58 },
    { main: 'Rain', description: 'Light showers', icon: '10d', temp: 19, humidity: 75 },
    { main: 'Clear', description: 'Clear sky', icon: '01d', temp: 24, humidity: 48 },
    { main: 'Clouds', description: 'Overcast', icon: '04d', temp: 20, humidity: 62 },
    { main: 'Clear', description: 'Sunny', icon: '01d', temp: 25, humidity: 45 },
    { main: 'Rain', description: 'Moderate rain', icon: '09d', temp: 18, humidity: 80 },
  ];

  return {
    city: { name: city || 'Urban Farm' },
    list: days.map((day, idx) => ({
      dt: Date.now() / 1000 + idx * 86400,
      dt_txt: day,
      main: {
        temp: conditions[idx].temp,
        temp_min: conditions[idx].temp - 3,
        temp_max: conditions[idx].temp + 2,
        humidity: conditions[idx].humidity,
      },
      weather: [
        {
          main: conditions[idx].main,
          description: conditions[idx].description,
          icon: conditions[idx].icon,
        }
      ],
      wind: { speed: 3.2 }
    }))
  };
};

/**
 * Fetch current weather and forecast for a given city/coordinates
 */
exports.getWeather = async (city, units = 'metric') => {
  const targetCity = (city && city.trim()) ? city.trim() : 'Mumbai';
  try {
    if (!aiConfig.openweather.apiKey || aiConfig.openweather.apiKey === 'your_openweather_api_key') {
      return getMockWeather(targetCity);
    }
    const response = await axios.get(
      `${aiConfig.openweather.baseUrl}/weather`,
      {
        params: {
          q: targetCity,
          appid: aiConfig.openweather.apiKey,
          units,
        },
      }
    );
    return response.data;
  } catch (error) {
    return getMockWeather(targetCity);
  }
};

exports.getForecast = async (city, units = 'metric') => {
  const targetCity = (city && city.trim()) ? city.trim() : 'Mumbai';
  try {
    if (!aiConfig.openweather.apiKey || aiConfig.openweather.apiKey === 'your_openweather_api_key') {
      return getMockForecast(targetCity);
    }
    const response = await axios.get(
      `${aiConfig.openweather.baseUrl}/forecast`,
      {
        params: {
          q: targetCity,
          appid: aiConfig.openweather.apiKey,
          units,
          cnt: 7, // 7 days
        },
      }
    );
    return response.data;
  } catch (error) {
    return getMockForecast(targetCity);
  }
};