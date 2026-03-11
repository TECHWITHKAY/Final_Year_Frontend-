import api from './axios';

export const getSeasonalPatterns   = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}`);

export const getBestMonthToBuy     = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}/best-month`);

export const getWorstMonthToBuy    = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}/worst-month`);

export const getCurrentOutlook     = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}/outlook`);

export const recomputeAllPatterns  = ()             => api.post('/seasonal/recompute');
export const recomputeForCommodity = (commodityId: string)  => api.post(`/seasonal/recompute/${commodityId}`);
