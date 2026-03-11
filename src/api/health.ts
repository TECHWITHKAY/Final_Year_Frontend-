import api from './axios';

export const getHealthScores = () => api.get('/health');
export const recomputeHealth = () => api.post('/health/recompute');
