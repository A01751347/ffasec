// frontend/src/pages/POSPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Importar biblioteca uuid
import { useAppContext } from '../context/AppContext';

const POSPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  
  // Estados para los productos
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el carrito
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Estados para el pago
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Función para cargar productos, memoizada para evitar recreaciones innecesarias
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fechas para la consulta (último año)
      const currentDate = new Date();
      const fromDate = new Date(currentDate.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
      const toDate = currentDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/products?from=${fromDate}&to=${toDate}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Asegurar que cada producto tenga un ID único y precios válidos
      const processedProducts = data.map(product => ({
        ...product,
        id: product.id || uuidv4(),
        price: parseFloat(product.price) || 0
      }));
      
      setProducts(processedProducts);
      setFilteredProducts(processedProducts);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'Error desconocido al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      (product.name?.toLowerCase().includes(searchTermLower)) ||
      (product.category?.toLowerCase().includes(searchTermLower))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Calcular total del carrito
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    setTotal(newTotal);
    
    // Resetear campos de pago cuando cambia el carrito
    if (cart.length === 0) {
      setCashReceived('');
      setChange(0);
    }
  }, [cart]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error('Producto inválido:', product);
      return;
    }
    
    setCart(prevCart => {
      // Verificar si ya existe en el carrito
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si existe, actualizar cantidad
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: (parseInt(item.quantity) || 0) + 1 } 
            : item
        );
      } else {
        // Si no existe, agregar como nuevo item
        return [
          ...prevCart, 
          { 
            ...product, 
            quantity: 1
          }
        ];
      }
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId, newQuantity) => {
    // Validar que la cantidad sea un número positivo
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Calcular cambio
  const calculateChange = (value) => {
    // Eliminar caracteres no numéricos excepto punto decimal
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    const received = parseFloat(sanitizedValue);
    
    if (!isNaN(received)) {
      setCashReceived(sanitizedValue);
      setChange(received - total);
    } else {
      setCashReceived(sanitizedValue);
      setChange(0);
    }
  };

  // Procesar pago
  const processPayment = async () => {
    if (cart.length === 0) return;
    
    try {
      setProcessing(true);
      
      // Preparar datos de venta
      const saleData = {
        items: cart.map(item => ({
          name: item.name || 'Producto sin nombre',
          category: item.category || 'Sin categoría',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1
        })),
        total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) || 0 : 0,
        change: paymentMethod === 'cash' ? change : 0,
        customerName: customerName.trim() || 'Cliente General',
        date: new Date().toISOString()
      };
      
      try {
        // Intentar enviar al backend
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saleData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al procesar el pago');
        }
        
        const result = await response.json();
        console.log('Venta procesada exitosamente:', result);
        
        // Mostrar notificación de éxito
        showNotification('Venta completada con éxito', 'success');
        
      } catch (apiError) {
        console.error('Error al comunicarse con el API:', apiError);
        
        // Si falla el API, guardar localmente como respaldo
        const savedSales = JSON.parse(localStorage.getItem('ffasecSales') || '[]');
        savedSales.push({
          id: uuidv4(),
          ...saleData,
          localSave: true
        });
        localStorage.setItem('ffasecSales', JSON.stringify(savedSales));
        
        showNotification('Se guardó la venta localmente', 'warning');
      }
      
      // Mostrar confirmación
      setPaymentComplete(true);
      
      // Resetear estado después de 2 segundos
      setTimeout(() => {
        setCart([]);
        setCustomerName('');
        setCashReceived('');
        setChange(0);
        setShowPaymentModal(false);
        setPaymentComplete(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error general al procesar el pago:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Punto de Venta</h1>
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded">
          Volver
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel de productos */}
        <div className="md:w-2/3 bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-400">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-900 bg-opacity-50 rounded-lg p-4">
              <p className="text-white mb-2">{error}</p>
              <button 
                onClick={fetchProducts} 
                className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <h3 className="font-medium text-white truncate">
                      {product.name || 'Producto sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {product.category || 'Sin categoría'}
                    </p>
                    <p className="text-blue-400 font-bold mt-2">
                      ${(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-400">
                  No se encontraron productos.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel del carrito */}
        <div className="md:w-1/3 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Carrito de Compra</h2>
          
          {/* Campo de cliente */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre del Cliente:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Opcional"
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
            />
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto mb-2 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <p>El carrito está vacío.</p>
            </div>
          ) : (
            <>
              <ul className="space-y-2 mb-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-gray-300">
                        ${(item.price || 0).toFixed(2)} x {item.quantity}
                      </p>
                      <p className="text-sm text-blue-300">
                        Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 0) - 1)}
                        className="bg-gray-600 text-white px-2 py-1 rounded mr-1"
                      >
                        -
                      </button>
                      <span className="mx-1 text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, (item.quantity || 0) + 1)}
                        className="bg-gray-600 text-white px-2 py-1 rounded mr-1"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Procesar Pago
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            {paymentComplete ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">¡Pago Completado!</h3>
                <p className="text-gray-300">La venta se ha registrado exitosamente.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-white">Procesar Pago</h2>
                
                {/* Información del cliente */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Cliente:
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ingrese nombre del cliente"
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-white">Método de pago</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded ${
                        paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded ${
                        paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Tarjeta
                    </button>
                  </div>
                </div>
                
                {paymentMethod === 'cash' && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-white">Efectivo recibido</h3>
                    <input
                      type="text"
                      value={cashReceived}
                      onChange={(e) => calculateChange(e.target.value)}
                      placeholder="Ingrese monto recibido"
                      className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    />
                    
                    {cashReceived && (
                      <div className="mt-2 flex justify-between">
                        <span className="text-gray-300">Cambio:</span>
                        <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${change.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span className="text-white">Total:</span>
                  <span className="text-blue-400">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-700 text-white py-2 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={
                      processing || 
                      (paymentMethod === 'cash' && (parseFloat(cashReceived) < total || !cashReceived))
                    }
                    className={`flex-1 py-2 rounded ${
                      processing || (paymentMethod === 'cash' && (parseFloat(cashReceived) < total || !cashReceived))
                        ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {processing ? 'Procesando...' : 'Completar Pago'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;