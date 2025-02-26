import React from 'react';
import CustomerOrdersSearch from '../components/CustomerOrdersSearch';

const CustomersPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Clientes</h1>
      <CustomerOrdersSearch />
    </div>
  );
};

export default CustomersPage;
