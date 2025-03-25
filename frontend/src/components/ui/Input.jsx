// frontend/src/components/ui/Input.jsx
import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label = '',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  error = null,
  helperText = '',
  disabled = false,
  readOnly = false,
  required = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  icon = null,
  iconPosition = 'left',
  fullWidth = true,
  ...props
}, ref) => {
  // Generate a unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base styles
  const baseInputClass = `
    bg-gray-700 
    text-white 
    border
    focus:ring-2 
    focus:outline-none
    transition
    duration-200
    rounded-md
  `;
  
  // Error and success states
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/30';
  
  // Disabled state
  const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  // Width control
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Icon positioning
  const iconPaddingClass = icon
    ? iconPosition === 'left'
      ? 'pl-10'
      : 'pr-10'
    : '';
  
  // Combine all input classes
  const inputClasses = `
    ${baseInputClass}
    ${stateClasses}
    ${disabledClass}
    ${widthClass}
    ${iconPaddingClass}
    p-2.5
    ${inputClassName}
  `;

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block mb-2 text-sm font-medium text-gray-300 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {/* Error message or helper text */}
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;