import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RiDropLine } from 'react-icons/ri';
import { getPlants } from '../../services/plantService';
import { getWeather, getForecast } from '../../services/weatherService';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import TomatoIoTHub from './TomatoIoTHub';
import './WateringTab.css';

const DEFAULT_PRIYA_TOMATO = {
  _id: 'tomato-01',
  name: 'Tomato (Balcony Garden)',
  variety: 'Sweet 100 Cherry & Roma',
  status: 'healthy',
  gardenId: { name: "Priya's Balcony Farm" },
  imageUrl: '/demo/priya_tomato_plant.jpg',
  waterFrequency: 2,
  sunlight: 'Full Sun',
};

const WateringTab = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tomatoPlant, setTomatoPlant] = useState(DEFAULT_PRIYA_TOMATO);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
    fetchWeather();

    const handleRefresh = () => {
      loadData();
    };
    window.addEventListener('urbanfarm:refresh-data', handleRefresh);
    return () => window.removeEventListener('urbanfarm:refresh-data', handleRefresh);
  }, [user]);

  const loadData = async () => {
    try {
      const plantsData = await getPlants();
      const validPlants = plantsData || [];
      const tomato = validPlants.find((p) => {
        const n = (p.name || '').toLowerCase();
        const v = (p.variety || '').toLowerCase();
        return (
          n.includes('tomato') ||
          n.includes('ટામેટા') ||
          n.includes('ટમેટા') ||
          n.includes('टमाटर') ||
          v.includes('tomato') ||
          v.includes('cherry') ||
          v.includes('roma') ||
          p._id === 'tomato-01'
        );
      });

      if (tomato) {
        setTomatoPlant(tomato);
      } else if (validPlants.length > 0) {
        // Prioritize any plant that has an image or the first plant
        const plantWithImage = validPlants.find((p) => p.imageUrl) || validPlants[0];
        setTomatoPlant(plantWithImage);
      } else {
        setTomatoPlant(DEFAULT_PRIYA_TOMATO);
      }
    } catch (error) {
      console.error('Failed to load plant data:', error);
      setTomatoPlant(DEFAULT_PRIYA_TOMATO);
    }
  };

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const city = user?.location?.city || 'London';
      const [weather, forecast] = await Promise.all([
        getWeather(city),
        getForecast(city),
      ]);
      setWeatherData(weather);
      setForecastData(forecast);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <div className="watering-tab">
      {/* Standard UrbanFarm Page Header */}
      <div className="crop-page-header">
        <div className="crop-header-badge">
          <RiDropLine size={15} className="header-badge-icon" />
          <span>{t('watering.badge', 'IoT Precision Irrigation & Telemetry')}</span>
        </div>
        <h2>{t('watering.title', 'Smart Irrigation & Agronomy Hub')}</h2>
        <p className="subtitle">
          {t('watering.subtitle', 'Live ESP32 root-zone telemetry, real-time weather forecasting & Gemini AI watering decisions.')}
        </p>
      </div>

      {/* Dedicated Tomato IoT Station & Farmer Actuator Hub */}
      <TomatoIoTHub 
        plant={tomatoPlant}
        weather={weatherData}
        forecast={forecastData}
        onScheduleUpdate={loadData}
        onWateringComplete={() => {
          loadData();
        }}
      />
    </div>
  );
};

export default WateringTab;