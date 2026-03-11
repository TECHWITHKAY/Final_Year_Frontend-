import api from './axios';

export const getLatestPrices = (params?: Record<string, any>) =>
  api.get('/public/latest-prices', { params });

export const getDashboardSummary = () =>
  api.get('/public/dashboard-summary');

export const getPriceRange = (commodityId: string) =>
  api.get(`/public/price-range/${commodityId}`);

export const getPendingRecords = () =>
  api.get('/price-records/pending');

export const getMySubmissions = () =>
  api.get('/price-records/my-submissions');

export const submitPriceRecord = (data: any) =>
  api.post('/price-records', data);

export const approvePriceRecord = (id: string, data: { approved: boolean; rejectionReason?: string }) =>
  api.post(`/price-records/${id}/approve`, data);
