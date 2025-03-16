import React, { PureComponent } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';

class StatCardLarge extends PureComponent {
  render() {
    const {
      // Props generales para la tarjeta
      name,
      //icon: Icon,
      type,
      value,
      color,
      trend,

      // Dos conjuntos de datos para los pasteles
      data1 = [],
      data2 = [],

      // Colores para los sectores
      colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],

      // Dimensiones del chart (puedes ajustarlas o confiar en ResponsiveContainer)
      chartWidth = 500,
      chartHeight = 300,
    } = this.props;

    // Ejemplo de formateo del valor principal
    let formattedValue = value;
    if (type === 'Money') {
      const numericValue = parseFloat(value);
      formattedValue = isNaN(numericValue) ? '$0.00' : `$${numericValue.toFixed(2)}`;
    } else if (type === 'Percentage') {
      const numericValue = parseFloat(value);
      formattedValue = isNaN(numericValue) ? '0%' : `${numericValue.toFixed(2)}%`;
    }

    // Color verde o rojo para la tendencia (si se desea mostrar)
    const trendColor =
      trend && trend.toString().includes('-') ? 'text-red-500' : 'text-green-500';

    return (
      <motion.div
        className="relative bg-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
        whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        {/* Ícono en la esquina superior derecha */}
        {/* <div className="absolute top-6 right-6">
          <Icon size={36} strokeWidth={1.5} style={{ color }} />
        </div> */}

        {/* Contenido principal de la tarjeta */}
        <div className="px-4 py-3 sm:p-6">
          <span className="block text-md font-normal text-gray-200">{name}</span>
          <p className="text-4xl py-4 font-semibold text-gray-100">
            {formattedValue}
          </p>

          {/* Contenedor para el chart con dos Pasteles y Leyenda */}
          <div className="h-52 ">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={chartWidth} height={chartHeight}>
                {/* Primer pastel */}
                <Pie
                  data={data1}
                  nameKey="name"    // Campo usado en la leyenda
                  dataKey="value"
                  cx={50}
                  cy={61}
                  innerRadius={47}
                  outerRadius={65}
                  fill="#8884d8"
                  paddingAngle={9}
                  legendType="circle"
                >
                  {data1.map((entry, index) => (
                    <Cell
                      key={`cell1-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>

                {/* Leyenda para ambos pasteles */}
                <Legend
                  layout="vertical"
                  verticalAlign="bottom"
                  align="left"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Texto de tendencia, si está presente */}
          {trend && (
            <div className="flex gap-2 mt-2">
              <span className={`text-sm font-medium ${trendColor}`}>
                {`${trend}%`}
              </span>
              <p className="text-xs text-gray-100 p-1">desde el mes pasado</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
}

export default StatCardLarge;
