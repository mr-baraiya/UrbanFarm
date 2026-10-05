import api from './api';

/**
 * Fetch latest available market prices from backend API proxy
 */
export const getMarketPrices = async (forceRefresh = false) => {
  const response = await api.get(`/market/prices${forceRefresh ? '?refresh=true' : ''}`);
  return response.data;
};
