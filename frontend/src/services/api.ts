import axios from 'axios';
import config from '../config/index.js';

const api = axios.create({
  baseURL: config.api.baseUrl,
  withCredentials: true, // For cookies (refresh token)
  timeout: config.api.timeout,
});

// Request interceptor to attach access token if needed, but since we are using HttpOnly cookies
// for refresh tokens, we might just store the short-lived access token in memory or localStorage.
// For now, let's grab it from localStorage if it exists.
api.interceptors.request.use((req) => {
  const token = localStorage.getItem(config.auth.accessTokenKey);
  if (token) {
    req.headers.Authorization = `${config.auth.tokenPrefix} ${token}`;
  }
  return req;
});

export default api;
