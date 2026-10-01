import api from './api';

export const getWeather = async (city) => {
  try {
    const response = await api.get('/weather', { 
      params: { city } 
    });
    return response.data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw error;
  }
};

export const getForecast = async (city) => {
  try {
    const response = await api.get('/weather/forecast', { 
      params: { city } 
    });
    return response.data;
  } catch (error) {
    console.error('Forecast fetch error:', error);
    throw error;
  }
};