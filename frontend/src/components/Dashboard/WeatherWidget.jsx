import React from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ weather, loading }) => {
  if (loading) {
    return <div className="weather-widget loading">Loading weather...</div>;
  }

  if (!weather) {
    return (
      <div className="weather-widget">
        <span className="weather-icon">🌤️</span>
        <div className="weather-info">
          <span className="weather-temp">--°C</span>
          <span className="weather-condition">Weather unavailable</span>
        </div>
      </div>
    );
  }

  const temp = Math.round(weather.main?.temp || 0);
  const condition = weather.weather?.[0]?.description || 'Unknown';
  const humidity = weather.main?.humidity || 0;
  const windSpeed = weather.wind?.speed || 0;
  const icon = weather.weather?.[0]?.icon || '01d';

  // Get weather emoji based on condition
  const getWeatherEmoji = (iconCode) => {
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
    return map[iconCode] || '🌤️';
  };

  // Get weather advice based on conditions
  const getWeatherAdvice = (temp, condition, humidity) => {
    if (temp > 30) {
      return '☀️ High heat! Water plants in the morning or evening.';
    }
    if (condition.toLowerCase().includes('rain')) {
      return '🌧️ Rain expected. Skip watering today.';
    }
    if (temp < 5) {
      return '❄️ Frost risk! Protect sensitive plants.';
    }
    if (humidity < 30) {
      return '💨 Low humidity. Consider misting your plants.';
    }
    if (condition.toLowerCase().includes('clear') && temp > 25) {
      return '☀️ High UV today! Water tomatoes in the morning.';
    }
    return '🌱 Perfect conditions for your garden!';
  };

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <span className="weather-emoji">{getWeatherEmoji(icon)}</span>
        <div className="weather-temp-info">
          <span className="weather-temp">{temp}°C</span>
          <span className="weather-condition">{condition}</span>
        </div>
      </div>
      <div className="weather-details">
        <span className="weather-humidity">💧 {humidity}%</span>
        <span className="weather-wind">💨 {windSpeed} m/s</span>
      </div>
      <div className="weather-advice">{getWeatherAdvice(temp, condition, humidity)}</div>
    </div>
  );
};

export default WeatherWidget;