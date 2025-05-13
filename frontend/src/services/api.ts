// frontend/src/services/api.ts
import axios from 'axios';

// Criando uma instância do axios com configurações básicas
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento para erros de autenticação (401)
    if (error.response && error.response.status === 401) {
      // Se o token expirou ou é inválido, redirecionar para login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções auxiliares para facilitar o uso da API

// Membros
export const memberService = {
  getAll: () => api.get('/members'),
  getById: (id: string) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/members', data),
  update: (id: string, data: any) => api.put(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
};

// Autenticação
export const authService = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Veículos
export const vehicleService = {
  getAll: () => api.get('/vehicles'),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  getByMemberId: (memberId: string) => api.get(`/vehicles/member/${memberId}`),
};

// Eventos
export const eventService = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: string, data: any) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Bar
export const barService = {
  getProducts: () => api.get('/bar/products'),
  createSale: (data: any) => api.post('/bar/sales', data),
  getShifts: () => api.get('/bar/shifts'),
};

// Admin
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getLogs: () => api.get('/admin/logs'),
  updateConfig: (config: any) => api.post('/admin/config', config),
};

// Inventário
export const inventoryService = {
  getAll: () => api.get('/inventory'),
  getById: (id: string) => api.get(`/inventory/${id}`),
  create: (data: any) => api.post('/inventory', data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
};

export { api };
export default api;
