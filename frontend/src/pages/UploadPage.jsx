import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Shirt, Users, Zap } from 'lucide-react';

// Importa tus componentes existentes
import Header from '../components/common/Header';
import UploadExcel from '../components/data/UploadExcel';
import StatCard from '../components/common/StatCard';
import SalesOverviewChart from '../components/data/SalesOverviewChart';
import CategoryChart from '../components/data/CategoryChart';

// Importa el nuevo StatCardLarge
import StatCardLarge from '../components/common/StatCardLarge';

const UploadPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    newClients: 0,
    totalPieces: 0,
    changePercentage: 0
  });

  // Ejemplo de datos para el primer "StatCardLarge"
  const chartData1a = [
    { name: 'Camisas', value: 400 },
    { name: 'Pantalones', value: 300 },
    { name: 'Tenis', value: 300 },
    { name: 'Edredon', value: 200 },
  ];

  // Ejemplo de datos para el segundo "StatCardLarge"
  const chartData2a = [
    { name: 'Reurrentes', value: 150 },
    { name: 'Nuevos', value: 120 },
    { name: 'Perdidos', value: 80 },
  ];

  // Cargar estadísticas desde backend (ejemplo)
  useEffect(() => {
    fetch('/api/dashboardStats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title='Ventas' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12'>
        {/* Ejemplo de tarjetas pequeñas */}
        <motion.div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='Ventas totales'
            icon={Zap}
            type='Money'
            trend={5.4}
            value={`${stats.totalSales}`}
            color='#efefef'
          />
          <StatCard
            name='Nuevos clientes'
            icon={Users}
            trend={3.2}
            value={stats.newClients}
            color='#efefef'
          />
          <StatCard
            name='Cambio'
            icon={BarChart2}
            type='Percentage'
            trend={2.3}
            value={
              typeof stats.changePercentage === 'number'
                ? stats.changePercentage.toFixed(2)
                : 0
            }
            color='#efefef'
          />
          <StatCard
            name='Cambio'
            icon={BarChart2}
            type='Percentage'
            trend={2.3}
            value={
              typeof stats.changePercentage === 'number'
                ? stats.changePercentage.toFixed(2)
                : 0
            }
            color='#efefef'
          />
        </motion.div>
        {/* Tarjetas grandes con doble pastel y leyenda */}
        <motion.div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCardLarge
            name='Prendas Totales'
            //icon={Shirt}
            value={stats.totalPieces}
            trend={2.1}
            color='#efefef'
            data1={chartData1a}
            colors={['#154e94', '#1d9bc0', '#20dad8', '#92c2e7']}
          />
          <StatCardLarge
            name='Clientes'
            //icon={BarChart2}
            type='Percentage'
            trend={-1.5} // Ejemplo de tendencia negativa
            value={
              typeof stats.changePercentage === 'number'
                ? stats.changePercentage.toFixed(2)
                : 0
            }
            color='#efefef'
            data1={chartData2a}
            colors={['#d1526a', '#ff8498',  '#ffbec7']}
          />
        </motion.div>
</motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <SalesOverviewChart />
          <CategoryChart />
          <UploadExcel />
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
