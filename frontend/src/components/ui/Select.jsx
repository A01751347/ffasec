// frontend/src/components/ui/Select.jsx
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label = '',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Seleccionar...',
  options = [],
  error = null,
  helperText = '',
  disabled = false,
  required = false,
  className = '',
  labelClassName = '',
  selectClassName = '',
  fullWidth = true,
  showEmptyOption = true,
  emptyOptionText = 'Seleccionar...',
  optionLabelKey = 'label',
  optionValueKey = 'value',
  ...props
}, ref) => {
  // Generate a unique ID if none provided
  const selectId = id || `select-${name}-${Math.random().toString(36).substr(2, 9)}`;

  // Base styles
  const baseSelectClass = `
    bg-gray-700 
    text-white 
    border
    focus:ring-2 
    focus:outline-none
    transition
    duration-200
    rounded-md
    appearance-none
  `;
  
  // Error and success states
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
    : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/30';
  
  // Disabled state
  const disabledClass = disabled ? 'opacity-60 cursor-not-allowed' : '';
  
  // Width control
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all select classes
  const selectClasses = `
    ${baseSelectClass}
    ${stateClasses}
    ${disabledClass}
    ${widthClass}
    p-2.5 pr-10
    ${selectClassName}
  `;

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className={`block mb-2 text-sm font-medium text-gray-300 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={selectClasses}
          {...props}
        >
          {showEmptyOption && (
            <option value="" disabled={required}>
              {emptyOptionText}
            </option>
          )}
          
          {options.map((option, index) => {
            // Handle different option formats
            const optionValue = typeof option === 'object' ? option[optionValueKey] : option;
            const optionLabel = typeof option === 'object' ? option[optionLabelKey] : option;
            
            return (
              <option key={index} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        
        {/* Custom dropdown icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <ChevronDown size={18} />
        </div>
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

Select.displayName = 'Select';

export default Select;