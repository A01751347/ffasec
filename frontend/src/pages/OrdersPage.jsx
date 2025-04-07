// frontend/src/pages/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingBag, Calendar, FileText, DollarSign, Clock, Clipboard } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Función para formatear la fecha (asume que viene en formato ISO)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

// Componente para mostrar un mensaje de estado (error, vacío, etc.)
const StatusMessage = ({ type, title, message, icon: Icon }) => {
  const bgColor = {
    error: 'bg-red-900 bg-opacity-50',
    info: 'bg-blue-900 bg-opacity-50',
    warning: 'bg-yellow-900 bg-opacity-50',
    success: 'bg-green-900 bg-opacity-50',
  }[type] || 'bg-blue-900 bg-opacity-50';

  const textColor = {
    error: 'text-red-300',
    info: 'text-blue-300',
    warning: 'text-yellow-300',
    success: 'text-green-300',
  }[type] || 'text-blue-300';

  return (
    <div className={`${bgColor} rounded-lg p-6 text-center`}>
      {Icon && <Icon className={`h-12 w-12 ${textColor} mx-auto mb-4`} />}
      <p className={`${textColor} text-lg font-medium`}>{title}</p>
      {message && <p className="text-gray-400 mt-2">{message}</p>}
    </div>
  );
};

const OrdersPage = () => {
  const [searchType, setSearchType] = useState('ticket'); // 'ticket', 'date', 'customer'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Cargar órdenes recientes al inicio
  useEffect(() => {
    fetchRecentOrders();
  }, []);

  // Función para obtener órdenes recientes
  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/orders?page=1&limit=5');
      
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes recientes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        setRecentOrders(data.data);
      } else {
        console.error('Formato de respuesta inesperado en órdenes recientes:', data);
        setRecentOrders([]);
      }
    } catch (error) {
      console.error('Error al obtener órdenes recientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar órdenes
  const handleSearch = async () => {
    // Validar entrada según tipo de búsqueda
    if (searchType === 'ticket' && !searchTerm.trim()) {
      setError('Ingresa un número de ticket');
      return;
    }
    
    if (searchType === 'date' && !searchDate) {
      setError('Selecciona una fecha');
      return;
    }
    
    if (searchType === 'customer' && !searchTerm.trim()) {
      setError('Ingresa el nombre del cliente');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrderData(null);
      
      let response;
      
      // Ejecutar búsqueda según el tipo
      if (searchType === 'ticket') {
        response = await fetch(`/api/orders/${searchTerm.trim()}`);
      } else if (searchType === 'date') {
        response = await fetch(`/api/orders/byDate?date=${searchDate}`);
      } else {
        // Búsqueda por cliente - primero buscamos el cliente
        const customerResponse = await fetch(`/api/customers?query=${encodeURIComponent(searchTerm.trim())}`);
        
        if (!customerResponse.ok) {
          throw new Error(`Error al buscar clientes: ${customerResponse.status} ${customerResponse.statusText}`);
        }
        
        const customers = await customerResponse.json();
        
        if (!Array.isArray(customers) || customers.length === 0) {
          setError('No se encontró ningún cliente con ese nombre');
          setLoading(false);
          return;
        }
        
        // Usar el primer cliente encontrado
        response = await fetch(`/api/orders/byCustomer/${customers[0].id}`);
      }
      
      if (!response.ok) {
        throw new Error(`Error al buscar orden: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Procesar datos según el tipo de búsqueda
      if (searchType === 'ticket') {
        setOrderData(data);
      } else if (searchType === 'date') {
        setOrderData({ orders: Array.isArray(data) ? data : [] });
      } else if (searchType === 'customer') {
        setOrderData({ 
          customer: customers[0],
          orders: data.data || []
        });
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setError('Error al buscar: ' + (error.message || 'Error desconocido'));
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

  // Calcular totales para una orden
  const calculateOrderTotals = (order) => {
    if (!order) return { totalPrice: 0, totalPieces: 0 };
    
    // Si es una orden con detalles
    if (order.details && Array.isArray(order.details)) {
      const totalPrice = order.details.reduce((acc, detail) => acc + (parseFloat(detail.price) || 0), 0);
      const totalPieces = order.details.reduce((acc, detail) => acc + (parseInt(detail.pieces, 10) || 0), 0);
      return { totalPrice, totalPieces };
    }
    
    // Si es un orden del listado general
    if (order.total) {
      return { totalPrice: parseFloat(order.total || 0), totalPieces: 0 };
    }
    
    return { totalPrice: 0, totalPieces: 0 };
  };

  return (
    <div className="p-6 max-w-7xl relative z-10 mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de Órdenes</h1>
        <p className="text-gray-400">Busca órdenes por ticket, fecha o cliente</p>
      </div> 

      {/* Panel de búsqueda */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">Buscar Órdenes</h2>
        
        {/* Opciones de tipo de búsqueda */}
        <div className="flex flex-wrap mb-4 gap-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              searchType === 'ticket' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setSearchType('ticket')}
          >
            <Package size={18} />
            <span>Por Ticket</span>
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              searchType === 'date' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setSearchType('date')}
          >
            <Calendar size={18} />
            <span>Por Fecha</span>
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              searchType === 'customer' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setSearchType('customer')}
          >
            <ShoppingBag size={18} />
            <span>Por Cliente</span>
          </button>
        </div>
        
        {/* Campo de búsqueda según tipo */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            {searchType === 'date' ? (
              <>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full pl-10 py-2 px-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            ) : (
              <>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    searchType === 'ticket' 
                      ? 'Ingresa el número de ticket' 
                      : 'Ingresa el nombre del cliente'
                  }
                  className="w-full pl-10 py-2 px-4 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
          </div>
          <button 
            onClick={handleSearch} 
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
                <Search size={18} />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>

        {/* Estado de error */}
        {error && !loading && (
          <div className="bg-red-900 bg-opacity-50 text-white p-4 rounded-lg mb-4 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center my-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Resultados de la búsqueda */}
      {!loading && orderData && (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6 mb-8">
          {/* Búsqueda por ticket - detalle de una orden */}
          {searchType === 'ticket' && (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <FileText className="h-6 w-6 text-blue-400 mr-2" />
                Detalles de la Orden
              </h2>
              
              {/* Resumen de la orden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Clipboard className="h-5 w-5 text-blue-400 mr-2" />
                    Información General
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-300 flex justify-between">
                      <span className="text-gray-400">Número de Orden:</span>
                      <span className="font-medium">{orderData.number}</span>
                    </p>
                    <p className="text-gray-300 flex justify-between">
                      <span className="text-gray-400">Ticket:</span>
                      <span className="font-medium">{orderData.ticket}</span>
                    </p>
                    <p className="text-gray-300 flex justify-between">
                      <span className="text-gray-400">Fecha:</span>
                      <span className="font-medium">{formatDate(orderData.date)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <ShoppingBag className="h-5 w-5 text-blue-400 mr-2" />
                    Cliente
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-300 flex justify-between">
                      <span className="text-gray-400">ID Cliente:</span>
                      <span className="font-medium">{orderData.customerId}</span>
                    </p>
                    <p className="text-gray-300 flex justify-between">
                      <span className="text-gray-400">Nombre:</span>
                      <span className="font-medium">{orderData.customerName}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de la orden */}
              {orderData.details && orderData.details.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                    <Package className="h-5 w-5 text-blue-400 mr-2" />
                    Detalles de la Orden
                  </h3>
                  <div className="overflow-x-auto rounded-lg">
                    <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Proceso</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descripción</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Piezas</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Cantidad</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Precio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {orderData.details.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-800 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-100">{item.process}</td>
                            <td className="px-4 py-3 text-sm text-gray-100">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-100 text-center">{item.pieces}</td>
                            <td className="px-4 py-3 text-sm text-gray-100 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                              ${parseFloat(item.price || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Totales */}
                  <div className="mt-4 bg-blue-900 bg-opacity-30 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <p className="text-blue-300 font-bold text-lg flex items-center">
                        <DollarSign className="h-5 w-5 mr-1" />
                        Total Precio: ${calculateOrderTotals(orderData).totalPrice.toFixed(2)}
                      </p>
                      <p className="text-blue-300 font-bold text-lg flex items-center">
                        <Package className="h-5 w-5 mr-1" />
                        Total Piezas: {calculateOrderTotals(orderData).totalPieces}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <StatusMessage 
                  type="info" 
                  title="No hay detalles disponibles"
                  message="Esta orden no tiene detalles registrados."
                  icon={Package}
                />
              )}
            </>
          )}

          {/* Búsqueda por fecha - listado de órdenes de una fecha */}
          {searchType === 'date' && (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="h-6 w-6 text-blue-400 mr-2" />
                Órdenes del {formatDate(searchDate)}
              </h2>
              
              {orderData.orders && orderData.orders.length > 0 ? (
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Número</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID Cliente</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {orderData.orders.map((order, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => {
                            setSearchType('ticket');
                            setSearchTerm(order.ticket);
                            handleSearch();
                          }}
                        >
                          <td className="px-4 py-3 text-sm text-gray-100">{order.number}</td>
                          <td className="px-4 py-3 text-sm text-gray-100">{order.ticket}</td>
                          <td className="px-4 py-3 text-sm text-gray-100">{order.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-100">{order.id}</td>
                          <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <StatusMessage 
                  type="info" 
                  title="No hay órdenes para esta fecha"
                  message="No se encontraron órdenes para la fecha seleccionada."
                  icon={Calendar}
                />
              )}
            </>
          )}

          {/* Búsqueda por cliente - órdenes de un cliente */}
          {searchType === 'customer' && (
            <>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ShoppingBag className="h-6 w-6 text-blue-400 mr-2" />
                Órdenes de {orderData.customer?.name || 'Cliente'}
              </h2>
              
              {orderData.orders && orderData.orders.length > 0 ? (
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
                      {orderData.orders.map((order, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => {
                            setSearchType('ticket');
                            setSearchTerm(order.ticket);
                            handleSearch();
                          }}
                        >
                          <td className="px-4 py-3 text-sm text-gray-100">{order.number}</td>
                          <td className="px-4 py-3 text-sm text-gray-100">{order.ticket}</td>
                          <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                            ${parseFloat(order.total || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-100">{formatDate(order.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <StatusMessage 
                  type="info" 
                  title="No hay órdenes para este cliente"
                  message="El cliente seleccionado no tiene órdenes registradas."
                  icon={ShoppingBag}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Órdenes recientes (si no hay búsqueda activa) */}
      {!loading && !orderData && recentOrders.length > 0 && (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Clock className="h-6 w-6 text-blue-400 mr-2" />
            Órdenes Recientes
          </h2>
          
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Número</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-100">{order.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-100">{order.ticket}</td>
                    <td className="px-4 py-3 text-sm text-gray-100">{order.name}</td>
                    <td className="px-4 py-3 text-sm text-green-400 text-right font-medium">
                      ${parseFloat(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-100">{formatDate(order.date)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        onClick={() => {
                          setSearchType('ticket');
                          setSearchTerm(order.ticket);
                          handleSearch();
                        }}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;