import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const Inventory = () => {
  const [registro, setRegistro] = useState("");
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState("");

  // Función para obtener el inventario actual
  const fetchInventory = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/inventario");
      const data = await res.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Función para agregar un nuevo registro al inventario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5002/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registro: parseInt(registro, 10) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registro agregado correctamente");
        setRegistro("");
        fetchInventory(); // refrescar inventario
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error adding inventory:", error);
      setMessage("Error al agregar el registro");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        Registro de Inventario
      </h2>
      <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-4">
        <input
          type="number"
          value={registro}
          onChange={(e) => setRegistro(e.target.value)}
          placeholder="Ingrese el ticket (número)"
          className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Agregar Registro
        </button>
      </form>
      {message && <p className="mb-4 text-gray-100">{message}</p>}
    </motion.div>
  );
};

export default Inventory;
