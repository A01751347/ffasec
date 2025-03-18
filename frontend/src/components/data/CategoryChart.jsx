import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366F1", // principal
  "#818CF8", // un poco más claro
  "#A5B4FC", // más claro
  "#C7D2FE", // aún más claro
];

const CategoryChart = ({ fromDate, toDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Definir valores por defecto: 1 de enero y 31 de diciembre del año actual
  const currentYear = new Date().getFullYear();
  const defaultFromDate = new Date(currentYear, 0, 1).toISOString().split("T")[0];
  const defaultToDate = new Date(currentYear, 11, 31).toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/categoryDistribution?from=${fromDate || defaultFromDate}&to=${toDate || defaultToDate}`
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching category distribution:", err);
        setLoading(false);
      });
  }, [fromDate, toDate, defaultFromDate, defaultToDate]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
            <div className="mb-4">
              <div className="h-6 w-1/3 bg-gray-600 rounded animate-pulse"></div>
            </div>
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
            <h2
              className="text-lg font-normal mb-4"
              style={{ color: "#E5E7EB" }}
            >
              Categorías (Piezas Totales)
            </h2>
            <div className="h-80">
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
                    label={({ payload, percent }) =>
                      `${payload.category} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsla(215, 27.90%, 16.90%, 0.80)",
                      borderColor: "#4B5563",
                    }}
                    itemStyle={{ color: "#E5E7EB" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoryChart;
