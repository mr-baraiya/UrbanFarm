import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RiSunLine, 
  RiMoonLine, 
  RiSunCloudyLine, 
  RiCloudLine, 
  RiRainyLine, 
  RiThunderstormsLine, 
  RiSnowyLine, 
  RiMistLine, 
  RiDropLine, 
  RiWindyLine, 
  RiMapPin2Line, 
  RiCalendar2Line, 
  RiCloseLine,
  RiCheckLine
} from 'react-icons/ri';
import { TbPlant2 } from 'react-icons/tb';
import { getForecast } from '../../services/weatherService';
import './WeatherWidget.css';

const WeatherWidget = ({ weather, loading, city }) => {
  const { t } = useTranslation();
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Get modern weather SVG icon based on openweather icon code
  const getWeatherIcon = (iconCode) => {
    switch (iconCode) {
      case '01d':
        return <RiSunLine className="weather-svg-icon sunny" />;
      case '01n':
        return <RiMoonLine className="weather-svg-icon night" />;
      case '02d':
      case '02n':
        return <RiSunCloudyLine className="weather-svg-icon partly-cloudy" />;
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return <RiCloudLine className="weather-svg-icon cloudy" />;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return <RiRainyLine className="weather-svg-icon rainy" />;
      case '11d':
      case '11n':
        return <RiThunderstormsLine className="weather-svg-icon storm" />;
      case '13d':
      case '13n':
        return <RiSnowyLine className="weather-svg-icon snowy" />;
      case '50d':
      case '50n':
        return <RiMistLine className="weather-svg-icon mist" />;
      default:
        return <RiSunCloudyLine className="weather-svg-icon partly-cloudy" />;
    }
  };

  // Get weather advice based on conditions
  const getWeatherAdvice = (temp, condition, humidity) => {
    if (temp > 30) {
      return (
        <>
          <RiSunLine className="weather-advice-icon heat" />
          <span>{t('dashboard.weatherHighHeatAdvice')}</span>
        </>
      );
    }
    if (condition && condition.toLowerCase().includes('rain')) {
      return (
        <>
          <RiRainyLine className="weather-advice-icon rain" />
          <span>{t('dashboard.weatherRainAdvice')}</span>
        </>
      );
    }
    if (temp < 5) {
      return (
        <>
          <RiSnowyLine className="weather-advice-icon frost" />
          <span>{t('dashboard.weatherFrostAdvice')}</span>
        </>
      );
    }
    if (humidity < 30) {
      return (
        <>
          <RiWindyLine className="weather-advice-icon dry" />
          <span>{t('dashboard.weatherLowHumidityAdvice')}</span>
        </>
      );
    }
    return (
      <>
        <TbPlant2 className="weather-advice-icon optimal" />
        <span>{t('dashboard.weatherIdealAdvice')}</span>
      </>
    );
  };

  const handleOpenForecast = async () => {
    setShowForecast(true);
    if (!forecastData) {
      setLoadingForecast(true);
      try {
        const cityName = city || weather?.name || 'London';
        const res = await getForecast(cityName);
        setForecastData(res);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setLoadingForecast(false);
      }
    }
  };

  if (loading) {
    return <div className="weather-widget loading">{t('common.loading')}</div>;
  }

  if (!weather) {
    return (
      <div className="weather-widget">
        <div className="weather-icon-wrap">
          <RiSunCloudyLine className="weather-svg-icon partly-cloudy" />
        </div>
        <div className="weather-info">
          <span className="weather-temp">--°C</span>
          <span className="weather-condition">{t('dashboard.weatherUnavailable')}</span>
        </div>
      </div>
    );
  }

  const temp = Math.round(weather.main?.temp || 0);
  const condition = weather.weather?.[0]?.description || 'Clear';
  const humidity = weather.main?.humidity || 0;
  const windSpeed = weather.wind?.speed || 0;
  const icon = weather.weather?.[0]?.icon || '01d';

  return (
    <>
      <div className="weather-widget">
        <div className="weather-main">
          <div className="weather-icon-wrap">
            {getWeatherIcon(icon)}
          </div>
          <div className="weather-temp-info">
            <span className="weather-temp">{temp}°C</span>
            <span className="weather-condition">{condition}</span>
          </div>
          <button 
            className="btn-forecast-toggle" 
            onClick={handleOpenForecast} 
            title={t('dashboard.view7DayForecast')}
          >
            <RiCalendar2Line className="btn-icon" /> {t('dashboard.view7DayForecast')}
          </button>
        </div>
        <div className="weather-details">
          <span className="weather-humidity">
            <RiDropLine className="detail-icon blue" /> {humidity}%
          </span>
          <span className="weather-wind">
            <RiWindyLine className="detail-icon cyan" /> {windSpeed} m/s
          </span>
          {weather.name && (
            <span className="weather-city">
              <RiMapPin2Line className="detail-icon red" /> {weather.name}
            </span>
          )}
        </div>
        <div className="weather-advice">
          {getWeatherAdvice(temp, condition, humidity)}
        </div>
      </div>

      {showForecast && (
        <div className="forecast-modal-overlay" onClick={() => setShowForecast(false)}>
          <div className="forecast-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="forecast-modal-header">
              <h3>
                <RiSunCloudyLine className="forecast-header-icon" /> {t('dashboard.forecastTitle')} ({city || weather?.name || 'Local'})
              </h3>
              <button className="forecast-close-btn" onClick={() => setShowForecast(false)} aria-label={t('common.close')}>
                <RiCloseLine />
              </button>
            </div>
            <div className="forecast-modal-body">
              {loadingForecast ? (
                <div className="forecast-loading">{t('dashboard.loadingForecast')}</div>
              ) : forecastData?.list ? (
                <div className="forecast-list">
                  {forecastData.list.slice(0, 7).map((item, idx) => {
                    const fTemp = Math.round(item.main?.temp || 0);
                    const fCond = item.weather?.[0]?.description || 'Clear';
                    const fIcon = item.weather?.[0]?.icon || '01d';
                    const fHum = item.main?.humidity || 0;
                    const fLabel = item.dt_txt || `Day ${idx + 1}`;

                    return (
                      <div key={idx} className="forecast-day-card">
                        <div className="f-day-name">{fLabel}</div>
                        <div className="f-icon-wrap">{getWeatherIcon(fIcon)}</div>
                        <div className="f-temp">{fTemp}°C</div>
                        <div className="f-condition">{fCond}</div>
                        <div className="f-humidity">
                          <RiDropLine className="f-hum-icon" /> {fHum}%
                        </div>
                        <div className="f-advice">
                          {fTemp > 28 ? (
                            <span className="advice-pill heat"><RiDropLine /> {t('dashboard.waterHeavy')}</span>
                          ) : fCond.includes('rain') ? (
                            <span className="advice-pill rain"><RiRainyLine /> {t('dashboard.naturalRain')}</span>
                          ) : (
                            <span className="advice-pill optimal"><RiCheckLine /> {t('dashboard.optimal')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="forecast-empty">{t('dashboard.forecastUnavailable')}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherWidget;