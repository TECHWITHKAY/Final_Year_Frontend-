import api from './axios';

export const getAllUsers = () => 
  api.get('/users');

export const setUserStatus = (userId: number, active: boolean) => 
  api.post(`/users/${userId}/status?active=${active}`);

// ── ADMIN: FIELD AGENT APPLICATIONS ────────────────────────────────────────

export const getPendingAgents = () =>
  api.get('/admin/users/pending-agents');

export const approveAgent = (id: number) =>
  api.post(`/admin/users/${id}/approve-agent`);

export const rejectAgent = (id: number, reason?: string) =>
  api.post(`/admin/users/${id}/reject-agent${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`);
