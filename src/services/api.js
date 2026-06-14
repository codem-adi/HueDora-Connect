import axios from 'axios';
import {
  clearAuthSession,
  handleUnauthorized,
  isAuthLoginRequest,
  isUnauthorizedResponse,
} from './authSession';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (!original || isAuthLoginRequest(original) || !isUnauthorizedResponse(error)) {
      return Promise.reject(error);
    }

    if (original.url?.includes('/auth/refresh') || original._retry) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refreshToken }
      );
      localStorage.setItem('accessToken', data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch {
      handleUnauthorized();
      return Promise.reject(error);
    }
  }
);

export { clearAuthSession };
export default api;
