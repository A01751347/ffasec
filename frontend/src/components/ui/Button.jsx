// frontend/src/components/ui/Button.jsx
import React from 'react';
import { motion } from 'framer-motion';

// Variantes de color disponibles
const VARIANTS = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  info: 'bg-indigo-500 hover:bg-indigo-600 text-white',
  // Variante outline
  'outline-primary': 'border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
  'outline-secondary': 'border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white',
  'outline-success': 'border border-green-500 text-green-500 hover:bg-green-500 hover:text-white',
  'outline-danger': 'border border-red-500 text-red-500 hover:bg-red-500 hover:text-white',
  'outline-warning': 'border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white',
  'outline-info': 'border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white',
};

// Tamaños disponibles
const SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'md',
  animate = true,
  onClick,
  ...props
}) => {
  // Clases para el estado deshabilitado
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Clases para los bordes redondeados
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  // Base button classes
  const buttonClasses = `
    inline-flex items-center justify-center
    transition-colors duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    ${VARIANTS[variant] || VARIANTS.primary}
    ${SIZES[size] || SIZES.md}
    ${roundedClasses[rounded] || roundedClasses.md}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? disabledClasses : ''}
    ${className}
  `;

  // El contenido del botón con o sin icono
  const buttonContent = (
    <>
      {loading && (
        <span className="mr-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  );

  // Si animate es true, usar motion.button
  if (animate) {
    return (
      <motion.button
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {buttonContent}
      </motion.button>
    );
  }

  // Si animate es false, usar button normal
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button;