import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/salesOverview")
      .then((res) => res.json())
      .then((data) => {
        // Renombramos 'month' a 'name' para el eje X
        const formattedData = data.map(item => ({
          name: item.month,
          sales: Number(item.totalSales)
        }));
        setSalesData(formattedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales overview:", error);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5 }}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Simula el título */}
            <div className="mb-4">
              <div className="h-6 w-1/3 bg-gray-600 rounded animate-pulse"></div>
            </div>
            {/* Simula el gráfico */}
            <div className="h-80">
              <div className="h-full w-full bg-gray-600 rounded animate-pulse"></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-normal mb-4" style={{ color: "#E5E7EB" }}>
              Resumen de Ventas por Mes
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(31,41,55,0.8)",
                      borderColor: "#4B5563"
                    }}
                    itemStyle={{ color: "#E5E7EB" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ fill: "#C7D2FE", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 4, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesOverviewChart;
