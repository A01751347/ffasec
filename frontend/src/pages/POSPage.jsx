// frontend/src/pages/POSPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const POSPage = () => {
  const navigate = useNavigate();
  // Estados para los productos
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Cargar productos al iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fromDate = '2023-01-01';
        const toDate = '2024-12-31';
        
        const response = await fetch(`/api/products?from=${fromDate}&to=${toDate}`);
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrar productos según la búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Calcular total del carrito
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, id: product.id || Date.now() }];
      }
    });
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Actualizar cantidad de un producto
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

  // Calcular cambio
  const calculateChange = (value) => {
    const received = parseFloat(value);
    if (!isNaN(received)) {
      setCashReceived(value);
      setChange(received - total);
    } else {
      setCashReceived(value);
      setChange(0);
    }
  };

  // Procesar pago (versión temporal sin dependencia del backend)
const processPayment = async () => {
  if (cart.length === 0) return;
  
  try {
    setProcessing(true);
    
    // Guardar los datos de la venta en localStorage para que no se pierdan
    const saleData = {
      id: Date.now(),
      items: cart.map(item => ({
        nombre: item.name,
        categoria: item.category,
        precio: item.price,
        cantidad: item.quantity,
        subtotal: item.price * item.quantity
      })),
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : 0,
      change: paymentMethod === 'cash' ? change : 0,
      customerName: customerName || "Cliente General",
      date: new Date().toISOString()
    };
    
    // Guardar en localStorage
    const savedSales = JSON.parse(localStorage.getItem('ffasecSales') || '[]');
    savedSales.push(saleData);
    localStorage.setItem('ffasecSales', JSON.stringify(savedSales));
    
    // Log para referencia
    console.log("VENTA GUARDADA:", saleData);
    
    // Simular éxito
    setTimeout(() => {
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
    }, 1000);
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    alert('Hubo un problema con la venta, pero se ha guardado localmente.');
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
            <div className="text-center py-8">Cargando productos...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.name}
                  className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600"
                  onClick={() => addToCart(product)}
                >
                  <h3 className="font-medium text-white truncate">{product.name}</h3>
                  <p className="text-sm text-gray-300">{product.category}</p>
                  <p className="text-blue-400 font-bold mt-2">${product.price?.toFixed(2)}</p>
                </div>
              ))}

              {filteredProducts.length === 0 && (
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
              El carrito está vacío.
            </div>
          ) : (
            <>
              <ul className="space-y-2 mb-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm">${item.price?.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-600 text-white px-2 py-1 rounded mr-1"
                      >
                        -
                      </button>
                      <span className="mx-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
                disabled={cart.length === 0}
              >
                Procesar Pago
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            {paymentComplete ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">¡Pago Completado!</h3>
                <p className="text-gray-300">La venta se ha registrado exitosamente.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Procesar Pago</h2>
                
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
                  <h3 className="font-medium mb-2">Método de pago</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2 rounded ${
                        paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-700'
                      }`}
                    >
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2 rounded ${
                        paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-700'
                      }`}
                    >
                      Tarjeta
                    </button>
                  </div>
                </div>
                
                {paymentMethod === 'cash' && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Efectivo recibido</h3>
                    <input
                      type="text"
                      value={cashReceived}
                      onChange={(e) => calculateChange(e.target.value)}
                      placeholder="Ingrese monto recibido"
                      className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                    />
                    
                    {cashReceived && (
                      <div className="mt-2 flex justify-between">
                        <span>Cambio:</span>
                        <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${change.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
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
                        : 'bg-blue-600 hover:bg-blue-700'
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