// frontend/src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title = null,
  subtitle = null,
  icon = null,
  footer = null,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  animate = true,
  onClick = null,
  ...props
}) => {
  // Base card classes
  const baseCardClasses = `
    bg-gray-800 
    bg-opacity-50 
    backdrop-blur-md 
    shadow-lg 
    rounded-xl 
    border 
    border-gray-700 
    overflow-hidden
  `;
  
  // Combined card classes
  const cardClasses = `
    ${baseCardClasses}
    ${onClick ? 'cursor-pointer hover:border-gray-500 transition-colors' : ''}
    ${className}
  `;
  
  // Base content for the card
  const cardContent = (
    <>
      {/* Card header (if title, subtitle, or icon provided) */}
      {(title || subtitle || icon) && (
        <div className={`px-4 py-5 sm:p-6 border-b border-gray-700 ${headerClassName}`}>
          <div className="flex items-center">
            {icon && <div className="mr-3 text-gray-400">{icon}</div>}
            <div>
              {title && <h3 className="text-xl font-semibold text-gray-100">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      
      {/* Card body */}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Card footer (if provided) */}
      {footer && (
        <div className={`px-4 py-4 sm:px-6 border-t border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </>
  );
  
  // If animated
  if (animate) {
    return (
      <motion.div
        className={cardClasses}
        whileHover={{ y: onClick ? -5 : 0, boxShadow: onClick ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '' }}
        onClick={onClick}
        {...props}
      >
        {cardContent}
      </motion.div>
    );
  }
  
  // Non-animated version
  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {cardContent}
    </div>
  );
};

export default Card;