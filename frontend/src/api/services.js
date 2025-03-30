// frontend/src/api/services.js
import api from './api';

// Servicio para Clientes
export const customerService = {
  // Buscar clientes por nombre
  searchByName: (query) => {
    return api.get(`/customers?query=${encodeURIComponent(query)}`);
  },
  
  // Obtener cliente por ID
  getById: (id) => {
    return api.get(`/customers/${id}`);
  }
};

// Servicio para Órdenes
export const orderService = {
  // Obtener todas las órdenes (con paginación)
  getAll: (page = 1, limit = 20) => {
    return api.get(`/orders?page=${page}&limit=${limit}`);
  },
  
  // Obtener orden por ticket
  getByTicket: (ticket) => {
    return api.get(`/orders/${ticket}`);
  },
  
  // Obtener órdenes por cliente
  getByCustomer: (customerId, page = 1, limit = 20) => {
    return api.get(`/orders/byCustomer/${customerId}?page=${page}&limit=${limit}`);
  }
};

// Servicio para Inventario
export const inventoryService = {
  // Obtener todo el inventario
  getAll: () => {
    return api.get('/inventario');
  },
  
  // Obtener detalles del inventario
  getDetails: () => {
    return api.get('/inventario/details');
  },
  
  // Añadir registro al inventario
  add: (registro) => {
    return api.post('/inventario', { registro });
  },
  
  // Actualizar registro del inventario
  update: (ticket, telefono) => {
    return api.put(`/inventario/details/${ticket}`, { telefono });
  },
  
  // Eliminar registro del inventario
  remove: (ticket) => {
    return api.del(`/inventario/details/${ticket}`);
  }
};

// Servicio para Productos
export const productService = {
  // Obtener productos (con filtro de fecha opcional)
  getAll: (from, to) => {
    let url = '/products';
    if (from && to) {
      url += `?from=${from}&to=${to}`;
    }
    return api.get(url);
  }
};

// Servicio para Ventas
export const salesService = {
  // Crear una venta
  create: (saleData) => {
    return api.post('/sales', saleData);
  },
  
  // Obtener todas las ventas (con filtros opcionales)
  getAll: (filters = {}) => {
    const { startDate, endDate, customerName } = filters;
    let query = [];
    
    if (startDate) query.push(`startDate=${startDate}`);
    if (endDate) query.push(`endDate=${endDate}`);
    if (customerName) query.push(`customerName=${encodeURIComponent(customerName)}`);
    
    const queryString = query.length > 0 ? `?${query.join('&')}` : '';
    return api.get(`/sales${queryString}`);
  },
  
  // Obtener venta por ID
  getById: (id) => {
    return api.get(`/sales/${id}`);
  },
  
  // Obtener estadísticas de ventas
  getStats: (period) => {
    return api.get(`/sales/stats/summary?period=${period}`);
  },
  
  // Obtener resumen de ventas por mes
  getOverview: () => {
    return api.get('/salesOverview');
  },
  
  // Obtener distribución por categorías
  getCategoryDistribution: (from, to) => {
    return api.get(`/categoryDistribution?from=${from}&to=${to}`);
  }
};

// Servicio para Dashboard
export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: (period) => {
    return api.get(`/dashboardStats?period=${period}`);
  },
  
  // Obtener estadísticas del dashboard con rango de fechas
  getStatsWithRange: (from, to) => {
    return api.get(`/dashboardStats?from=${from}&to=${to}`);
  }
};

// Servicio para Reportes
export const reportService = {
  // Obtener reporte diario
  getDailyReport: (date) => {
    return api.get(`/dailyReport?date=${date}`);
  }
};

// Servicio para Archivos
export const fileService = {
  // Obtener lista de archivos
  getAll: () => {
    return api.get('/files');
  },
  
  // Descargar archivo
  download: (filename) => {
    // Esta función debe devolver la URL para la descarga, no usar api.get
    return `/api/files/download/${encodeURIComponent(filename)}`;
  },
  
  // Subir archivo
  upload: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.uploadFile('/files', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  }
};

// Servicio para cargar archivos Excel
export const uploadService = {
  // Subir archivo Excel
  uploadExcel: (file, onProgress) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    
    return api.uploadFile('/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
  }
};

// Exportar todos los servicios como objeto
export default {
  customerService,
  orderService,
  inventoryService,
  productService,
  salesService,
  dashboardService,
  reportService,
  fileService,
  uploadService
};