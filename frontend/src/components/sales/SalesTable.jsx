import React from 'react';
import { motion } from 'framer-motion';
import { Eye, DollarSign } from 'lucide-react';

const SalesTable = ({ 
  sales, 
  loading, 
  error, 
  onSaleClick, 
  onRetry 
}) => {
  // Formatear fecha de manera legible
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-300">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-50 rounded-xl p-6 text-center">
        <h3 className="text-xl text-red-400 mb-4">Error al cargar ventas</h3>
        <p className="text-gray-300 mb-4">{error}</p>
        <button 
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar tabla vacía
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700 text-center">
        <p className="text-gray-400">No se encontraron ventas</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl border border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-700 bg-opacity-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Método de Pago
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sales.map((sale, index) => (
              <motion.tr 
                key={sale.sale_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 hover:bg-opacity-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {sale.sale_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(sale.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {sale.customer_name || 'Cliente General'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${sale.payment_method === 'cash' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'}
                  `}>
                    {sale.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                  <div className="flex items-center">
                    <DollarSign size={16} className="mr-1" />
                    {parseFloat(sale.total).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onSaleClick(sale)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Ver Detalles"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SalesTable;