import api from './axios';

export const getMarkets = () => api.get('/markets');
export const getMarket = (id: string) => api.get(`/markets/${id}`);
