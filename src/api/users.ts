import api from './axios';

export const getAllUsers = () => 
  api.get('/users');

export const setUserStatus = (userId: number, active: boolean) => 
  api.post(`/users/${userId}/status?active=${active}`);
