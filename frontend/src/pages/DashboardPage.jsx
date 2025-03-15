// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import { Package, DollarSign, Users, BarChart2 } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });

  // Ejemplo de fetch simulado (podrías ajustarlo a /api/dashboard, etc.)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // let res = await fetch('/api/dashboard');
        // let data = await res.json();
        // setStats(data);
        
        // Simulación de datos:
        setStats({
          totalOrders: 42,
          totalRevenue: 1234.56,
          totalCustomers: 18,
          totalProducts: 87
        });
      } catch (error) {
        console.error('Error al cargar stats del dashboard:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Dashboard General" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        
        {/* Tarjetas de estadísticas */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Órdenes Totales"
            icon={Package}
            value={stats.totalOrders}
            color="#6366f1"
          />
          <StatCard
            name="Ingresos Totales"
            icon={DollarSign}
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="#8B5CF6"
          />
          <StatCard
            name="Clientes"
            icon={Users}
            value={stats.totalCustomers}
            color="#6366f1"
          />
          <StatCard
            name="Productos"
            icon={BarChart2}
            value={stats.totalProducts}
            color="#8B5CF6"
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-1 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div>
                <motion.div
                  className='bg-800 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700'
                  whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                >
                  <div className='px-4 py-5 sm:p-6'>
                    <span className='flex items-center text-sm font-xs text-gray-400'>
                      
                    </span>
                    <p className='mt-1 text-xl  text-gray-100'>
                     Bienvenidx hdtpm {name || "persona"}
                    </p>
                  </div>
                </motion.div>
              </div>
        </motion.div>

        {/* Sección para navegar a otras páginas */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4 text-white">Navegación Rápida</h2>
          <nav className="flex flex-wrap gap-4">
            <Link to="/inventory" className="text-blue-500 underline">
              Inventario
            </Link>
            <Link to="/orders" className="text-blue-500 underline">
              Órdenes
            </Link>
            <Link to="/upload" className="text-blue-500 underline">
              Subir Excel
            </Link>
            <Link to="/report" className="text-blue-500 underline">
              Reporte Diario
            </Link>
            <Link to="/customers" className="text-blue-500 underline">
              Clientes
            </Link>
          </nav>
        </motion.div>

        {/* Aquí podrías agregar más secciones, tablas o gráficos, al estilo de InventoryPage o UploadPage */}
        
      </main>
    </div>
  );
};

export default DashboardPage;
