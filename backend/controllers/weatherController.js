const { getWeather: fetchWeather, getForecast: fetchForecast } = require('../services/weatherService');

// @desc    Get current weather for a city
// @route   GET /api/weather
exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;
    const userCity = city || req.user.location?.city || 'London';
    
    const weatherData = await fetchWeather(userCity);
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
    const { city } = req.query;
    const userCity = city || req.user.location?.city || 'London';
    
    const forecastData = await fetchForecast(userCity);
    res.status(200).json(forecastData);
  } catch (error) {
    console.error('Forecast controller error:', error);
    next(error);
  }
};