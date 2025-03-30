// src/components/ui/Notification.jsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Notification = () => {
  const { notification, clearNotification } = useAppContext();

  if (!notification) return null;

  // Determinar el color de fondo según el tipo
  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'info':
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${getBgColor(notification.type)} text-white p-4 rounded-lg shadow-lg border border-gray-700 max-w-xs`}
      >
        <div className="flex justify-between">
          <p>{notification.message}</p>
          <button
            onClick={clearNotification}
            className="ml-4 text-white hover:text-gray-300 focus:outline-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;