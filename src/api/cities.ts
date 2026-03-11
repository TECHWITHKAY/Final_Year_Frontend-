import api from './axios';

export const getAllCities      = ()        => api.get('/cities');
export const getCityById       = (id: string)      => api.get(`/cities/${id}`);
export const getCitiesByRegion = (region: string)  => api.get(`/cities/region/${region}`);
