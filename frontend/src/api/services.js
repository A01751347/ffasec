// frontend/src/api/services.js
import api from './api';

// Función helper para manejar errores y formatear respuestas
const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall;
    
    // Verificar errores HTTP
    if (response.status < 200 || response.status >= 300) {
      console.error('Error HTTP:', response.status, response.statusText);
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    // Verificar si la respuesta está vacía
    if (!response.data && response.status !== 204) {
      console.warn('Respuesta vacía con status:', response.status);
      return { data: null, success: true };
    }
    
    return { data: response.data, success: true };
  } catch (error) {
    console.error('Error en llamada API:', error);
    
    // Formatear error para mejor gestión
    const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
    
    return { 
      error: errorMessage, 
      success: false,
      status: error.response?.status || 500
    };
  }
};

// Servicio para Clientes
export const customerService = {
  // Buscar clientes por nombre
  searchByName: async (query) => {
    const result = await handleApiResponse(
      api.get(`/customers?query=${encodeURIComponent(query)}`)
    );
    return result;
  },
  
  // Obtener cliente por ID
  getById: async (id) => {
    const result = await handleApiResponse(
      api.get(`/customers/${id}`)
    );
    return result;
  }
};

// Servicio para Órdenes
export const orderService = {
  // Obtener todas las órdenes (con paginación)
  getAll: async (page = 1, limit = 20) => {
    const result = await handleApiResponse(
      api.get(`/orders?page=${page}&limit=${limit}`)
    );
    return result;
  },
  
  // Obtener orden por ticket
  getByTicket: async (ticket) => {
    const result = await handleApiResponse(
      api.get(`/orders/${ticket}`)
    );
    return result;
  },
  
  // Obtener órdenes por cliente
  getByCustomer: async (customerId, page = 1, limit = 20) => {
    const result = await handleApiResponse(
      api.get(`/orders/byCustomer/${customerId}?page=${page}&limit=${limit}`)
    );
    return result;
  }
};

// Servicio para Inventario
export const inventoryService = {
  // Obtener todo el inventario
  getAll: async () => {
    const result = await handleApiResponse(
      api.get('/inventario')
    );
    return result;
  },
  
  // Obtener detalles del inventario
  getDetails: async () => {
    const result = await handleApiResponse(
      api.get('/inventario/details')
    );
    return result;
  },
  
  // Añadir registro al inventario
  add: async (registro) => {
    // Asegurar que el registro sea un número
    const registroNumerico = parseInt(registro, 10);
    if (isNaN(registroNumerico)) {
      return { 
        error: 'El registro debe ser un número válido', 
        success: false 
      };
    }

    const result = await handleApiResponse(
      api.post('/inventario', { registro: registroNumerico })
    );
    return result;
  },
  
  // Actualizar registro del inventario
  update: async (ticket, telefono) => {
    // Asegurar que el ticket sea un número
    const ticketNumerico = parseInt(ticket, 10);
    if (isNaN(ticketNumerico)) {
      return { 
        error: 'El ticket debe ser un número válido', 
        success: false 
      };
    }

    const result = await handleApiResponse(
      api.put(`/inventario/details/${ticketNumerico}`, { telefono })
    );
    return result;
  },
  
  // Eliminar registro del inventario
  remove: async (ticket) => {
    // Asegurar que el ticket sea un número
    const ticketNumerico = parseInt(ticket, 10);
    if (isNaN(ticketNumerico)) {
      return { 
        error: 'El ticket debe ser un número válido', 
        success: false 
      };
    }

    const result = await handleApiResponse(
      api.delete(`/inventario/details/${ticketNumerico}`)
    );
    return result;
  }
};

// Servicio para Productos
export const productService = {
  // Obtener productos (con filtro de fecha opcional)
  getAll: async (from, to) => {
    let url = '/products';
    const params = [];
    
    if (from && to) {
      params.push(`from=${from}`);
      params.push(`to=${to}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const result = await handleApiResponse(
      api.get(url)
    );
    return result;
  }
};

// Servicio para Ventas
export const salesService = {
  // Crear una venta
  create: async (saleData) => {
    const result = await handleApiResponse(
      api.post('/sales', saleData)
    );
    return result;
  },
  
  // Obtener todas las ventas (con filtros opcionales)
  getAll: async (filters = {}) => {
    const { startDate, endDate, customerName } = filters;
    const params = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (customerName) params.push(`customerName=${encodeURIComponent(customerName)}`);
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    
    const result = await handleApiResponse(
      api.get(`/sales${queryString}`)
    );
    return result;
  },
  
  // Obtener venta por ID
  getById: async (id) => {
    const result = await handleApiResponse(
      api.get(`/sales/${id}`)
    );
    return result;
  },
  
  // Obtener estadísticas de ventas
  getStats: async (period) => {
    const result = await handleApiResponse(
      api.get(`/sales/stats/summary?period=${period}`)
    );
    return result;
  },
  
  // Obtener resumen de ventas por mes
  getOverview: async () => {
    const result = await handleApiResponse(
      api.get('/salesOverview')
    );
    return result;
  },
  
  // Obtener distribución por categorías
  getCategoryDistribution: async (from, to) => {
    const result = await handleApiResponse(
      api.get(`/categoryDistribution?from=${from}&to=${to}`)
    );
    return result;
  }
};

// Servicio para Dashboard
export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: async (period) => {
    const result = await handleApiResponse(
      api.get(`/dashboardStats?period=${period}`)
    );
    return result;
  },
  
  // Obtener estadísticas del dashboard con rango de fechas
  getStatsWithRange: async (from, to) => {
    const result = await handleApiResponse(
      api.get(`/dashboardStats?from=${from}&to=${to}`)
    );
    return result;
  }
};

// Servicio para Reportes
export const reportService = {
  // Obtener reporte diario
  getDailyReport: async (date) => {
    const result = await handleApiResponse(
      api.get(`/dailyReport?date=${date}`)
    );
    return result;
  }
};

// Servicio para Archivos
export const fileService = {
  // Obtener lista de archivos
  getAll: async () => {
    const result = await handleApiResponse(
      api.get('/files')
    );
    return result;
  },
  
  // Descargar archivo (retorna URL directa)
  download: (filename) => {
    return `/api/files/download/${encodeURIComponent(filename)}`;
  },
  
  // Subir archivo
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await handleApiResponse(
      api.post('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      })
    );
    return result;
  }
};

// Servicio para cargar archivos Excel
export const uploadService = {
  // Subir archivo Excel
  uploadExcel: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    
    const result = await handleApiResponse(
      api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      })
    );
    return result;
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