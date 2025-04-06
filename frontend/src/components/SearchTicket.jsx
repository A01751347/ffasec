// frontend/src/components/SearchTicket.jsx
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

// Función para formatear la fecha (asume que viene en formato ISO)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

const SearchTicket = () => {
  const [ticket, setTicket] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!ticket.trim()) {
      setError('Por favor, ingresa un número de ticket');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrderData(null);
      
      console.log('Buscando orden con ticket:', ticket);
      
      // Realizar la consulta de forma directa para diagnosticar
      const response = await fetch(`/api/orders/${ticket}`);
      console.log('Status de respuesta:', response.status);
      
      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error(`Error al buscar orden: ${response.status} ${response.statusText}`);
      }
      
      // Obtener los datos de la respuesta
      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Verificar si hay datos
      if (!data) {
        setError('No se encontraron datos para este ticket');
        return;
      }
      
      // Guardar los datos en el estado
      setOrderData(data);
    } catch (error) {
      console.error('Error al buscar orden:', error);
      setError('Error al buscar la orden: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Manejar la búsqueda al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Calcular totales si hay datos
  let totalPrice = 0,
    totalPieces = 0;
    
  if (orderData && orderData.details && Array.isArray(orderData.details)) {
    totalPrice = orderData.details.reduce((acc, detail) => acc + (parseFloat(detail.price) || 0), 0);
    totalPieces = orderData.details.reduce((acc, detail) => acc + (parseInt(detail.pieces, 10) || 0), 0);
  }

  return (
    <div className="p-4 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white">Buscar Orden por Ticket</h2>
      
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={ticket}
            onChange={(e) => setTicket(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ingresa el número de ticket"
            className="w-full pl-10 p-2 bg-gray-700 text-white border border-gray-600 rounded"
          />
        </div>
        <button 
          onClick={handleSearch} 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center my-4">
          <LoadingSpinner />
        </div>
      )}

      {/* Estado de error */}
      {error && !loading && (
        <div className="bg-red-900 bg-opacity-50 text-white p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Resultado de la búsqueda */}
      {orderData && !loading && (
        <div className="bg-gray-700 p-4 rounded-lg">
          {/* Resumen de la orden */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Resumen de la Orden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400"><span className="font-medium text-white">Número de Orden:</span> {orderData.number}</p>
                <p className="text-gray-400"><span className="font-medium text-white">Ticket:</span> {orderData.ticket}</p>
                <p className="text-gray-400"><span className="font-medium text-white">Fecha:</span> {formatDate(orderData.date)}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-gray-400"><span className="font-medium text-white">Cliente:</span> {orderData.customerName}</p>
                <p className="text-gray-400"><span className="font-medium text-white">ID Cliente:</span> {orderData.customerId}</p>
              </div>
            </div>
          </div>

          {/* Detalles de la orden */}
          {orderData.details && orderData.details.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Detalles de la Orden</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proceso</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Piezas</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {orderData.details.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-700">
                        <td className="px-4 py-2 text-gray-300">{item.process}</td>
                        <td className="px-4 py-2 text-gray-300">{item.description}</td>
                        <td className="px-4 py-2 text-center text-gray-300">{item.pieces}</td>
                        <td className="px-4 py-2 text-center text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-300">${parseFloat(item.price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totales */}
          <div className="mt-4 bg-blue-900 bg-opacity-30 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <p className="text-blue-300 font-bold text-lg">
                Total Precio: ${totalPrice.toFixed(2)}
              </p>
              <p className="text-blue-300 font-bold text-lg">
                Total Piezas: {totalPieces}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTicket;