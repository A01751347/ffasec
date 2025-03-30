import React, { memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useCategoryDistribution } from "../../hooks/useApi";

const COLORS = [
  "#6366F1", // principal
  "#818CF8", // un poco más claro
  "#A5B4FC", // más claro
  "#C7D2FE", // aún más claro
];

// Componente funcional interno para la visualización
const ChartContent = ({ data }) => (
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
);

// Memorizar el contenido del gráfico para evitar re-renderizados innecesarios
const MemoizedChartContent = memo(ChartContent);

const CategoryChart = ({ fromDate, toDate }) => {
  // Definir valores por defecto: 1 de enero y 31 de diciembre del año actual
  const currentYear = new Date().getFullYear();
  const defaultFromDate = new Date(currentYear, 0, 1).toISOString().split("T")[0];
  const defaultToDate = new Date(currentYear, 11, 31).toISOString().split("T")[0];

  // Usar el hook personalizado para obtener los datos
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useCategoryDistribution(fromDate || defaultFromDate, toDate || defaultToDate);

  // Refetch los datos cuando cambien las fechas
  useEffect(() => {
    refetch();
  }, [fromDate, toDate, refetch]);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
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
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-80 flex flex-col items-center justify-center"
          >
            <p className="text-red-400 mb-3">Error al cargar datos: {error.message}</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Reintentar
            </button>
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
            {/* Usar MemoizedChartContent para evitar re-renderizados innecesarios */}
            <MemoizedChartContent data={data || []} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CategoryChart;