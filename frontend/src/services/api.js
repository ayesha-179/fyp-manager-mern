import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerAdmin = (data) => api.post('/auth/register/admin', data);
export const registerTeacher = (data) => api.post('/auth/register/teacher', data);
export const registerStudent = (data) => api.post('/auth/register/student', data);
export const verifyEmail = (data) => api.post('/auth/verify', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Proposal APIs
export const getProposals = () => api.get('/proposals');
export const createProposal = (data) => api.post('/proposals', data);
export const approveProposal = (id) => api.put(`/proposals/${id}/approve`);
export const completeProposal = (id) => api.put(`/proposals/${id}/complete`);

// Evaluation APIs
export const getEvaluations = () => api.get('/evaluations');
export const createEvaluation = (data) => api.post('/evaluations', data);

// Comment APIs
export const getComments = (proposalId) => api.get(`/comments/proposal/${proposalId}`);
export const addComment = (data) => api.post('/comments', data);

// File APIs
export const uploadFile = (proposalId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/files/upload/${proposalId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const getFiles = (proposalId) => api.get(`/files/proposal/${proposalId}`);

// Notification APIs
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// Admin APIs
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const deleteTeacher = (id) => api.delete(`/admin/teacher/${id}`);
export const deleteStudent = (id) => api.delete(`/admin/student/${id}`);

export default api;