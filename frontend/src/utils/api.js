import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to extract data from backend response format
export const extractData = (response) => {
  if (response?.data?.success) {
    return response.data.data;
  }
  return response?.data;
};

export const authAPI = {
  register: (data) => api.post('/v1/auth/register', data),
  login: (data) => api.post('/v1/auth/login', data),
  getProfile: () => api.get('/v1/auth/profile'),
};

export const taskAPI = {
  getMyTasks: (params) => api.get('/v1/tasks/my', { params }),
  getAllTasks: (params) => api.get('/v1/tasks/all', { params }),
  getTask: (id) => api.get(`/v1/tasks/${id}`),
  createTask: (data) => api.post('/v1/tasks', data),
  updateTask: (id, data) => api.put(`/v1/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/v1/tasks/${id}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/v1/admin/analytics/dashboard'),
  getUserStats: (params) => api.get('/v1/admin/analytics/users', { params }),
  getTaskStats: (params) => api.get('/v1/admin/analytics/tasks', { params }),
  getAllUsers: (params) => api.get('/v1/admin/users', { params }),
  getUserById: (id) => api.get(`/v1/admin/users/${id}`),
  createUser: (data) => api.post('/v1/admin/users', data),
  updateUserRole: (id, role) => api.put(`/v1/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/v1/admin/users/${id}`),
  getUserTasks: (id, params) => api.get(`/v1/admin/users/${id}/tasks`, { params }),
  bulkUpdateRoles: (data) => api.post('/v1/admin/users/bulk/role', data),
  bulkDeleteUsers: (data) => api.post('/v1/admin/users/bulk/delete', data),
};

export default api;
