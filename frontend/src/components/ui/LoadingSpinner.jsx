// frontend/src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullScreen = false }) => {
  // Variantes para la animación
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear"
      }
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className="h-12 w-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"
      />
      <p className="mt-4 text-gray-300 text-lg">Cargando...</p>
    </div>
  );

  // Si es pantalla completa, centramos en toda la pantalla
  if (fullScreen) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-screen">
        {content}
      </div>
    );
  }

  // Si no, centramos solo en el contenedor
  return (
    <div className="flex-1 flex items-center justify-center">
      {content}
    </div>
  );
};

export default LoadingSpinner;