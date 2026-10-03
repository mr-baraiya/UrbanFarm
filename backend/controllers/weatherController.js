const { getWeather: fetchWeather, getForecast: fetchForecast } = require('../services/weatherService');

const getValidCity = (req) => {
  const cityQuery = req.query?.city?.trim();
  const userCity = req.user?.location?.city?.trim();
  const invalidCities = ['balcony', 'rooftop', 'indoor', 'backyard', 'windowsill', 'community', ''];
  
  let target = cityQuery || userCity;
  if (!target || invalidCities.includes(target.toLowerCase())) {
    return 'Mumbai';
  }
  return target;
};

// @desc    Get current weather for a city
// @route   GET /api/weather
exports.getWeather = async (req, res, next) => {
  try {
    const city = getValidCity(req);
    const weatherData = await fetchWeather(city);
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Weather controller error:', error);
    next(error);
  }
};

// @desc    Get weather forecast for a city
// @route   GET /api/weather/forecast
exports.getForecast = async (req, res, next) => {
  try {
    const city = getValidCity(req);
    const forecastData = await fetchForecast(city);
    res.status(200).json(forecastData);
  } catch (error) {
    console.error('Forecast controller error:', error);
    next(error);
  }
};