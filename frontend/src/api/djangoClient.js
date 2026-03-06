import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => api.post('token/', data),
  register: (data) => api.post('register/', data),
  getProfile: () => api.get('profile/'),
  refreshToken: (refresh) => api.post('token/refresh/', { refresh }),
};

export const appointmentsApi = {
  create: (data) => api.post('appointments/', data),
  list: () => api.get('appointments/'),
};

export const applicantsApi = {
  create: (data) => api.post('applicants/', data),
  getStatus: (id) => api.get(`applicants/${id}/`),
};

export const contactApi = {
  send: (data) => api.post('contact/', data),
};

export default api;
