import { motion } from 'framer-motion'
import React from 'react'

const StatCard = ({ name, icon: Icon, type, value, color, trend }) => {
  const stringValue = (value === undefined || value === null) ? '' : value.toString();

  // Elimina todos los caracteres excepto dígitos, punto y signo negativo
  const cleanedValue = stringValue.replace(/[^0-9.-]+/g, '');
  const numericValue = parseFloat(cleanedValue);

  let formattedValue =
    !isNaN(numericValue) && isFinite(numericValue)
      ? numericValue.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : value;

  if (type === 'Percentage') {
    formattedValue += '%';
  } else if (type === 'Money') {
    formattedValue = `$${formattedValue}`;
  }

  // Determina el color del trend según si es negativo o positivo
  const trendColor =
    trend && trend.toString().includes('-') ? '#EF4444' : '#22C55E';

  return (
    <motion.div
      className="relative bg-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
    >
      {/* Ícono en la esquina superior derecha */}
      <div className="absolute top-6 right-6">
        <Icon size={36} strokeWidth={1.5} style={{ color }} />
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-5 sm:p-6">
        <span className="block text-md font-normal"  style={{color:'#E5E7EB'
        }}>
          {name}
        </span>
        <p className="mt-4 text-4xl font-semibold" style={{color:'#E0E7FF'
        }}>
          {formattedValue}
        </p>
        {trend && (
          <div className="flex gap-2 ml-2 mt-6">
            <span className={'text-sm font-medium'} style={{color:`${trendColor}`}}>
              {`${trend}%`}
            </span>
            <p className="text-xs text-gray-400 p-1">desde el mes pasado</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
