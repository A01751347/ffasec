import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, ShoppingCart, CreditCard } from 'lucide-react';

const SaleDetailModal = ({ isOpen, sale, onClose }) => {
  const [saleDetails, setSaleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      if (!isOpen || !sale) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/sales/${sale.sale_id}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los detalles de la venta');
        }
        const data = await response.json();
        setSaleDetails(data);
      } catch (err) {
        console.error('Error fetching sale details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [isOpen, sale]);

  if (!isOpen) return null;

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

  // Renderizar contenido de carga
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-red-900 p-6 rounded-lg text-white">
          <p>{error}</p>
          <button 
            onClick={onClose} 
            className="mt-4 bg-red-700 px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay detalles, mostrar mensaje
  if (!saleDetails) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-gray-800 p-6 rounded-lg text-white">
          <p>No se encontraron detalles de la venta</p>
          <button 
            onClick={onClose} 
            className="mt-4 bg-blue-700 px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <motion.div 
        className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShoppingCart className="mr-2 text-blue-400" size={24} />
            Detalle de Venta #{saleDetails.sale_id}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Información General de la Venta */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Información de Venta</h3>
            <div className="space-y-2">
              <p className="text-gray-400">
                <strong className="text-gray-300">Fecha:</strong> {formatDate(saleDetails.date)}
              </p>
              <p className="text-gray-400">
                <strong className="text-gray-300">Cliente:</strong> {saleDetails.customer_name || 'Cliente General'}
              </p>
              <p className="text-gray-400 flex items-center">
                <strong className="text-gray-300 mr-2">Método de Pago:</strong>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${saleDetails.payment_method === 'cash' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'}
                `}>
                  {saleDetails.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Resumen Financiero</h3>
            <div className="space-y-2">
              <p className="text-gray-400 flex items-center">
                <DollarSign className="mr-2 text-green-400" size={20} />
                <strong className="text-gray-300 mr-2">Total:</strong> 
                ${parseFloat(saleDetails.total).toFixed(2)}
              </p>
              {saleDetails.payment_method === 'cash' && (
                <>
                  <p className="text-gray-400">
                    <strong className="text-gray-300">Efectivo Recibido:</strong> 
                    ${parseFloat(saleDetails.cash_received || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-400">
                    <strong className="text-gray-300">Cambio:</strong> 
                    ${parseFloat(saleDetails.change_given || 0).toFixed(2)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de los Items */}
        <div className="p-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Productos Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 bg-opacity-50">
                  <th className="px-4 py-2 text-left text-xs text-gray-400">Producto</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-400">Categoría</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-400">Precio</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-400">Cantidad</th>
                  <th className="px-4 py-2 text-right text-xs text-gray-400">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {saleDetails.items && saleDetails.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-700 hover:bg-opacity-50">
                    <td className="px-4 py-2 text-sm text-gray-300">{item.product_name}</td>
                    <td className="px-4 py-2 text-sm text-gray-300">{item.product_category || 'Sin Categoría'}</td>
                    <td className="px-4 py-2 text-right text-sm text-green-400">
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-green-400">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SaleDetailModal;