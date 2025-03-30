// frontend/src/components/pos/PointOfSale.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, CreditCard, DollarSign, Trash, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // Importar biblioteca uuid para generar identificadores únicos

const PointOfSale = () => {
  // Estados para los productos y la búsqueda
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el carrito
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Estados para el pago
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  
  // Estado para el nombre del cliente
  const [customerName, setCustomerName] = useState('Cliente General');
  
  // Función para cargar productos, memoizada para evitar recreaciones innecesarias
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Formatear fechas para la consulta
      const currentDate = new Date();
      const fromDate = new Date(currentDate.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
      const toDate = currentDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/products?from=${fromDate}&to=${toDate}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Asegurar que cada producto tenga un ID único
      const productsWithIds = data.map(product => ({
        ...product,
        id: product.id || uuidv4(), // Usar UUID para garantizar unicidad
        price: parseFloat(product.price) || 0, // Convertir precio a número
        stock: parseInt(product.stock) || 0, // Convertir stock a entero
        sales: parseInt(product.sales) || 0 // Convertir ventas a entero
      }));
      
      setProducts(productsWithIds);
      setFilteredProducts(productsWithIds);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar productos al iniciar
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Efecto para calcular el total del carrito
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
    
    // Reset change calculation when cart changes
    if (cart.length === 0) {
      setCashReceived('');
      setChange(0);
    }
  }, [cart]);

  // Filtrar productos según término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
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

  // Añadir producto al carrito
  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error('Intento de añadir un producto inválido al carrito:', product);
      return;
    }
    
    setCart(prevCart => {
      // Check if product is already in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if already in cart
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { 
          ...product,
          quantity: 1
        }];
      }
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de producto en el carrito
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  // Calcular cambio basado en el dinero recibido
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

  // Procesar el pago
  const processPayment = async () => {
    if (cart.length === 0) return;
    
    try {
      setProcessing(true);
      
      // Preparar los datos para el backend
      const saleData = {
        items: cart.map(item => ({
          name: item.name,
          category: item.category || '',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1
        })),
        total,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : null,
        change: paymentMethod === 'cash' ? change : null,
        date: new Date().toISOString(),
        customerName: customerName.trim() || 'Cliente General'
      };
      
      // Enviar datos al servidor
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
      
      // Procesar respuesta exitosa
      const responseData = await response.json();
      console.log('Venta procesada:', responseData);
      
      // Resetear estados después de una venta exitosa
      setTransactionComplete(true);
      setTimeout(() => {
        setCart([]);
        setCustomerName('Cliente General');
        setCashReceived('');
        setChange(0);
        setShowPaymentModal(false);
        setTransactionComplete(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
      console.error('Error processing payment:', err);
      alert(`Error: ${err.message || 'Ha ocurrido un error al procesar el pago'}`);
    } finally {
      setProcessing(false);
    }
  };

  // Verificar si el pago es válido
  const isPaymentValid = () => {
    if (paymentMethod === 'card') return true;
    
    if (!cashReceived) return false;
    
    const received = parseFloat(cashReceived);
    return !isNaN(received) && received >= total;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 py-4 px-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Punto de Venta</h1>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Products Panel */}
        <div className="w-2/3 bg-gray-900 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-50 text-white p-4 rounded-lg">
              <p>{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 bg-red-700 hover:bg-red-600 px-4 py-2 rounded-md text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-pointer"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
                    onClick={() => addToCart(product)}
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {product.name || 'Producto sin nombre'}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {product.category || 'Sin categoría'}
                      </p>
                      <p className="text-blue-400 font-bold">
                        ${(product.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-400">
                  <p>No se encontraron productos.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Cart Panel */}
        <div className="w-1/3 bg-gray-800 p-6 flex flex-col border-l border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Carrito de Compra</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash size={18} />
              </button>
            )}
          </div>
          
          {/* Campo de nombre de cliente */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cliente:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                <p>El carrito está vacío.</p>
                <p className="text-sm">Haga clic en un producto para agregarlo.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {cart.map((item) => (
                  <li key={item.id} className="bg-gray-700 rounded-lg p-3 flex justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-300">
                        ${(item.price || 0).toFixed(2)} x {item.quantity}
                      </p>
                      <p className="text-sm text-blue-300 font-medium">
                        Subtotal: ${((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-white bg-gray-600 hover:bg-gray-500 p-1 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-white bg-gray-600 hover:bg-gray-500 p-1 rounded"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 bg-gray-600 hover:bg-gray-500 p-1 rounded ml-2"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Cart Summary */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span className="text-white">Total:</span>
              <span className="text-blue-400">${total.toFixed(2)}</span>
            </div>
            
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Procesar Pago
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <motion.div
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {transactionComplete ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¡Pago Completado!</h3>
                <p className="text-gray-300">La transacción se ha procesado exitosamente.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Procesar Pago</h2>
                
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-2">Método de pago</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'cash' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <DollarSign size={20} className="mr-2" />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'card' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <CreditCard size={20} className="mr-2" />
                      Tarjeta
                    </button>
                  </div>
                </div>
                
                {paymentMethod === 'cash' && (
                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-2">Efectivo recibido</h3>
                    <input
                      type="text"
                      value={cashReceived}
                      onChange={(e) => calculateChange(e.target.value)}
                      placeholder="Ingrese el monto recibido"
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    
                    {cashReceived && (
                      <div className="mt-2 flex justify-between">
                        <span className="text-gray-300">Cambio:</span>
                        <span className={`font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${change.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span className="text-white">Total:</span>
                  <span className="text-blue-400">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={!isPaymentValid() || processing}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Procesando...' : 'Completar Pago'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;