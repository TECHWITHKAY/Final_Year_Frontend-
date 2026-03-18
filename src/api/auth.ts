import api from './axios';

export const login = (data: any) =>
  api.post('/auth/login', data);

export const register = (data: any) =>
  api.post('/auth/register', data);

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const validateResetToken = (token: string) =>
  api.get(`/auth/reset-password/validate?token=${token}`);

export const resetPassword = (data: any) =>
  api.post('/auth/reset-password', data);

export const registerAgent = (data: any) =>
  api.post('/auth/register-agent', data);
