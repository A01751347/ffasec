// frontend/src/components/ui/Badge.jsx
import React from 'react';
import { X } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-indigo-100 text-indigo-800',
  
  // Solid variants
  'solid-primary': 'bg-blue-500 text-white',
  'solid-secondary': 'bg-gray-600 text-white',
  'solid-success': 'bg-green-500 text-white',
  'solid-danger': 'bg-red-500 text-white',
  'solid-warning': 'bg-yellow-500 text-white',
  'solid-info': 'bg-indigo-500 text-white',
  
  // Outline variants
  'outline-primary': 'bg-transparent border border-blue-500 text-blue-500',
  'outline-secondary': 'bg-transparent border border-gray-500 text-gray-500',
  'outline-success': 'bg-transparent border border-green-500 text-green-500',
  'outline-danger': 'bg-transparent border border-red-500 text-red-500',
  'outline-warning': 'bg-transparent border border-yellow-500 text-yellow-500',
  'outline-info': 'bg-transparent border border-indigo-500 text-indigo-500',
};

const SIZES = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  className = '',
  removable = false,
  onRemove = () => {},
  icon = null,
  ...props
}) => {
  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  // Badge classes
  const badgeClasses = `
    inline-flex items-center justify-center
    ${VARIANTS[variant] || VARIANTS.primary}
    ${SIZES[size] || SIZES.md}
    ${roundedClasses[rounded] || roundedClasses.full}
    font-medium whitespace-nowrap
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 hover:bg-opacity-20 hover:bg-black rounded-full focus:outline-none"
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
};

export default Badge;