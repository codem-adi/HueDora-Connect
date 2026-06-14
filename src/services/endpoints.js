import api from './api';
import { trimParams } from '../utils/trimInput';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (payload) => api.post('/auth/signup', payload),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const dashboardApi = {
  stats: (params) => api.get('/dashboard/stats', { params: trimParams(params) }),
  clients: () => api.get('/dashboard/clients'),
};

export const campApi = {
  list: (params) => api.get('/camps', { params: trimParams(params) }),
  get: (id) => api.get(`/camps/${id}`),
  create: (payload) => api.post('/camps', payload),
  update: (id, payload) => api.put(`/camps/${id}`, payload),
  submitReview: (id, payload = {}) => api.post(`/camps/${id}/submit-review`, payload),
  approve: (id, payload = {}) => api.post(`/camps/${id}/approve`, payload),
  reject: (id, payload = {}) => api.post(`/camps/${id}/reject`, payload),
  cancel: (id, payload = {}) => api.post(`/camps/${id}/cancel`, payload),
  execute: (id, payload = {}) => api.post(`/camps/${id}/execute`, payload),
  delete: (id) => api.delete(`/camps/${id}`),
  bulkAction: (payload) => api.post('/camps/bulk-action', payload),
};

export const clientApi = {
  list: (params) => api.get('/clients', { params: trimParams(params) }),
  get: (id) => api.get(`/clients/${id}`),
  create: (payload) => api.post('/clients', payload),
  update: (id, payload) => api.put(`/clients/${id}`, payload),
  remove: (id) => api.delete(`/clients/${id}`),
};

export const clientMasterApi = {
  list: (params) => api.get('/client-masters', { params: trimParams(params) }),
  listByClient: (clientId) => api.get(`/client-masters/by-client/${clientId}`),
  listDivisionsByClient: (clientId) => api.get(`/client-masters/by-client/${clientId}/divisions`),
  get: (id) => api.get(`/client-masters/${id}`),
  create: (payload) => api.post('/client-masters', payload),
  update: (id, payload) => api.put(`/client-masters/${id}`, payload),
  remove: (id) => api.delete(`/client-masters/${id}`),
  downloadDocument: (id) => api.get(`/client-masters/${id}/document`, { responseType: 'blob' }),
  uploadDocument: (id, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post(`/client-masters/${id}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDocument: (id) => api.delete(`/client-masters/${id}/document`),
};

export const importApi = {
  fields: () => api.get('/import/fields'),
  downloadSample: () => api.get('/import/sample', { responseType: 'blob' }),
  parse: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  preview: (payload) => api.post('/import/preview', payload),
  confirm: (payload) => api.post('/import/confirm', payload),
  templates: () => api.get('/import/templates'),
  saveTemplate: (payload) => api.post('/import/templates', payload),
  deleteTemplate: (id) => api.delete(`/import/templates/${id}`),
};

export const userApi = {
  list: (params) => api.get('/users', { params: trimParams(params) }),
  get: (id) => api.get(`/users/${id}`),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  approve: (id, payload = {}) => api.post(`/users/${id}/approve`, payload),
  reject: (id) => api.post(`/users/${id}/reject`),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  roles: () => api.get('/users/roles'),
};
