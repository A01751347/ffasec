import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Shirt, Users, Zap } from 'lucide-react';

// Componentes existentes
import Header from '../components/common/Header';
import UploadExcel from '../components/data/UploadExcel';
import StatCard from '../components/common/StatCard';
import SalesOverviewChart from '../components/data/SalesOverviewChart';
import CategoryChart from '../components/data/CategoryChart';
import StatCardLarge from '../components/common/StatCardLarge';

const UploadPage = () => {
  // Incorporamos todos los campos que el endpoint puede devolver
  const [stats, setStats] = useState({
    totalSales: 0,
    newClients: 0,
    totalPieces: 0,
    changePercentage: 0,
    inventoryCount: 0,
    frequentClients: 0,
    lostClients: 0,
    newClientsTrend: 0,
    piecesTrend: 0,
  });

  const [loading, setLoading] = useState(true);

  // Preparar datos para la tarjeta grande de "Prendas Totales"
  // (aquí aún son estáticos, podrías generar dinámicamente si lo deseas)
  const chartData1a = [
    { name: 'Camisas', value: 400 },
    { name: 'Pantalones', value: 300 },
    { name: 'Tenis', value: 300 },
    { name: 'Edredon', value: 200 },
  ];

  // Preparar datos para la tarjeta grande de "Clientes":
  // Reemplazamos la data estática con la proveniente de `stats`
  const chartData2a = [
    { name: 'Recurrentes', value: stats.frequentClients },
    { name: 'Nuevos', value: stats.newClients },
    { name: 'Perdidos', value: stats.lostClients },
  ];

  // Calcular total de clientes (opcional), para mostrar en la tarjeta
  const totalClients = stats.frequentClients + stats.newClients + stats.lostClients;

  // Cargar estadísticas desde el backend
  useEffect(() => {
    setLoading(true);
    fetch('/api/dashboardStats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Ventas" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        {/* Tarjetas pequeñas */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Ventas totales */}
            <StatCard
              name="Ventas totales"
              icon={Zap}
              type="Money"
              // Ejemplo de tendencia fija; podrías usar stats.changePercentage si quieres
              trend={5.4}
              value={stats.totalSales.toLocaleString('en-US')}
              color="#efefef"
              isLoading={loading}
            />

            {/* Nuevos clientes */}
            <StatCard
              name="Nuevos clientes"
              icon={Users}
              trend={stats.newClientsTrend}
              value={stats.newClients}
              color="#efefef"
              isLoading={loading}
            />

            {/* Cambio (porcentaje de ventas vs. año pasado) */}
            <StatCard
              name="Cambio"
              icon={BarChart2}
              type="Percentage"
              trend={2.3}
              value={
                typeof stats.changePercentage === 'number'
                  ? stats.changePercentage.toFixed(2)
                  : 0
              }
              color="#efefef"
              isLoading={loading}
            />

            {/* Órdenes en Inventario */}
            <StatCard
              name="Ordenes en Inventario"
              icon={Shirt}
              type=""
              trend={3.7}
              value={stats.inventoryCount}
              color="#efefef"
              isLoading={loading}
            />
          </motion.div>

          {/* Tarjetas grandes con doble pastel y leyenda */}
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Prendas Totales */}
            <StatCardLarge
              name="Prendas Totales"
              value={stats.totalPieces}
              // Aquí podrías usar stats.piecesTrend si deseas reflejar la tendencia
              trend={stats.piecesTrend}
              color="#efefef"
              time="año"
              data1={chartData1a} // Ejemplo estático
              colors={['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE']}
              isLoading={loading}
            />

            {/* Clientes (recurrentes, nuevos, perdidos) */}
            <StatCardLarge
              name="Clientes"
              // Ejemplo: mostramos la suma total en la parte superior
              value={totalClients}
              // Podrías mostrar la tendencia de nuevos clientes, por ejemplo:
              color="#efefef"
              data1={chartData2a}
              colors={['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE']}
              isLoading={loading}
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <CategoryChart />
          <UploadExcel />
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
