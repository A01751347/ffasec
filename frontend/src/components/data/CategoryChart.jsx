import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import React, { useEffect, useState } from "react";

const COLORS = ['#6366F1', // principal
  '#818CF8', // un poco más claro
  '#A5B4FC', // más claro
  '#C7D2FE', // aún más claro
  ];

const CategoryChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/categoryDistribution')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error fetching category distribution:", err));
  }, []);

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-normal mb-4" style={{color:'#E5E7EB'}}>Categorías (Piezas Totales)</h2>
      <div className='h-80'>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="totalPieces"
              nameKey="category"
              label={({ payload, percent }) => `${payload.category} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CategoryChart;
