// frontend/src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { AppProvider, useAppContext } from './context/AppContext';
import { initializeApi } from './api/api';
import Notification from './components/ui/Notification';
import { ErrorBoundary } from './components/ErrorBoundary';

// Crear cliente de React Query con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 300000, // 5 minutos
      cacheTime: 600000,  // 10 minutos
      onError: (error) => {
        console.error('Error en consulta:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Error en mutación:', error);
      }
    }
  },
});

// Componente para inicializar API con el contexto
function AppInitializer({ children }) {
  const { showNotification, setIsLoading } = useAppContext();
  
  // Inicializar API con funciones del contexto
  useEffect(() => {
    initializeApi({
      showNotificationFn: showNotification,
      setLoadingFn: setIsLoading
    });
  }, [showNotification, setIsLoading]);
  
  return children;
}

// Envolver la aplicación con los proveedores necesarios
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppInitializer>
              <App />
              <Notification />
            </AppInitializer>
          </BrowserRouter>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </QueryClientProvider>
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);