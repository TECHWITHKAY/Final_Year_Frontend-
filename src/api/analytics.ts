import api from './axios';

export const getMonthlyTrend = (commodityId: string, months = 12) =>
  api.get(`/analytics/trends/${commodityId}`, { params: { months } });

export const getCityComparison = (commodityId: string) =>
  api.get(`/analytics/city-comparison/${commodityId}`);

export const getVolatility = () => api.get('/analytics/volatility');

export const getInflation = (commodityId: string) =>
  api.get(`/analytics/inflation/${commodityId}`);

export const getForecast = (commodityId: string) =>
  api.get(`/analytics/forecast/${commodityId}`);

export const getDataQuality = () => api.get('/analytics/data-quality');
