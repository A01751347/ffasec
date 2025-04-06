// frontend/src/services/customerUploadService.js
import axios from 'axios';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: '/api/upload',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicio para la carga de clientes
export const customerUploadService = {
  // Verificar estructura de la tabla Customers
  checkStructure: async () => {
    try {
      const response = await api.get('/check-structure');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al verificar estructura de la tabla'
      };
    }
  },
  
  // Configurar tabla Customers si es necesario
  setupTable: async () => {
    try {
      const response = await api.post('/setup-table');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al configurar la tabla'
      };
    }
  },
  
  // Cargar archivo Excel de clientes
  uploadCustomers: async (formData, onProgress) => {
    try {
      const response = await api.post('/customers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        } : undefined
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cargar el archivo'
      };
    }
  }
};

export default customerUploadService;