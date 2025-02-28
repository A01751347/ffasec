import { motion } from 'framer-motion'
import React from 'react'

const StatCard = ({ name, icon: Icon, value, color }) => {
  const stringValue = value.toString();
  const hasPercentage = stringValue.includes('%');
  // Elimina todos los caracteres excepto dígitos, punto y signo negativo
  const cleanedValue = stringValue.replace(/[^0-9.-]+/g, '');
  const numericValue = parseFloat(cleanedValue);
  
  let formattedValue =
    !isNaN(numericValue) && isFinite(numericValue)
      ? numericValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : value;
  
  // Si el valor original contenía porcentaje, se agrega al final
  if (hasPercentage) {
    formattedValue += '%';
  }

  return (
    <div>
      <motion.div
        className='bg-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
        whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        <div className='px-4 py-5 sm:p-6'>
          <span className='flex items-center text-sm font-medium text-gray-400'>
            <Icon size={20} className='mr-2' style={{ color }} />
            {name}
          </span>
          <p className='mt-1 text-3xl font-semibold text-gray-100'>
            {formattedValue}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default StatCard;
