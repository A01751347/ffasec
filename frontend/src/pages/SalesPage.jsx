import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingCart, 
  Filter, 
  Calendar, 
  Download, 
  Search 
} from 'lucide-react';

// Componentes
import Header from '../components/common/Header';
import SalesTable from '../components/sales/SalesTable';
import SaleDetailModal from '../components/sales/SaleDetailModal';
import DateRangeFilter from '../components/sales/DateRangeFilter';

const SalesPage = () => {
  // Estados para gestionar ventas y filtros
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [customerFilter, setCustomerFilter] = useState('');
  
  // Estados para modal de detalle de venta
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Estadísticas resumidas
  const [stats, setStats] = useState({
    totalSales: 0,
    totalItems: 0,
    averageTicket: 0
  });

  // Cargar ventas
  const fetchSales = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;
      const queryParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(customerFilter && { customerName: customerFilter })
      });

      const response = await fetch(`/api/sales?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar ventas');
      }
      
      const data = await response.json();
      setSales(data);
      setFilteredSales(data);
      
      // Calcular estadísticas
      const totalSales = data.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const totalItems = data.reduce((sum, sale) => sum + (sale.items?.length || 0), 0);
      const averageTicket = totalSales / data.length;
      
      setStats({
        totalSales,
        totalItems,
        averageTicket: isNaN(averageTicket) ? 0 : averageTicket
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
      setSales([]);
      setFilteredSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar ventas
  useEffect(() => {
    fetchSales();
  }, [dateRange, customerFilter]);

  // Abrir modal de detalle de venta
  const handleSaleDetails = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  // Exportar ventas a CSV
  const exportSalesToCSV = () => {
    // Convertir ventas a CSV
    const headers = [
      'ID de Venta', 
      'Fecha', 
      'Total', 
      'Método de Pago', 
      'Cliente'
    ];
    
    const csvData = filteredSales.map(sale => [
      sale.sale_id,
      new Date(sale.date).toLocaleDateString(),
      `$${parseFloat(sale.total).toFixed(2)}`,
      sale.payment_method,
      sale.customer_name
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Registro de Ventas" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        {/* Filtros y Acciones */}
        <motion.div 
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filtro de Fechas */}
            <DateRangeFilter 
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
            />
            
            {/* Búsqueda por Cliente */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Botón de Exportación */}
            <button
              onClick={exportSalesToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>
        </motion.div>
        
        {/* Tarjetas de Estadísticas */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Total de Ventas */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 flex items-center">
            <div className="bg-blue-500/20 rounded-full p-3 mr-4">
              <DollarSign className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Ventas</p>
              <h3 className="text-2xl font-bold text-white">
                ${stats.totalSales.toFixed(2)}
              </h3>
            </div>
          </div>
          
          {/* Total de Items */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 flex items-center">
            <div className="bg-green-500/20 rounded-full p-3 mr-4">
              <ShoppingCart className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Items</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.totalItems}
              </h3>
            </div>
          </div>
          
          {/* Ticket Promedio */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 flex items-center">
            <div className="bg-purple-500/20 rounded-full p-3 mr-4">
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ticket Promedio</p>
              <h3 className="text-2xl font-bold text-white">
                ${stats.averageTicket.toFixed(2)}
              </h3>
            </div>
          </div>
        </motion.div>
        
        {/* Tabla de Ventas */}
        <SalesTable 
          sales={filteredSales}
          loading={loading}
          error={error}
          onSaleClick={handleSaleDetails}
          onRetry={fetchSales}
        />
        
        {/* Modal de Detalle de Venta */}
        {selectedSale && (
          <SaleDetailModal
            isOpen={isDetailModalOpen}
            sale={selectedSale}
            onClose={() => setIsDetailModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
}; 

export default SalesPage;