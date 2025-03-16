import { motion } from 'framer-motion'
import React from 'react'

const StatCard = ({ name, icon: Icon, type, value, color, trend }) => {
  const stringValue = (value === undefined || value === null) ? '' : value.toString();

  // Elimina todos los caracteres excepto dígitos, punto y signo negativo
  const cleanedValue = stringValue.replace(/[^0-9.-]+/g, '');
  const numericValue = parseFloat(cleanedValue);
  
  let formattedValue =
    !isNaN(numericValue) && isFinite(numericValue)
      ? numericValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : value;
  
  if (type === 'Percentage') {
    formattedValue += '%';
  } else if (type === 'Money') {
    formattedValue = `$${formattedValue}`;
  }

  // Determina el color del trend según si es negativo o positivo
  const trendColor = trend && trend.toString().includes('-') ? 'text-red-500' : 'text-green-500';

  return (
    <div>
      <motion.div
        className='flex bg-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
        whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        {/* Contenedor principal con "justify-between" para
            que el texto quede a la izquierda y el ícono a la derecha */}
        <div className='px-4 py-5 sm:p-6 w-full flex items-center justify-between'>
          {/* Sección de texto */}
          <div>
            <span className='block text-sm font-medium text-gray-400'>
              {name}
            </span>
            <p className='mt-1 text-3xl font-semibold text-gray-100'>
              {formattedValue}
            </p>
            {trend && (
              <div className="mt-2">
                <span className={`text-sm font-medium ${trendColor}`}>
                  {trend}
                </span>
              </div>
            )}
          </div>

          {/* Ícono a la derecha, más grande */}
          <div className='ml-4'>
            <Icon size={48} strokeWidth={1.5} style={{ color }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatCard;
