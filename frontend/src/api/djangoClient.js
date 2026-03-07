/**
 * Django API Client Module
 * ========================
 * 
 * This module provides a configured Axios instance and API functions
 * for communicating with the Django REST backend.
 * 
 * Features:
 * - Automatic JWT token injection
 * - Token refresh on 401 responses
 * - Organized API namespaces for each resource
 * 
 * API Namespaces:
 * - authApi: Authentication and user profile
 * - appointmentsApi: Appointment CRUD operations
 * - appointmentSlotsApi: Time slot queries
 * - applicantsApi: Applicant management
 * - documentsApi: Document upload/management
 * - contactApi: Contact form submission
 * 
 * @module djangoClient
 * 
 * @example
 * import { authApi, appointmentsApi } from './api/djangoClient';
 * 
 * // Login
 * const response = await authApi.login({ username: 'user', password: 'pass' });
 * 
 * // Book appointment
 * await appointmentsApi.create({ slot: 1, full_name: 'John Doe', email: 'john@example.com' });
 */

import axios from 'axios';

/** @constant {string} API_URL - Base URL for the Django REST API */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

/**
 * Configured Axios instance with base URL and default headers.
 * Includes request/response interceptors for JWT authentication.
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Adds JWT Authorization header if token exists.
 * Retrieves access token from localStorage and attaches to outgoing requests.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor - Handles token refresh on 401 errors.
 * Automatically refreshes expired access tokens using the refresh token.
 * Redirects to login if refresh fails.
 */
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

/**
 * Authentication API namespace.
 * Handles user login, registration, and profile management.
 * 
 * @namespace authApi
 * @property {Function} login - Authenticate user and get JWT tokens
 * @property {Function} register - Create new user account
 * @property {Function} getProfile - Get current user's profile
 * @property {Function} updateProfile - Update current user's profile
 * @property {Function} refreshToken - Refresh expired access token
 */
export const authApi = {
  /**
   * Login with username/password.
   * @param {Object} data - Login credentials
   * @param {string} data.username - User's username
   * @param {string} data.password - User's password
   * @returns {Promise} Response with access and refresh tokens
   */
  login: (data) => api.post('token/', data),
  
  /**
   * Register a new user account.
   * @param {Object} data - Registration data
   * @param {string} data.username - Desired username
   * @param {string} data.password - Account password
   * @param {string} data.email - Email address
   * @returns {Promise} Response with created user data
   */
  register: (data) => api.post('register/', data),
  
  verifyOtp: (data) => api.post('verify-otp/', data),
  
  resendOtp: (data) => api.post('resend-otp/', data),
  
  forgotPassword: (data) => api.post('forgot-password/', data),
  
  resetPassword: (data) => api.post('reset-password/', data),
  
  /** Get authenticated user's profile */
  getProfile: () => api.get('profile/'),
  
  /**
   * Update user profile.
   * @param {Object} data - Profile fields to update
   * @returns {Promise} Response with updated profile
   */
  updateProfile: (data) => api.patch('profile/', data),

  /** Change authenticated user's password */
  changePassword: (data) => api.post('change-password/', data),
  
  /**
   * Refresh expired access token.
   * @param {string} refresh - Refresh token
   * @returns {Promise} Response with new access token
   */
  refreshToken: (refresh) => api.post('token/refresh/', { refresh }),
};

/**
 * Appointments API namespace.
 * Handles appointment booking and management.
 * 
 * @namespace appointmentsApi
 */
export const appointmentsApi = {
  /**
   * Create new appointment booking.
   * @param {Object} data - Appointment data
   * @param {number} data.slot - AppointmentSlot ID
   * @param {string} data.full_name - Customer's full name
   * @param {string} data.email - Customer's email
   * @param {string} data.phone - Customer's phone
   * @param {string} [data.message] - Optional notes
   * @returns {Promise} Response with created appointment
   */
  create: (data) => api.post('appointments/', data),
  
  /** List all appointments (admin: all, user: own) */
  list: () => api.get('appointments/'),
  
  /**
   * Get appointment details.
   * @param {number} id - Appointment ID
   */
  get: (id) => api.get(`appointments/${id}/`),
  
  /**
   * Cancel an appointment.
   * @param {number} id - Appointment ID to cancel
   */
  cancel: (id) => api.post(`appointments/${id}/cancel/`),
  
  /** Get current user's appointments */
  myAppointments: () => api.get('appointments/my_appointments/'),
};

/**
 * Appointment Slots API namespace.
 * Queries available time slots for booking.
 * 
 * @namespace appointmentSlotsApi
 */
export const appointmentSlotsApi = {
  /**
   * List appointment slots with optional filters.
   * @param {Object} [params] - Query parameters
   * @param {string} [params.date] - Filter by date (YYYY-MM-DD)
   * @param {string} [params.service_type] - Filter by service type
   */
  list: (params) => api.get('appointment-slots/', { params }),
  
  /**
   * List only available (non-booked) slots.
   * @param {Object} [params] - Query parameters
   */
  available: (params) => api.get('appointment-slots/available/', { params }),
  
  /** Get list of dates that have available slots */
  datesWithSlots: () => api.get('appointment-slots/dates_with_slots/'),
  
  /**
   * Get slot details.
   * @param {number} id - Slot ID
   */
  get: (id) => api.get(`appointment-slots/${id}/`),
};

/**
 * Applicants API namespace.
 * Manages applicant profiles.
 * 
 * @namespace applicantsApi
 */
export const applicantsApi = {
  create: (data) => api.post('applicants/', data),
  list: () => api.get('applicants/'),
  get: (id) => api.get(`applicants/${id}/`),
  getStatus: (id) => api.get(`applicants/${id}/`),
  update: (id, data) => api.patch(`applicants/${id}/`, data),
};

/**
 * Documents API namespace.
 * Handles file uploads for applicants.
 * 
 * @namespace documentsApi
 */
export const documentsApi = {
  /** List all documents for current user */
  list: () => api.get('documents/'),
  
  /**
   * Upload a document.
   * @param {FormData} data - FormData with file and metadata
   */
  upload: (data) => api.post('documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  
  /**
   * Delete a document.
   * @param {number} id - Document ID
   */
  delete: (id) => api.delete(`documents/${id}/`),
};

/**
 * Contact API namespace.
 * Handles contact form submissions.
 * 
 * @namespace contactApi
 */
export const contactApi = {
  /**
   * Submit contact message.
   * @param {Object} data - Contact form data
   * @param {string} data.name - Sender's name
   * @param {string} data.email - Sender's email
   * @param {string} data.message - Message content
   */
  send: (data) => api.post('contact/', data),
};

/**
 * User messages API namespace.
 * Fetch messages with admin replies for the authenticated user.
 * 
 * @namespace myMessagesApi
 */
export const myMessagesApi = {
  /** List messages with admin replies for current user */
  list: () => api.get('my-messages/'),
};

/**
 * Admin API namespace.
 * Admin-only endpoints for management.
 * 
 * @namespace adminApi
 */
export const adminApi = {
  // Contact Messages
  /** List all contact messages (admin only) */
  getContactMessages: () => api.get('contact-messages/'),
  
  /** Get single contact message */
  getContactMessage: (id) => api.get(`contact-messages/${id}/`),
  
  /** Delete contact message */
  deleteContactMessage: (id) => api.delete(`contact-messages/${id}/`),
  
  /** Mark message as read */
  markMessageRead: (id) => api.post(`contact-messages/${id}/mark_read/`),
  
  /** Reply to a contact message (sends email to sender) */
  replyToMessage: (id, reply) => api.post(`contact-messages/${id}/reply/`, { reply }),
  
  /** Get unread message count */
  getUnreadCount: () => api.get('contact-messages/unread_count/'),
  
  // Appointments
  /** Get all appointments (admin only) */
  getAllAppointments: () => api.get('appointments/all_appointments/'),
  
  /** Update appointment status */
  updateAppointmentStatus: (id, status) => api.post(`appointments/${id}/update_status/`, { status }),
  
  /** Get appointment statistics */
  getAppointmentStats: () => api.get('appointments/stats/'),
  
  // Appointment Slots
  /** Create appointment slot */
  createSlot: (data) => api.post('appointment-slots/', data),
  
  /** Update appointment slot */
  updateSlot: (id, data) => api.patch(`appointment-slots/${id}/`, data),
  
  /** Delete appointment slot */
  deleteSlot: (id) => api.delete(`appointment-slots/${id}/`),
  
  /** Get all slots (including inactive) */
  getAllSlots: () => api.get('appointment-slots/'),
  
  // Applicants
  /** Get all applicants */
  getAllApplicants: () => api.get('applicants/'),
  
  /** Update applicant */
  updateApplicant: (id, data) => api.patch(`applicants/${id}/`, data),
  
  /** Update applicant status (admin) */
  updateApplicantStatus: (id, statusData) => api.post(`applicants/${id}/update_status/`, statusData),
  
  /** Delete applicant */
  deleteApplicant: (id) => api.delete(`applicants/${id}/`),
};

export default api;
