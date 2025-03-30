<<<<<<< HEAD
// Crear src/context/AppContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <AppContext.Provider value={{ 
      notification, 
      showNotification, 
      clearNotification: () => setNotification(null) 
    }}>
=======
// frontend/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear contexto
const AppContext = createContext();

// Obtener fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Obtener el primer día del mes actual
const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

// Proveedor del contexto
export const AppProvider = ({ children }) => {
  // Estado para fechas de filtrado
  const [dateRange, setDateRange] = useState({
    fromDate: getFirstDayOfMonth(),
    toDate: getCurrentDate(),
  });

  // Estado para el modo oscuro/claro (aunque la app ya usa tema oscuro)
  const [darkMode, setDarkMode] = useState(true);

  // Estado para el usuario (simulado)
  const [user, setUser] = useState({
    username: 'Administrador',
    role: 'admin',
  });

  // Estado para mensajes globales (notificaciones, alertas, etc.)
  const [notification, setNotification] = useState(null);

  // Función para mostrar notificación
  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type });
    
    // Auto-cerrar después de duration ms
    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  // Función para actualizar el rango de fechas
  const updateDateRange = (from, to) => {
    setDateRange({
      fromDate: from,
      toDate: to,
    });
  };

  // Valores a exportar a través del contexto
  const contextValue = {
    dateRange,
    updateDateRange,
    darkMode,
    setDarkMode,
    user,
    setUser,
    notification,
    showNotification,
    clearNotification: () => setNotification(null),
  };

  return (
    <AppContext.Provider value={contextValue}>
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
      {children}
    </AppContext.Provider>
  );
};

<<<<<<< HEAD
export const useAppContext = () => useContext(AppContext);
=======
// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
};
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
