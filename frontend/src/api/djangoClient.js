import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('token/', data),
  register: (data) => api.post('register/', data),
  getProfile: () => api.get('profile/'),
  updateProfile: (data) => api.patch('profile/', data),
  refreshToken: (refresh) => api.post('token/refresh/', { refresh }),
};

export const appointmentsApi = {
  create: (data) => api.post('appointments/', data),
  list: () => api.get('appointments/'),
  get: (id) => api.get(`appointments/${id}/`),
  cancel: (id) => api.post(`appointments/${id}/cancel/`),
  myAppointments: () => api.get('appointments/my_appointments/'),
};

export const appointmentSlotsApi = {
  list: (params) => api.get('appointment-slots/', { params }),
  available: (params) => api.get('appointment-slots/available/', { params }),
  datesWithSlots: () => api.get('appointment-slots/dates_with_slots/'),
  get: (id) => api.get(`appointment-slots/${id}/`),
};

export const applicantsApi = {
  create: (data) => api.post('applicants/', data),
  list: () => api.get('applicants/'),
  get: (id) => api.get(`applicants/${id}/`),
  getStatus: (id) => api.get(`applicants/${id}/`),
};

export const documentsApi = {
  list: () => api.get('documents/'),
  upload: (data) => api.post('documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`documents/${id}/`),
};

export const contactApi = {
  send: (data) => api.post('contact/', data),
};

export default api;
