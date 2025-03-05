// src/components/data/SalesOverviewChart.jsx
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetch("/api/salesOverview")
      .then((res) => res.json())
      .then((data) => {
        // Formateamos los datos: renombramos 'month' a 'name' para que la gráfica lo use
        const formattedData = data.map(item => ({
          name: item.month, // formato "YYYY-MM"
          sales: Number(item.totalSales)
        }));
        setSalesData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching sales overview:", error);
      });
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Resumen de Ventas por Mes</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: "rgba(31,41,55,0.8)", borderColor: "#4B5563" }} itemStyle={{ color: "#E5E7EB" }} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#6366F1" strokeWidth={3} dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }} activeDot={{ r: 4, strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;
