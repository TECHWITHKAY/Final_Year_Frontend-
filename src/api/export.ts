import api from './axios';

export const exportPriceRecords = (data: any) =>
  api.post('/export/price-records', data, { responseType: 'blob' });

export const getMyExports = () => api.get('/export/my-exports');
