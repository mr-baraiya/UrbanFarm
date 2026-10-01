// Get weather emoji based on condition
export const getWeatherEmoji = (weather) => {
  if (!weather || !weather.weather || !weather.weather[0]) return '🌤️';
  
  const icon = weather.weather[0].icon;
  const map = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return map[icon] || '🌤️';
};

// Get weather advice for gardening
export const getWeatherAdvice = (weather) => {
  if (!weather) return 'Check weather for garden care tips.';
  
  const temp = weather.main?.temp || 0;
  const condition = weather.weather?.[0]?.description?.toLowerCase() || '';
  const humidity = weather.main?.humidity || 0;
  
  if (temp > 30) {
    return '☀️ High heat! Water plants in the morning or evening.';
  }
  if (condition.includes('rain')) {
    return '🌧️ Rain expected. Skip watering today.';
  }
  if (temp < 5) {
    return '❄️ Frost risk! Protect sensitive plants.';
  }
  if (humidity < 30) {
    return '💨 Low humidity. Consider misting your plants.';
  }
  if (condition.includes('clear') && temp > 25) {
    return '☀️ High UV today! Water in the morning.';
  }
  return '🌱 Good conditions for your garden!';
};

// Format weather temperature
export const formatWeatherTemp = (temp) => {
  if (!temp && temp !== 0) return '--°C';
  return `${Math.round(temp)}°C`;
};