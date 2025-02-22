// src/components/SearchTicket.js
import React, { useState } from 'react';

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
      {orderData && (
        <div className="bg-gray-800 p-4 rounded">
          <pre>{JSON.stringify(orderData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SearchTicket;
