import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

const StatCard = ({ name, icon: Icon, type, value, color, trend, time, isLoading }) => {
  // Sanitizar el valor para evitar errores con null o undefined
  let stringValue = '';
  let numericValue = 0;
  let formattedValue = '';

  if (value !== undefined && value !== null) {
    stringValue = String(value);
    
    // Elimina todos los caracteres excepto dígitos, punto y signo negativo
    const cleanedValue = stringValue.replace(/[^0-9.-]+/g, '');
    numericValue = parseFloat(cleanedValue);
    
    // Formatear el valor si es un número válido
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      formattedValue = numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    } else {
      // Si no es un número válido, usar el valor original
      formattedValue = value;
    }
  }

  // Añadir símbolos según el tipo
  if (type === 'Percentage') {
    formattedValue += '%';
  } else if (type === 'Money') {
    formattedValue = `$${formattedValue}`;
  }
  
  // Formatear el texto de tiempo
  let timeText = '';
  if (time === undefined) {
    timeText = 'desde el mes pasado';
  } else if (time !== 'semana') {
    timeText = `desde el ${time} pasado`;
  } else {
    timeText = `desde la ${time} pasada`;
  }

  // Determina el color del trend según si es negativo o positivo
  const trendColor = trend && String(trend).includes('-') ? '#EF4444' : '#22C55E';

  return (
    <motion.div
      className="relative bg-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            className="p-6 animate-pulse"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .5 }}
          >
            {/* Simula el título */}
            <div className="h-6 bg-gray-600 rounded w-1/2 mb-4"></div>
            {/* Simula el valor */}
            <div className="h-14 bg-gray-600 rounded w-full mb-4"></div>
            {/* Simula el trend y el tiempo */}
            <div className="flex gap-2">
              <div className="h-4 bg-gray-600 rounded w-1/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/4"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Ícono en la esquina superior derecha */}
            <div className="absolute top-6 right-6">
              <Icon size={36} strokeWidth={1.5} style={{ color }} />
            </div>

            {/* Contenido principal */}
            <div className="px-4 py-5 sm:p-6">
              <span className="block text-md font-normal" style={{ color: '#E5E7EB' }}>
                {name}
              </span>
              <p className="mt-4 text-4xl font-semibold" style={{ color: '#E0E7FF' }}>
                {formattedValue}
              </p>
              {trend !== undefined && trend !== null && (
                <div className="flex gap-2 ml-2 mt-6">
                  <span className="text-sm font-medium" style={{ color: trendColor }}>
                    {typeof trend === 'number' ? 
                      `${trend.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2
                      })}%` 
                      : `${trend}%`}
                  </span>
                  <p className="text-xs text-gray-400 p-1">{timeText}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StatCard