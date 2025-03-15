// ClassDistributionChart.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Datos mock para la gráfica de distribución de clases
const mockClassData = [
  { category: '10-16', totalPlayers: 90 },
  { category: '17-24', totalPlayers: 190 },
  { category: '25-35', totalPlayers: 120 },
  { category: '36-50', totalPlayers: 70 },
  { category: '50+', totalPlayers: 52 },
];

const COLORS = ['#6366F1', '#8B5CD6', '#EC4899', '#10B981', '#F59E0B'];

const ClassDistributionChart = () => {
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Age Range</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mockClassData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="totalPlayers"
              nameKey="category"
              label={({ payload, percent }) => `${payload.category} (${(percent * 100).toFixed(0)}%)`}
            >
              {mockClassData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4B5563',
              }}
              itemStyle={{ color: '#E5E7EB' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ClassDistributionChart;
