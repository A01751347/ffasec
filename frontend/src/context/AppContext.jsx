// frontend/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

// Crear el contexto
const AppContext = createContext();

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

export const AppProvider = ({ children }) => {
  // Estado para notificaciones
  const [notification, setNotification] = useState(null);
  
  // Estado para usuario (simulado, se podría expandir con sistema de autenticación real)
  const [user, setUser] = useState({
    username: 'Administrador',
    role: 'admin'
  });
  
  // Estado para loading global
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para mostrar notificaciones
  const showNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    if (!message) return;
    
    // Validar tipo de notificación
    const validType = Object.values(NOTIFICATION_TYPES).includes(type) 
      ? type 
      : NOTIFICATION_TYPES.INFO;
    
    // Crear notificación
    setNotification({ 
      id: Date.now(), // ID único para cada notificación
      message, 
      type: validType,
      createdAt: new Date()
    });
    
    // Auto-cerrar después de duration ms
    const timer = setTimeout(() => {
      clearNotification();
    }, duration);
    
    // Almacenar el ID del timer para limpieza
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Función para limpiar notificaciones
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);
  
  // Función genérica para hacer peticiones a la API con manejo de errores
  const apiRequest = useCallback(async (url, options = {}) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      // Si la respuesta no es ok, lanzar error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      // Intentar parsear como JSON, si falla devolver response
      const data = await response.json().catch(() => null);
      return { data, response };
    } catch (error) {
      // Mostrar notificación de error automáticamente
      showNotification(
        error.message || 'Ocurrió un error al procesar la solicitud', 
        NOTIFICATION_TYPES.ERROR
      );
      
      // Re-lanzar el error para manejo por el componente
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);
  
  // Valores expuestos en el contexto
  const contextValue = {
    // Datos del usuario
    user,
    setUser,
    
    // Estado de carga global
    isLoading,
    setIsLoading,
    
    // Notificaciones
    notification,
    showNotification,
    clearNotification,
    
    // Utilidades para API
    apiRequest
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};

export default AppContext;