import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, TrendingUp, Filter, RefreshCw } from 'lucide-react';

// Componentes
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import InventoryDetails from '../components/products/inventoryComp/InventoryDetails';
import CategoryChart from '../components/data/CategoryChart';

// Función para capitalizar la primera letra de un string de forma segura
function capitalizeFirstLetter(val = '') {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1);
} 

// Función para formatear dinero
function formatMoney(amount) {
  // Verificar que el valor no sea undefined o null
  if (amount === undefined || amount === null) {
    return '$0.00';
  }

  // Convertir a número si es un string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Verificar que sea un número válido
  if (isNaN(numAmount)) {
    return '$0.00';
  }

  // Formatear con 2 decimales
  return `$${numAmount.toFixed(2)}`;
}

const InventoryPage = () => {
  // Estado para fechas de filtro
  const [fromDate, setFromDate] = useState(() => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1).toISOString().split('T')[0]; // 1 de enero del año actual
  });
  
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Hoy
  });

  // Estados para datos
  const [totalPieces, setTotalPieces] = useState(0);
  const [masPopular, setMasPopular] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [lowestStockItem, setLowestStockItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Función para cargar datos
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar estadísticas del dashboard
      const statsResponse = await fetch(`/api/dashboardStats?from=${fromDate}&to=${toDate}`);
      if (!statsResponse.ok) {
        throw new Error('Error al cargar estadísticas');
      }
      const statsData = await statsResponse.json();
      
      // Actualizar estados con datos de estadísticas
      setTotalPieces(statsData.totalPiecesRange || 0);
      setTotalSales(statsData.totalSalesRange || 0);
      
      // Cargar datos de categorías
      const categoryResponse = await fetch(`/api/categoryDistribution?from=${fromDate}&to=${toDate}`);
      if (!categoryResponse.ok) {
        throw new Error('Error al cargar distribución de categorías');
      }
      const categoryData = await categoryResponse.json();
      setCategoryData(categoryData);
      
      // Establecer categoría más popular
      if (categoryData && categoryData.length > 0) {
        setMasPopular(categoryData[0].category);
      }
      
      // Cargar productos
      const productsResponse = await fetch(`/api/products?from=${fromDate}&to=${toDate}`);
      if (!productsResponse.ok) {
        throw new Error('Error al cargar productos');
      }
      const productsData = await productsResponse.json();
      setProducts(productsData);
      
      // Encontrar item con menor stock
      if (productsData && productsData.length > 0) {
        const lowestStock = productsData.reduce((lowest, current) => {
          return (current.stock < lowest.stock) ? current : lowest;
        });
        setLowestStockItem(lowestStock.name);
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente y cuando cambian las fechas
  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  // Manejar cambio de fechas
  const handleFilterApply = () => {
    fetchData();
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Productos e Inventario" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        {/* Filtros de fecha */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-100 flex items-center">
              <Filter className="mr-2" size={20} />
              Filtros
            </h2>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Desde:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hasta:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded p-2"
                />
              </div>
              
              <button
                onClick={handleFilterApply}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={16} />
                    Aplicar
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Mensaje de error */}
        {error && (
          <motion.div 
            className="bg-red-800 bg-opacity-50 text-white p-4 rounded-lg mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-medium">Error: {error}</p>
            <button 
              onClick={fetchData} 
              className="mt-2 bg-red-700 hover:bg-red-600 px-4 py-1 rounded text-sm"
            >
              Reintentar
            </button>
          </motion.div>
        )}
        
        {/* Tarjetas de estadísticas */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <StatCard 
            name="Prendas Totales" 
            icon={Package} 
            value={totalPieces} 
            color="#6366f1" 
            isLoading={loading}
          />
          <StatCard 
            name="Más Popular" 
            icon={TrendingUp} 
            value={capitalizeFirstLetter(masPopular)} 
            color="#8B5CF6" 
            isLoading={loading}
          />
          <StatCard 
            name="Stock Bajo" 
            icon={AlertTriangle} 
            value={lowestStockItem || "No disponible"} 
            color="#6366f1" 
            isLoading={loading}
          />
          <StatCard 
            name="Total Ventas" 
            icon={DollarSign} 
            type="Money"
            value={totalSales}
            color="#8B5CF6" 
            isLoading={loading}
          />
        </motion.div>
        
        {/* Tabla de productos */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Lista de Productos</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Piezas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {products.slice(0, 5).map((product, index) => {
                    let priceValue = parseFloat(product.price);
                    if (isNaN(priceValue)) priceValue = 0;
                    
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${priceValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.sales}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              
              {products.length > 5 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-400">
                    Mostrando 5 de {products.length} productos
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>No hay productos disponibles para mostrar.</p>
            </div>
          )}
        </motion.div>
        
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de categorías */}
          <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Distribución por Categorías</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <CategoryChart fromDate={fromDate} toDate={toDate} />
            )}
          </motion.div>
          
          {/* Tendencias de ventas */}
          <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Tendencias de Ventas</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-8">
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatMoney(totalSales)}
                  </div>
                  <p className="text-gray-400">Ventas totales en el período seleccionado</p>
                  <div className="mt-6">
                    <div className="flex justify-center items-center text-sm">
                      <span className="text-gray-400 mr-2">Prendas procesadas:</span>
                      <span className="font-medium text-white">{totalPieces}</span>
                    </div>
                    <div className="flex justify-center items-center text-sm mt-2">
                      <span className="text-gray-400 mr-2">Categoría destacada:</span>
                      <span className="font-medium text-white">{capitalizeFirstLetter(masPopular)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Detalles de inventario */}
        <InventoryDetails />
      </main>
    </div>
  );
};

export default InventoryPage;