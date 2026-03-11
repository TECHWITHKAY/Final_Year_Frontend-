import api from './axios';

// Returns a blob — handle with URL.createObjectURL in the component
export const exportPriceRecords = (filters: any) =>
  api.post('/export/price-records', filters, { responseType: 'blob' });

export const getMyExportHistory  = ()       => api.get('/export/my-exports');
export const getAllExportHistory = (page=0) => api.get('/export/all-exports', { params: { page } });
