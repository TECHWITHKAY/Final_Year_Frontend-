import api from './axios';

export const getDashboardSummary   = ()               => api.get('/public/dashboard-summary');
export const getLatestPrices       = (params={})      => api.get('/public/latest-prices', { params });
export const getPriceRange         = (commodityId: string, cityId?: string) =>
  api.get(`/public/price-range/${commodityId}`, { params: { cityId } });
export const getCommoditySpotlight = (commodityId: string)    => api.get(`/public/commodity-spotlight/${commodityId}`);
