// frontend/src/components/ui/Notification.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useAppContext, NOTIFICATION_TYPES } from '../../context/AppContext';

const Notification = () => {
  const { notification, clearNotification } = useAppContext();

  // Configurar autocierre después de 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  // Determinar el icono según el tipo
  const getIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="h-5 w-5" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle className="h-5 w-5" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertCircle className="h-5 w-5" />;
      case NOTIFICATION_TYPES.INFO:
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  // Determinar las clases de estilo según el tipo
  const getStylesByType = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-800 border-green-700 text-green-100';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-800 border-red-700 text-red-100';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-800 border-yellow-700 text-yellow-100';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'bg-blue-800 border-blue-700 text-blue-100';
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 max-w-sm"
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          layout
        >
          <div className={`rounded-lg shadow-lg border px-4 py-3 ${getStylesByType(notification.type)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={clearNotification}
                  className="bg-transparent rounded-md inline-flex text-current hover:text-white focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;