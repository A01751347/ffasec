// frontend/src/services/api.js
import axios from 'axios';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Puedes manejar errores específicos aquí
    if (error.response && error.response.status === 401) {
      // Ejemplo: redireccionar al login si hay error de autorización
      console.error('Error de autenticación');
    }
    return Promise.reject(error);
  }
);

// Funciones para cada entidad
export const orderService = {
  getAll: () => api.get('/orders'),
  getByTicket: (ticket) => api.get(`/orders/${ticket}`),
  getByCustomer: (customerId) => api.get(`/orders/byCustomer/${customerId}`),
};

export const inventoryService = {
  getAll: () => api.get('/inventario'),
  getDetails: () => api.get('/inventario/details'),
  add: (registro) => api.post('/inventario', { registro }),
  update: (ticket, telefono) => api.put(`/inventario/details/${ticket}`, { telefono }),
  remove: (ticket) => api.delete(`/inventario/details/${ticket}`),
};

export const customerService = {
  searchByName: (query) => api.get(`/customers?query=${query}`),
};

export const productService = {
  getAll: (from, to) => {
    let url = '/products';
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    return api.get(url);
  },
};

export const reportService = {
  getDailyReport: (date) => api.get(`/dailyReport?date=${date}`),
};

export const dashboardService = {
  getStats: (period) => api.get(`/dashboardStats?period=${period}`),
  getStatsWithRange: (from, to) => api.get(`/dashboardStats?from=${from}&to=${to}`),
};

export const salesService = {
  getOverview: () => api.get('/salesOverview'),
  getCategoryDistribution: (from, to) => api.get(`/categoryDistribution?from=${from}&to=${to}`),
};

export const fileService = {
  getAllFiles: () => api.get('/files'),
  downloadFile: (filename) => api.get(`/files/download/${filename}`, { responseType: 'blob' }),
  uploadFile: (formData) => api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const uploadService = {
  uploadExcel: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;