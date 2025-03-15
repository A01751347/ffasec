import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const OrderList = ({ orders }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.length > 0 ? (
        orders.map((order) => (
          <motion.div
            key={order.number}
            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4">
              <FileText className="text-blue-400" size={28} />
              <h3 className="text-xl font-semibold text-gray-100">Orden #{order.number}</h3>
            </div>
            <p className="text-gray-300 mt-2"><strong>Ticket:</strong> {order.ticket}</p>
            <p className="text-gray-300"><strong>Cliente:</strong> {order.name}</p>
            <p className="text-gray-300"><strong>Total:</strong> ${order.total?.toFixed(2) || '0.00'}</p>
            <p className="text-gray-300"><strong>Fecha:</strong> {order.date}</p>
          </motion.div>
        ))
      ) : (
        <p className="text-gray-400 text-center col-span-full">No hay órdenes para esta fecha.</p>
      )}
    </div>
  );
};

export default OrderList;
