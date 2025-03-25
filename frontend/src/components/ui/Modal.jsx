// frontend/src/components/ui/Modal.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  children,
  size = "md", // sm, md, lg, xl
  showCloseButton = true,
  closeOnEscape = true,
  closeOnClickOutside = true,
  footer = null,
}) => {
  // Referencia al contenedor del modal
  const modalRef = useRef(null);

  // Tamaños predefinidos
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4"
  };

  // Cierre del modal con tecla Escape
  useEffect(() => {
    const handleEscKey = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevenir el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      // Restaurar el scroll al cerrar
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Cierre al hacer clic fuera del modal
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClickOutside}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`relative bg-gray-800 rounded-xl shadow-xl ${sizeClasses[size]} w-full mx-4 overflow-hidden`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, type: "spring", damping: 20 }}
          >
            {/* Encabezado del Modal */}
            {title && (
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Contenido del Modal */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Pie del Modal (opcional) */}
            {footer && (
              <div className="border-t border-gray-700 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;