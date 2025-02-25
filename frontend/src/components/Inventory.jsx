import React, { useState, useEffect } from 'react';

const Inventory = () => {
  const [registro, setRegistro] = useState('');
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState('');

  // Función para obtener el inventario actual
  const fetchInventory = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/inventario');
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Función para agregar un nuevo registro al inventario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5001/api/inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registro: parseInt(registro, 10) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registro agregado correctamente');
        setRegistro('');
        fetchInventory(); // refrescar inventario
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding inventory:', error);
      setMessage('Error al agregar el registro');
    }
  };

  return (
    <div className="p-4 border rounded mb-8">
      <h2 className="text-2xl font-bold mb-4">Registro de Inventario</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="number"
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
          placeholder="Ingrese el ticket (número)"
          className="border p-2 rounded mr-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Agregar Registro
        </button>
      </form>
      {message && <p className="mb-4">{message}</p>}
      <h3 className="text-xl font-bold mb-2">Inventario Actual</h3>
      {/* <ul className="list-disc pl-5">
        {inventory.map((item, index) => (
          <li key={index}>Registro: {item.registro}</li>
        ))}
      </ul> */}
    </div>
  );
};

export default Inventory;
