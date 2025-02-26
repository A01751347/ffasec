// src/pages/InventoryPage.jsx
import React from 'react';
import Inventory from '../components/Inventory';
import InventoryDetails from '../components/InventoryDetails';

const InventoryPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Inventario</h1>
      <Inventory />
      <InventoryDetails />
    </div>
  );
};

export default InventoryPage;
