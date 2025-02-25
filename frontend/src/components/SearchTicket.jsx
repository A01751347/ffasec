import React, { useState } from 'react';

// Función para formatear la fecha (asume que viene en formato ISO)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

const SearchTicket = () => {
  const [ticket, setTicket] = useState('');
  const [orderData, setOrderData] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/${ticket}`);
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  // Calcular totales si hay datos
  let totalPrice = 0,
    totalPieces = 0;
  if (orderData && Array.isArray(orderData) && orderData.length > 0) {
    totalPrice = orderData.reduce((acc, detail) => acc + (parseFloat(detail.price) || 0), 0);
    totalPieces = orderData.reduce((acc, detail) => acc + (parseInt(detail.pieces, 10) || 0), 0);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Buscar Orden por Ticket</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={ticket}
          onChange={(e) => setTicket(e.target.value)}
          placeholder="Ingresa el ticket"
          className="border p-2 rounded flex-1"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">
          Buscar
        </button>
      </div>
      {orderData && orderData.length > 0 && (
        <div className="bg-gray-800 p-4 rounded">
          {/* Resumen de la orden */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2">Resumen de la Orden</h3>
            <p className="text-white">
              <strong>Número de Orden:</strong> {orderData[0].number}
            </p>
            <p className="text-white">
              <strong>Ticket:</strong> {orderData[0].ticket}
            </p>
            <p className="text-white">
              <strong>Fecha:</strong> {formatDate(orderData[0].date)}
            </p>
            <p className="text-white">
              <strong>Cliente:</strong> {orderData[0].name}
            </p>
          </div>
          {/* Detalles de la orden */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Detalles de la Orden</h3>
            {orderData.map((item, index) => (
              <div key={index} className="bg-gray-700 p-4 mb-4 rounded">
                <p className="text-white">
                  <strong>Proceso:</strong> {item.process}
                </p>
                <p className="text-white">
                  <strong>Descripción:</strong> {item.description}
                </p>
                <p className="text-white">
                  <strong>Piezas:</strong> {item.pieces}
                </p>
                <p className="text-white">
                  <strong>Cantidad:</strong> {item.quantity}
                </p>
                {item.price !== undefined && (
                  <p className="text-white">
                    <strong>Precio:</strong> {item.price}
                  </p>
                )}
              </div>
            ))}
          </div>
          {/* Totales */}
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-white font-bold">
              <strong>Total Precio:</strong> {totalPrice.toFixed(2)}
            </p>
            <p className="text-white font-bold">
              <strong>Total Piezas:</strong> {totalPieces}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTicket;
