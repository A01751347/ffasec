// frontend/src/api/api.js
import axios from 'axios';
import { NOTIFICATION_TYPES } from '../context/AppContext';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos
});

// Variable para almacenar la función de mostrar notificaciones
// Se configura en initializeApi
let showNotification = null;
let setLoading = null;

/**
 * Inicializa la API con funciones de contexto
 * @param {Object} config - Configuración
 * @param {Function} config.showNotification - Función para mostrar notificaciones
 * @param {Function} config.setLoading - Función para mostrar/ocultar loader global
 */
export const initializeApi = ({ showNotificationFn, setLoadingFn }) => {
  showNotification = showNotificationFn;
  setLoading = setLoadingFn;
}; 

// Interceptores de petición
api.interceptors.request.use(
  (config) => {
    // Activar indicador de carga si está configurado
    if (setLoading) {
      setLoading(true);
    }
    
    // Si hay token de autenticación, agregarlo a las cabeceras
    // (Ejemplo para futuras implementaciones de autenticación)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Manejar error de petición
    if (setLoading) {
      setLoading(false);
    }
    return Promise.reject(error);
  }
);

// Interceptores de respuesta
api.interceptors.response.use(
  (response) => {
    // Desactivar indicador de carga si está configurado
    if (setLoading) {
      setLoading(false);
    }
    return response;
  },
  (error) => {
    // Desactivar indicador de carga si está configurado
    if (setLoading) {
      setLoading(false);
    }
    
    // Preparar mensaje de error
    let errorMessage = 'Ocurrió un error en la solicitud';
    
    if (error.response) {
      // Error de respuesta del servidor (status !== 2xx)
      const { status, data } = error.response;
      
      errorMessage = data.error || data.message || `Error ${status}`;
      
      // Manejar casos específicos
      switch (status) {
        case 401:
          errorMessage = 'Sesión expirada o no autorizada';
          // Aquí se podría implementar redirección al login
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 422:
          errorMessage = 'Datos inválidos';
          break;
        case 500:
          errorMessage = 'Error en el servidor';
          break;
        default:
          errorMessage = `Error: ${errorMessage}`;
      }
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
    
    // Mostrar notificación de error si está configurada
    if (showNotification) {
      showNotification(errorMessage, NOTIFICATION_TYPES.ERROR);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Wrapper para simplificar las peticiones GET
 * @param {string} url - URL a consultar
 * @param {Object} options - Opciones para axios
 * @returns {Promise} Promesa que resuelve con los datos o error
 */
export const get = async (url, options = {}) => {
  try {
    const response = await api.get(url, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper para simplificar las peticiones POST
 * @param {string} url - URL para la petición
 * @param {Object} data - Datos a enviar
 * @param {Object} options - Opciones para axios
 * @returns {Promise} Promesa que resuelve con los datos o error
 */
export const post = async (url, data = {}, options = {}) => {
  try {
    const response = await api.post(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper para simplificar las peticiones PUT
 * @param {string} url - URL para la petición
 * @param {Object} data - Datos a enviar
 * @param {Object} options - Opciones para axios
 * @returns {Promise} Promesa que resuelve con los datos o error
 */
export const put = async (url, data = {}, options = {}) => {
  try {
    const response = await api.put(url, data, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper para simplificar las peticiones DELETE
 * @param {string} url - URL para la petición
 * @param {Object} options - Opciones para axios
 * @returns {Promise} Promesa que resuelve con los datos o error
 */
export const del = async (url, options = {}) => {
  try {
    const response = await api.delete(url, options);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Wrapper para simplificar las peticiones con archivos
 * @param {string} url - URL para la petición
 * @param {FormData} formData - FormData con el archivo y otros datos
 * @param {Object} options - Opciones para axios
 * @returns {Promise} Promesa que resuelve con los datos o error
 */
export const uploadFile = async (url, formData, options = {}) => {
  try {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...options
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  get,
  post,
  put,
  del,
  uploadFile,
  initializeApi
};