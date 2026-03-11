import api from './axios';

export const getAllHealthScores        = ()     => api.get('/health');
export const getHealthScoreForMarket   = (id: string)   => api.get(`/health/${id}`);
export const getTopMarkets             = (n=5)  => api.get('/health/top', { params: { limit: n } });
export const getUnderperformingMarkets = ()     => api.get('/health/underperforming');
export const recomputeHealthScores     = ()     => api.post('/health/recompute');
