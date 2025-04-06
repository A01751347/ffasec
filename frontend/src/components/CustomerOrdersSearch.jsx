// frontend/src/components/CustomerOrdersSearch.jsx - Versión ultra depurada
import React, { useState } from 'react';
import { Search, User } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

const CustomerOrdersSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Búsqueda ultra simplificada
  const searchCustomers = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Búsqueda directa sin procesar respuesta
      const response = await fetch(`/api/customers?query=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      // Log detallado para debuggear
      console.log("DATOS DE CLIENTES RECIBIDOS:", data);
      
      // Asignar datos sin validación
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función ultra simplificada para órdenes
  const fetchOrders = async (customerId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log de depuración
      console.log("BUSCANDO ÓRDENES PARA:", customerId);
      
      // Llamada directa a API con log completo de respuesta
      const response = await fetch(`/api/orders/byCustomer/${customerId}`);
      const raw = await response.text(); // Obtener respuesta en texto sin procesar
      
      console.log("RESPUESTA RAW:", raw);
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(raw);
        console.log("RESPUESTA PARSEADA:", data);
      } catch (e) {
        console.error("ERROR PARSEANDO JSON:", e);
        setError("Error en formato de respuesta");
        setOrders([]);
        return;
      }
      
      // Extraer órdenes de la manera más simple posible
      let extractedOrders = [];
      
      if (data && data.data && Array.isArray(data.data)) {
        extractedOrders = data.data;
      } else if (Array.isArray(data)) {
        extractedOrders = data;
      }
      
      console.log("ÓRDENES EXTRAÍDAS:", extractedOrders);
      setOrders(extractedOrders);
      
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejo simplificado de selección de cliente
  const handleCustomerSelect = (customer) => {
    console.log("CLIENTE SELECCIONADO:", customer);
    setSelectedCustomer(customer);
    fetchOrders(customer.id);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Buscar Clientes</h2>
      
      {/* Formulario de búsqueda simple */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchCustomers()}
          placeholder="Ingresa nombre o apellido"
          className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
        />
        <button 
          onClick={searchCustomers} 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && <div className="bg-red-900 p-3 rounded mb-4 text-white">{error}</div>}

      {/* Lista de clientes simple */}
      {customers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2">
            Resultados: {customers.length} cliente(s)
          </h3>
          <div className="bg-gray-700 rounded">
            <ul className="divide-y divide-gray-600">
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  className="p-3 cursor-pointer hover:bg-gray-600"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{customer.name || 'Sin nombre'}</span>
                    <span className="text-gray-400">ID: {customer.id}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Órdenes del cliente seleccionado - ultra simple */}
      {selectedCustomer && (
        <div className="mb-4 bg-gray-700 p-4 rounded">
          <h3 className="text-lg font-bold text-white mb-4">
            Órdenes de {selectedCustomer.name}
          </h3>
          
          {/* Debug info */}
          <pre className="bg-gray-900 p-2 text-xs text-gray-300 mb-4 rounded overflow-auto max-h-40">
            {JSON.stringify({selectedCustomer, ordersCount: orders?.length}, null, 2)}
          </pre>
          
          {/* Tabla simple */}
          {orders && orders.length > 0 ? (
            <table className="w-full bg-gray-800 rounded">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-2 text-left text-gray-400">Número</th>
                  <th className="p-2 text-left text-gray-400">Ticket</th>
                  <th className="p-2 text-left text-gray-400">Total</th>
                  <th className="p-2 text-left text-gray-400">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td className="p-2 text-white">{order.number}</td>
                    <td className="p-2 text-white">{order.ticket}</td>
                    <td className="p-2 text-white">${parseFloat(order.total || 0).toFixed(2)}</td>
                    <td className="p-2 text-white">{formatDate(order.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="bg-blue-900 p-4 rounded text-center">
              <p className="text-white">No se encontraron órdenes para este cliente.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersSearch;