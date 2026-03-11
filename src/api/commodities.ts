import api from './axios';

export const getAllCommodities        = ()    => api.get('/commodities');
export const getCommodities           = getAllCommodities; // Legacy alias for stale cache
export const getCommodityById         = (id: string)  => api.get(`/commodities/${id}`);
export const getCommodity             = getCommodityById;
export const getCommoditiesByCategory = (cat: string) => api.get(`/commodities/category/${cat}`);
