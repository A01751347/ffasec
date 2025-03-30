// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Users, BarChart2, Calendar, TrendingUp } from 'lucide-react';

// Hooks personalizados
import { useDashboardStats } from '../hooks/useApi';

// Componentes UI mejorados
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAppContext } from '../context/AppContext';

const DashboardPage = () => {
  // Acceder al contexto global
  const { user, showNotification } = useAppContext();
  
  // Estado para el período seleccionado: 'semana', 'mes', 'trimestre' o 'año'
  const [period, setPeriod] = useState('año');

  // Utilizar hook personalizado para obtener los datos del dashboard
  const { data: stats, isLoading, error, refetch } = useDashboardStats(period);

  // Opciones para el selector de período
  const periodOptions = [
    { value: 'semana', label: 'Última semana' },
    { value: 'mes', label: 'Último mes' },
    { value: 'trimestre', label: 'Último trimestre' },
    { value: 'año', label: 'Último año' },
  ];

  // Función para formatear ticket promedio de forma segura
  const formatMoney = (value) => {
    const money = parseFloat(value);
    return isNaN(money) ? '0.00' : money.toFixed(2);
  };

  // Función para formatear tendencia (porcentaje)
 // Función para formatear tendencia (porcentaje)
const formatTrend = (value) => {
  // Verificar que value no sea undefined o null
  if (value === undefined || value === null) {
    return 'N/A';
  }
  
  // Si es un número, aplicar toFixed
  return typeof value === 'number' ? value.toFixed(2) : 'N/A';
};
  // Manejar cambio de período
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  // Manejar error de carga
  const handleRetry = () => {
    refetch();
    showNotification('Actualizando datos...', 'info');
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Dashboard General" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        {/* Selector de período */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-medium text-gray-100">Resumen de Estadísticas</h3>
              <p className="text-sm text-gray-400">Visualice los datos clave del negocio en el período seleccionado</p>
            </div>
            <div className="w-full sm:w-64">
              <Select
                options={periodOptions}
                value={period}
                onChange={handlePeriodChange}
                label="Selecciona el período"
                fullWidth
              />
            </div>
          </div>

          {/* Indicador de período activo */}
          <div className="mt-4">
            <Badge variant="solid-primary" size="md">
              {periodOptions.find(p => p.value === period)?.label || 'Período personalizado'}
            </Badge>
          </div>
        </Card>

        {/* Estado de error */}
        {error && (
          <Card className="mb-6" variant="danger">
            <div className="text-center">
              <h3 className="text-lg text-red-400 mb-2">Error al cargar datos</h3>
              <p className="text-sm text-gray-300 mb-4">{error.message}</p>
              <button 
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </Card>
        )}

        {/* Tarjetas de estadísticas */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <StatCard
              name="Órdenes Totales"
              icon={Package}
              value={stats?.current?.orders || 0}
              color="#efefef"
              trend={formatTrend(stats?.trends?.orders)}
              time={period}
              isLoading={isLoading}
            />
            <StatCard
              name="Ticket Promedio"
              icon={DollarSign}
              type="Money"
              value={formatMoney(stats?.current?.averageTicket)}
              color="#efefef"
              trend={formatTrend(stats?.trends?.averageTicket)}
              time={period}
              isLoading={isLoading}
            />
            <StatCard
              name="Clientes Distintos"
              icon={Users}
              value={stats?.current?.customers || 0}
              color="#efefef"
              trend={formatTrend(stats?.trends?.customers)}
              time={period}
              isLoading={isLoading}
            />
            <StatCard
              name="Total de Prendas"
              icon={BarChart2}
              value={stats?.current?.pieces || 0}
              color="#efefef"
              trend={formatTrend(stats?.trends?.pieces)}
              time={period}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Tarjetas informativas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
          {/* Tarjeta de bienvenida */}
          <WelcomeCard username={user?.username || 'Administrador'} />
          
          {/* Tarjeta de información de fecha */}
          <Card
            title="Fecha Actual"
            icon={<Calendar className="text-blue-400" />}
            subtitle="Información del sistema"
          >
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="font-medium">Fecha:</span> {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Hora:</span> {new Date().toLocaleTimeString()}
              </p>
              <p className="text-gray-300">
                <span className="font-medium">Período activo:</span> {periodOptions.find(p => p.value === period)?.label}
              </p>
            </div>
          </Card>
        </div>

        {/* Tarjeta de tendencias y estadísticas */}
        <Card 
          title="Tendencias y Estadísticas" 
          icon={<TrendingUp className="text-green-400" />}
          subtitle="Datos comparativos"
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-gray-100 mb-3">Comparativa de Períodos</h4>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-400">Órdenes actuales:</span>
                  <span className="font-medium text-white">{stats?.current?.orders || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Órdenes período anterior:</span>
                  <span className="font-medium text-white">{stats?.previous?.orders || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Cambio porcentual:</span>
                  <Badge 
                    variant={(stats?.trends?.orders || 0) >= 0 ? "solid-success" : "solid-danger"}
                  >
                    {(stats?.trends?.orders || 0) >= 0 ? "+" : ""}{formatTrend(stats?.trends?.orders)}%
                  </Badge>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-100 mb-3">Métricas de Clientes</h4>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-400">Clientes actuales:</span>
                  <span className="font-medium text-white">{stats?.current?.customers || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Clientes período anterior:</span>
                  <span className="font-medium text-white">{stats?.previous?.customers || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-400">Cambio porcentual:</span>
                  <Badge 
                    variant={(stats?.trends?.customers || 0) >= 0 ? "solid-success" : "solid-danger"}
                  >
                    {(stats?.trends?.customers || 0) >= 0 ? "+" : ""}{formatTrend(stats?.trends?.customers)}%
                  </Badge>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPage;