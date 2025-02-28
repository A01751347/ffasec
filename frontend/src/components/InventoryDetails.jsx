import React, { useEffect, useState } from 'react';


const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

const InventoryDetails = () => {
  const [details, setDetails] = useState([]);

  const fetchInventoryDetails = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/inventario/details');
      const data = await res.json();
      setDetails(data);
    } catch (error) {
      console.error('Error fetching inventory details:', error);
    }
  };

  useEffect(() => {
    fetchInventoryDetails();
  }, []);

  return (
    <div className="p-4 border rounded mb-8">
      <h2 className="text-2xl font-bold mb-4">Detalles de Inventario</h2>
      {details.length > 0 ? (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Ticket</th>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Cliente</th>
              <th className="border p-2">Telefono</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.ticket}</td>
                <td className="border p-2">{formatDate(item.date)}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No se encontraron detalles.</p>
      )}
    </div>
  );
};

export default InventoryDetails;
