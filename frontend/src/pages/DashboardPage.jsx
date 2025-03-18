// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Users, BarChart2 } from 'lucide-react';

// Componentes
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import WelcomeCard from '../components/dashboard/WelcomeCard';

const DashboardPage = () => {
  // Estado para almacenar estadísticas actuales y tendencias
  const [stats, setStats] = useState({
    current: {
      orders: 0,
      averageTicket: 0,
      customers: 0,
      pieces: 0,
    },
    trends: {
      orders: null,
      averageTicket: null,
      customers: null,
      pieces: null,
    }
  });

  // Estado para el período seleccionado: 'semana', 'mes', 'trimestre' o 'año'
  const [period, setPeriod] = useState('año');

  // Estado para indicar si los datos se están cargando
  const [loading, setLoading] = useState(true);

  // Nombre del usuario (ajústalo según tu lógica de autenticación)
  const [username, setUsername] = useState('Administrador');

  // Función para formatear ticket promedio de forma segura
  const formatMoney = (value) => {
    const money = parseFloat(value);
    return isNaN(money) ? '0.00' : money.toFixed(2);
  };

  // Función para formatear tendencia (porcentaje)
  const formatTrend = (value) => {
    return value !== null ? `${value.toFixed(2)}` : 'N/A';
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/dashboardStats?period=${period}`);
        if (!response.ok) {
          throw new Error('Error al obtener datos del dashboard');
        }
        const data = await response.json();

        setStats({
          current: {
            orders: data.current.orders,
            averageTicket: data.current.averageTicket,
            customers: data.current.customers,
            pieces: data.current.pieces,
          },
          trends: {
            orders: data.trends.orders,
            averageTicket: data.trends.averageTicket,
            customers: data.trends.customers,
            pieces: data.trends.pieces,
          }
        });
      } catch (error) {
        console.error('Error al cargar stats del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [period]); // Se vuelve a ejecutar cada vez que cambia el período

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Dashboard General" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        {/* Selector de período */}
        <div className="mb-4 bg-gray-800 p-4">
          <label htmlFor="period" className="mr-2 font-medium text-white">
            Selecciona el período:
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-600 rounded p-1 bg-gray-700 text-white"
          >
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="año">Año</option>
          </select>
        </div>

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
            value={stats.current.orders}
            color="#efefef"
            trend={formatTrend(stats.trends.orders)}
            time={period}
            isLoading={loading}
          />
          <StatCard
            name="Ticket Promedio"
            icon={DollarSign}
            type="Money"
            value={formatMoney(stats.current.averageTicket)}
            color="#efefef"
            trend={formatTrend(stats.trends.averageTicket)}
            time={period}
            isLoading={loading}
          />
          <StatCard
            name="Clientes Distintos"
            icon={Users}
            value={stats.current.customers}
            color="#efefef"
            trend={formatTrend(stats.trends.customers)}
            time={period}
            isLoading={loading}
          />
          <StatCard
            name="Total de Prendas"
            icon={BarChart2}
            value={stats.current.pieces}
            color="#efefef"
            trend={formatTrend(stats.trends.pieces)}
            time={period}
            isLoading={loading}
          />
        </motion.div>

        {/* Tarjeta de bienvenida */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <WelcomeCard username={username} />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
