import api from './axios';

export const getAllPriceRecords         = (page=0, size=20) =>
  api.get('/price-records', { params: { page, size } });

export const getPriceRecordById         = (id: string)          => api.get(`/price-records/${id}`);
export const getPriceRecordsByCommodity = (commodityId: string) => api.get(`/price-records/commodity/${commodityId}`);
export const getPriceRecordsByMarket    = (marketId: string)    => api.get(`/price-records/market/${marketId}`);
export const createPriceRecord          = (data: any)   => api.post('/price-records', data);
export const submitPriceRecord          = createPriceRecord;
export const updatePriceRecord          = (id: string, data: any)=> api.put(`/price-records/${id}`, data);
export const deletePriceRecord          = (id: string)          => api.delete(`/price-records/${id}`);

// Field Agent / Admin
export const approvePriceRecord         = (id: string, data: any) => api.post(`/price-records/${id}/approve`, data);
export const getPendingRecords          = ()            => api.get('/price-records/pending');
export const getMySubmissions           = ()            => api.get('/price-records/my-submissions');
