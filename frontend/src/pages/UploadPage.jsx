import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Shirt, Users, Zap } from 'lucide-react';

import Header from '../components/common/Header';
import UploadExcel from '../components/data/UploadExcel';
import StatCard from '../components/common/StatCard';
import SalesOverviewChart from '../components/data/SalesOverviewChart';
import CategoryChart from '../components/data/CategoryChart';

const UploadPage = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    newClients: 0,
    totalPieces: 0,
    changePercentage: 0
  });

  useEffect(() => {
    fetch('/api/dashboardStats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching dashboard stats:', err));
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title='Ventas' />
      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px12'>
        <motion.div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}>
            <StatCard 
              name='Ventas totales' 
              icon={Zap} 
              value={`$${Number(stats.totalSales).toFixed(2)}`} 
              color='#6366f1'
            />
            <StatCard 
              name='Nuevos clientes' 
              icon={Users} 
              value={stats.newClients} 
              color='#8B5CF6'
            />
            <StatCard 
              name='Prendas totales' 
              icon={Shirt} 
              value={stats.totalPieces} 
              color='#6366f1'
            />
            <StatCard 
              name='Cambio' 
              icon={BarChart2} 
              value={`${stats.changePercentage !== null ? stats.changePercentage.toFixed(2) : 0}%`} 
              color='#8B5CF6'
            />
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <SalesOverviewChart/>
          <CategoryChart/>
          <UploadExcel />
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
