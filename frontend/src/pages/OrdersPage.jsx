// src/pages/OrdersPage.jsx
import React from 'react';
import SearchTicket from '../components/SearchTicket';

const OrdersPage = () => {
  return (
    <div className="p-4  z-10">
      <h1 className="text-4xl font-bold mb-4">Órdenes</h1>
      <SearchTicket />
    </div>
  );
};

export default OrdersPage;
