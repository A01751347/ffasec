// src/App.jsx
import React from 'react';
import SearchTicket from './components/SearchTicket.jsx';
import DailyReport from './components/DailyReport.jsx';
import UploadExcel from './components/UploadExcel.jsx';
import CustomerOrdersSearch from './components/CustomerOrdersSearch';
import Inventory from './components/Inventory';
import InventoryDetails from './components/InventoryDetails';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Dashboard de Facturas</h1>
      <UploadExcel />
      <div className="mb-8">
        <SearchTicket />

      <Inventory />

      <InventoryDetails />
      </div>
      <div>
        <DailyReport />
        <CustomerOrdersSearch />
      </div>
    </div>
  );
}

export default App;
