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
      name,
      type,
      value,
      trend,
      data1 = [],
      colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
      chartWidth = 500,
      chartHeight = 300,
    } = this.props;

    // Asegurar que value es una cadena antes de limpiar caracteres
    const cleanedValue = String(value).replace(/[^0-9.-]+/g, '');
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

    const trendColor = trend && trend.toString().includes('-') ? 'text-red-500' : 'text-green-500';

    return (
      <motion.div
        className="relative bg-800 bg-opacity-20 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700"
        whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
      >
        <div className="px-4 py-3 sm:p-6">
          <span className="block text-md font-normal" style={{ color: '#E5E7EB' }}>{name}</span>
          <p className="text-4xl py-4 font-semibold" style={{ color: '#E0E7FF' }}>{formattedValue}</p>

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
                    <Cell key={`cell1-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="bottom" align="left" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {trend && (
            <div className="flex gap-2 mt-2">
              <span className={`text-sm font-medium ${trendColor}`}>{`${trend}%`}</span>
              <p className="text-xs text-gray-400 p-1">desde el mes pasado</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
}

export default StatCardLarge;