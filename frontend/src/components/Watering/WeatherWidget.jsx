import React from 'react';
import './WeatherWidget.css';

const WeatherWidget = ({ weather, forecast, loading }) => {
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

  // Get weather emoji
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

  // Get weather advice for watering
  const getWateringAdvice = (temp, condition, humidity, forecast) => {
    const rainToday = forecast?.list?.[0]?.rain?.['3h'] || 0;
    
    if (rainToday > 5) {
      return '🌧️ Rain expected today - skip watering!';
    }
    if (temp > 35) {
      return '☀️ Extreme heat - water in the evening!';
    }
    if (temp > 30) {
      return '☀️ Hot day - consider extra watering';
    }
    if (humidity > 80) {
      return '💧 High humidity - reduce watering';
    }
    if (humidity < 30) {
      return '💨 Low humidity - increase misting';
    }
    return '🌱 Optimal conditions - follow schedule';
  };

  const advice = getWateringAdvice(temp, condition, humidity, forecast);

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <span className="weather-emoji">{getWeatherEmoji(icon)}</span>
        <div className="weather-temp-info">
          <span className="weather-temp">{temp}°C</span>
          <span className="weather-condition">{condition}</span>
        </div>
        <div className="weather-details">
          <span className="weather-humidity">💧 {humidity}%</span>
          <span className="weather-wind">💨 {windSpeed} m/s</span>
        </div>
      </div>
      <div className="weather-advice">
        <span className="advice-icon">💡</span>
        <span className="advice-text">{advice}</span>
      </div>
      {forecast && forecast.list && (
        <div className="weather-forecast">
          <span className="forecast-label">3-Day Forecast:</span>
          <div className="forecast-days">
            {forecast.list.slice(0, 3).map((day, idx) => {
              const dayTemp = Math.round(day.main?.temp || 0);
              const dayRain = day.rain?.['3h'] || 0;
              const dayIcon = day.weather?.[0]?.icon || '01d';
              return (
                <div key={idx} className="forecast-day">
                  <span className="forecast-emoji">{getWeatherEmoji(dayIcon)}</span>
                  <span className="forecast-temp">{dayTemp}°C</span>
                  {dayRain > 0 && (
                    <span className="forecast-rain">🌧️</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;