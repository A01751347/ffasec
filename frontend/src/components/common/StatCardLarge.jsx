import React, { PureComponent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';

class StatCardLarge extends PureComponent {
  renderContent() {
    const {
      name,
      type,
      value,
      trend,
      time,
      data1 = [],
      colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
      chartWidth = 500,
      chartHeight = 300,
    } = this.props;

    // Limpieza de valores y tendencias
    const cleanedValue = String(value).replace(/[^0-9.-]+/g, '');
    const numericValue = parseFloat(cleanedValue);

    const cleanedTrend = String(trend).replace(/[^0-9.-]+/g, '');
    const numericTrend = parseFloat(cleanedTrend);

    // Formato del período de tiempo
    let timeF;
    if (time === undefined) {
      timeF = 'desde el mes pasado';
    } else if (time !== 'semana') {
      timeF = `desde el ${time} pasado`;
    } else {
      timeF = `desde la ${time} pasada`;
    }

    // Formato final de "value"
    let formattedValue =
      !isNaN(numericValue) && isFinite(numericValue)
        ? numericValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : value; // Si no es numérico, deja el valor tal cual

    // Formato final de "trend"
    let formattedTrend =
      !isNaN(numericTrend) && isFinite(numericTrend)
        ? numericTrend.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : trend; // Si no es numérico, usa directamente "trend"

    // Ajusta el valor según el tipo
    if (type === 'Percentage') {
      formattedValue += '%';
    } else if (type === 'Money') {
      formattedValue = `$${formattedValue}`;
    }

    // Color según la tendencia
    const trendColor =
      formattedTrend && String(formattedTrend).includes('-')
        ? 'text-red-500'
        : 'text-green-500';

    return (
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 py-3 sm:p-6">
          <span className="block text-md font-normal" style={{ color: '#E5E7EB' }}>
            {name}
          </span>
          <p className="text-4xl py-4 font-semibold" style={{ color: '#E0E7FF' }}>
            {formattedValue}
          </p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={chartWidth} height={chartHeight}>
                <Pie
                  data={data1}
                  nameKey="name"
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
                <Legend layout="vertical" verticalAlign="bottom" align="left" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {formattedTrend && (
            <div className="flex gap-2 mt-2">
              <span className={`text-sm font-medium ${trendColor}`}>
                {`${formattedTrend}%`}
              </span>
              <p className="text-xs text-gray-400 p-1">{timeF}</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  renderSkeleton() {
    return (
      <motion.div
        key="skeleton"
        className="p-6 animate-pulse"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Simula el título */}
        <div className="h-6 bg-gray-600 rounded w-1/2 mb-4"></div>
        {/* Simula el valor */}
        <div className="h-10 bg-gray-600 rounded w-full mb-4"></div>
        {/* Simula el área del gráfico */}
        <div className="h-52 bg-gray-600 rounded mb-4"></div>
        {/* Simula trend y tiempo */}
        <div className="flex gap-2">
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
        </div>
      </motion.div>
    );
  }

  render() {
    const { isLoading } = this.props;
    return (
      <motion.div
        className="relative bg-gray-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
        whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? this.renderSkeleton() : this.renderContent()}
        </AnimatePresence>
      </motion.div>
    );
  }
}

export default StatCardLarge;
