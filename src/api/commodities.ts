import api from './axios';

export const getCommodities = () => api.get('/commodities');
export const getCommodity = (id: string) => api.get(`/commodities/${id}`);
