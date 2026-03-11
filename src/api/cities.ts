import api from './axios';

export const getCities = () => api.get('/cities');
