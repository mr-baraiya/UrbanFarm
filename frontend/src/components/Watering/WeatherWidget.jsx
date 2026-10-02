import React from 'react';
import { 
  RiSunLine, 
  RiMoonLine, 
  RiSunCloudyLine, 
  RiCloudyLine, 
  RiRainyLine, 
  RiDrizzleLine, 
  RiThunderstormsLine, 
  RiSnowyLine, 
  RiMistLine, 
  RiDropLine, 
  RiWindyLine, 
  RiLightbulbLine,
  RiLeafLine,
  RiAlertLine
} from 'react-icons/ri';
import './WeatherWidget.css';

const WeatherWidget = ({ weather, forecast, loading }) => {
  if (loading) {
    return <div className="weather-widget loading">Loading weather...</div>;
  }

  if (!weather) {
    return (
      <div className="weather-widget">
        <span className="weather-icon">
          <RiSunCloudyLine />
        </span>
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

  // Get weather SVG Icon
  const getWeatherIcon = (iconCode) => {
    switch (iconCode) {
      case '01d': return <RiSunLine style={{ color: '#f59e0b' }} />;
      case '01n': return <RiMoonLine style={{ color: '#818cf8' }} />;
      case '02d': return <RiSunCloudyLine style={{ color: '#f59e0b' }} />;
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n': return <RiCloudyLine style={{ color: '#64748b' }} />;
      case '09d':
      case '09n': return <RiRainyLine style={{ color: '#38bdf8' }} />;
      case '10d':
      case '10n': return <RiDrizzleLine style={{ color: '#38bdf8' }} />;
      case '11d':
      case '11n': return <RiThunderstormsLine style={{ color: '#eab308' }} />;
      case '13d':
      case '13n': return <RiSnowyLine style={{ color: '#93c5fd' }} />;
      case '50d':
      case '50n': return <RiMistLine style={{ color: '#94a3b8' }} />;
      default: return <RiSunCloudyLine style={{ color: '#f59e0b' }} />;
    }
  };

  // Get weather advice for watering
  const getWateringAdvice = (temp, condition, humidity, forecast) => {
    const rainToday = forecast?.list?.[0]?.rain?.['3h'] || 0;
    
    if (rainToday > 5) {
      return { icon: <RiRainyLine style={{ color: '#38bdf8' }} />, text: 'Rain expected today - skip watering!' };
    }
    if (temp > 35) {
      return { icon: <RiAlertLine style={{ color: '#ef4444' }} />, text: 'Extreme heat - water in the evening!' };
    }
    if (temp > 30) {
      return { icon: <RiSunLine style={{ color: '#f59e0b' }} />, text: 'Hot day - consider extra watering' };
    }
    if (humidity > 80) {
      return { icon: <RiDropLine style={{ color: '#0ea5e9' }} />, text: 'High humidity - reduce watering' };
    }
    if (humidity < 30) {
      return { icon: <RiWindyLine style={{ color: '#f97316' }} />, text: 'Low humidity - increase misting' };
    }
    return { icon: <RiLeafLine style={{ color: '#10b981' }} />, text: 'Optimal conditions - follow schedule' };
  };

  const adviceObj = getWateringAdvice(temp, condition, humidity, forecast);

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <span className="weather-emoji" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '2rem' }}>
          {getWeatherIcon(icon)}
        </span>
        <div className="weather-temp-info">
          <span className="weather-temp">{temp}°C</span>
          <span className="weather-condition" style={{ textTransform: 'capitalize' }}>{condition}</span>
        </div>
        <div className="weather-details">
          <span className="weather-humidity" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <RiDropLine style={{ color: '#0ea5e9' }} /> {humidity}%
          </span>
          <span className="weather-wind" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <RiWindyLine style={{ color: '#64748b' }} /> {windSpeed} m/s
          </span>
        </div>
      </div>
      <div className="weather-advice">
        <span className="advice-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <RiLightbulbLine style={{ color: '#eab308' }} />
        </span>
        <span className="advice-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          {adviceObj.icon} {adviceObj.text}
        </span>
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
                <div key={idx} className="forecast-day" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span className="forecast-emoji" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {getWeatherIcon(dayIcon)}
                  </span>
                  <span className="forecast-temp">{dayTemp}°C</span>
                  {dayRain > 0 && (
                    <span className="forecast-rain" title="Rain expected" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <RiRainyLine style={{ color: '#38bdf8', fontSize: '0.8rem' }} />
                    </span>
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