// frontend/src/components/ui/Notification.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const Notification = () => {
  const { notification, clearNotification } = useAppContext();

  if (!notification) return null;

  // Determinar el icono según el tipo de notificación
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" />;
      case 'error':
        return <AlertCircle className="text-red-400" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400" />;
      case 'info':
      default:
        return <Info className="text-blue-400" />;
    }
  };

  // Determinar el color de fondo según el tipo
  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-900 bg-opacity-80 border-green-700';
      case 'error':
        return 'bg-red-900 bg-opacity-80 border-red-700';
      case 'warning':
        return 'bg-yellow-900 bg-opacity-80 border-yellow-700';
      case 'info':
      default:
        return 'bg-blue-900 bg-opacity-80 border-blue-700';
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg border ${getBgColor(
              notification.type
            )}`}
            style={{ minWidth: '300px', maxWidth: '450px' }}
          >
            <div className="mr-3">{getIcon(notification.type)}</div>
            <div className="flex-1 mr-2">
              <p className="text-white">{notification.message}</p>
            </div>
            <button
              onClick={clearNotification}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;