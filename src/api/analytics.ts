import api from './axios';

export const getMonthlyTrend      = (commodityId: string, months=12) =>
  api.get(`/analytics/trends/${commodityId}`, { params: { months } });

export const getCityComparison    = (commodityId: string) =>
  api.get(`/analytics/city-comparison/${commodityId}`);

export const getPriceVolatility   = () => api.get('/analytics/volatility');

export const getInflationTrend    = (commodityId: string) =>
  api.get(`/analytics/inflation/${commodityId}`);

export const getForecast          = (commodityId: string) =>
  api.get(`/analytics/forecast/${commodityId}`);

export const getDataQualityReport = () => api.get('/analytics/data-quality');
