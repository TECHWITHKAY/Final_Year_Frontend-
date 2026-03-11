import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = (window as any).__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      (window as any).__authToken = null;
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
