import React, { useState } from 'react';


const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
};

const CustomerOrdersSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);

  // Función para buscar clientes por nombre o apellido
  const searchCustomers = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/customers?query=${searchTerm}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error buscando clientes:', error);
    }
  };

  // Función para obtener las órdenes de un cliente
  const fetchOrders = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/orders/byCustomer/${customerId}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
    }
  };

  // Maneja la selección de un cliente y trae sus órdenes
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    fetchOrders(customer.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Buscar Clientes</h2>
      <div className="flex gap-2 mb-4">

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ingresa nombre o apellido"
          className="border p-2 rounded flex-1"
        />
        <button onClick={searchCustomers} className="bg-blue-500 text-white p-2 rounded">
          Buscar
        </button>
      </div>

      {customers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Resultados:</h3>
          <ul className="list-disc pl-5">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className="cursor-pointer hover:underline"
                onClick={() => handleCustomerSelect(customer)}
              >
                {customer.name} (ID: {customer.id})
              </li>
            ))}
          </ul>
        </div>
        
      )}

      {selectedCustomer && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">
            Órdenes de {selectedCustomer.name}
          </h3>
          {orders && orders.length > 0 ? (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2">Ticket</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td className="border p-2">{order.ticket}</td>
                    <td className="border p-2">{order.total}</td>
                    <td className="border p-2">{formatDate(order.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron órdenes para este cliente.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersSearch;
