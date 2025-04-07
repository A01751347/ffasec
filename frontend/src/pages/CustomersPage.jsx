// frontend/src/pages/CustomersPage.jsx
import React, { useState } from 'react';
import { Search, User, ChevronRight, FileText } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para buscar clientes por nombre o apellido
  const searchCustomers = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor, ingresa un término de búsqueda');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setCustomers([]);
      
      const response = await fetch(`/api/customers?query=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCustomers(data);
        if (data.length === 0) {
          setError('No se encontraron clientes con ese nombre');
        }
      } else {
        console.error('Formato de respuesta inesperado:', data);
        setError('Formato de respuesta inesperado');
      }
    } catch (error) {
      console.error('Error buscando clientes:', error);
      setError('Error al buscar clientes: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las órdenes de un cliente
  const fetchOrders = async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      setOrders([]);
      
      // Usar directamente la consulta simple para evitar problemas de formato
      const response = await fetch(`/api/orders/byCustomer/${customerId}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extraer las órdenes del objeto de respuesta
      let ordersData = [];
      
      if (data && data.data && Array.isArray(data.data)) {
        ordersData = data.data;
      } else if (Array.isArray(data)) {
        ordersData = data;
      }
      
      setOrders(ordersData);
      
      if (ordersData.length === 0) {
        setError('Este cliente no tiene órdenes registradas');
      }
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      setError('Error al obtener órdenes: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Manejar la selección de un cliente y traer sus órdenes
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    fetchOrders(customer.id);
  };

  // Manejar la búsqueda al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCustomers();
    }
  };

  return (
    <div className="p-6 max-w-7xl relative z-10 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Clientes</h1>
        <p className="text-gray-400">Busca clientes y consulta su historial de órdenes</p>
      </div> 

      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">Buscar Clientes</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa nombre o apellido"
              className="w-full pl-10 py-2 px-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={searchCustomers} 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <User size={18} />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>

        {/* Estado de carga */}
        {loading && !customers.length && (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="bg-red-900 bg-opacity-50 text-white p-4 rounded-lg mb-4 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Lista de clientes encontrados */}
        {!loading && customers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <User className="mr-2 text-blue-400" />
              Resultados: {customers.length} cliente(s)
            </h3>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-600">
                {customers.map((customer) => (
                  <li
                    key={customer.id}
                    className={`transition-colors cursor-pointer ${
                      selectedCustomer?.id === customer.id 
                        ? 'bg-blue-900 bg-opacity-40' 
                        : 'hover:bg-gray-600'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-blue-800 rounded-full p-2 mr-3">
                          <User className="h-5 w-5 text-blue-200" />
                        </div>
                        <div>
                          <span className="text-white font-medium block">{customer.name || 'Sin nombre'}</span>
                          <span className="text-gray-400 text-sm">ID: {customer.id}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Detalles del cliente seleccionado y sus órdenes */}
      {selectedCustomer && (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="h-6 w-6 text-blue-400 mr-2" />
            Órdenes de {selectedCustomer.name || 'Cliente'}
          </h3>
          
          {orders && orders.length > 0 ? (
            <div>
              <p className="text-gray-300 mb-4">
                Se encontraron {orders.length} órdene(s) para este cliente.
              </p>
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Número</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {orders.map((order, index) => (
                      <tr key={index} className="hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{order.number}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{order.ticket}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-green-400 text-right font-medium">
                          ${parseFloat(order.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{formatDate(order.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : !loading ? (
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-blue-300 text-lg">No se encontraron órdenes para este cliente.</p>
              <p className="text-gray-400 mt-2">El cliente seleccionado no tiene órdenes registradas en el sistema.</p>
            </div>
          ) : (
            <div className="flex justify-center my-6">
              <LoadingSpinner />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;