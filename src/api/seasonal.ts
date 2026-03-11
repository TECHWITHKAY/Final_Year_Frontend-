import api from './axios';

export const getSeasonalData = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}`);

export const getSeasonalOutlook = (commodityId: string) =>
  api.get(`/seasonal/${commodityId}/outlook`);

export const recomputeSeasonal = () => api.post('/seasonal/recompute');
