import api from './axios';

export const getAllMarkets     = ()          => api.get('/markets');
export const getMarkets        = getAllMarkets;
export const getMarketById     = (id: string)        => api.get(`/markets/${id}`);
export const getMarket         = getMarketById;
export const getMarketsByCity  = (cityId: string)    => api.get(`/markets/city/${cityId}`);
