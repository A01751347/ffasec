// OrderCarousel.jsx
import React, { useEffect, useState } from 'react';

// Función para formatear la fecha (se asume que viene en formato ISO)
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

const OrderCarousel = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Se busca obtener todas las órdenes
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders'); // Ajusta el endpoint según tu API
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Órdenes</h2>
      {/* Contenedor del carrusel con scroll horizontal */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4">
          {orders.length > 0 ? (
            orders.map((order, index) => {
              // Calcular totales para cada orden
              let totalPrice = 0;
              let totalPieces = 0;
              if (order.details && Array.isArray(order.details)) {
                totalPrice = order.details.reduce((acc, detail) => acc + (parseFloat(detail.price) || 0), 0);
                totalPieces = order.details.reduce((acc, detail) => acc + (parseInt(detail.pieces, 10) || 0), 0);
              }
              return (
                <div key={index} className="min-w-[350px] max-h-[700px] bg-gray-800 p-4 rounded-xl shadow-md">
                  {/* Resumen de la orden */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">Orden #{order.number}</h3>
                    <p className="text-white"> 
                      <strong>Ticket:</strong> {order.ticket}
                    </p>
                    <p className="text-white">
                      <strong>Fecha:</strong> {formatDate(order.date)}
                    </p>
                    <p className="text-white">
                      <strong>Cliente:</strong> {order.name}
                    </p>
                  </div>
                  {/* Detalles de la orden */}
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-white mb-2">Detalles</h4>
                    {order.details && order.details.length > 0 ? (
                      order.details.map((item, i) => (
                        <div key={i} className="bg-gray-700 p-3 mb-2 rounded">
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
                      ))
                    ) : (
                      <p className="text-white">No hay detalles.</p>
                    )}
                  </div>
                  {/* Totales de la orden */}
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white font-bold">
                      <strong>Total Precio:</strong> {totalPrice.toFixed(2)}
                    </p>
                    <p className="text-white font-bold">
                      <strong>Total Piezas:</strong> {totalPieces}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-white">No hay órdenes para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCarousel;
