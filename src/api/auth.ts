import api from './axios';

export const login = (credentials: { username: string; password: string }) =>
  api.post('/auth/login', credentials);

export const register = (data: { fullName: string; username: string; email: string; password: string }) =>
  api.post('/auth/register', data);

export const getProfile = () => api.get('/auth/profile');
