import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Trash, Edit } from "lucide-react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

const InventoryDetails = () => {
  const [details, setDetails] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRegistro, setNewRegistro] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    ticket: "",
    date: "",
    name: "",
    telefono: ""
  });

  // Cargar detalles de inventario
  const fetchInventoryDetails = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/inventario/details");
      const data = await res.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching inventory details:", error);
    }
  };

  useEffect(() => {
    fetchInventoryDetails();
  }, []);

  // Agregar un nuevo registro
  const handleAddRegistroSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5002/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registro: parseInt(newRegistro, 10) }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormMessage("Registro agregado correctamente");
        setNewRegistro("");
        fetchInventoryDetails();
        setShowAddForm(false);
      } else {
        setFormMessage("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error adding registro:", error);
      setFormMessage("Error al agregar el registro");
    }
  };

  // Eliminar registro (solicitando confirmación)
  const handleDelete = async (ticket) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
    try {
      const res = await fetch(`http://localhost:5002/api/inventario/details/${ticket}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        fetchInventoryDetails();
      } else {
        console.error("Error deleting registro:", data);
      }
    } catch (error) {
      console.error("Error deleting registro:", error);
    }
  };

  // Abrir el modal de edición y cargar los datos actuales
  const openEditModal = (item) => {
    setEditFormData({
      ticket: item.ticket,
      date: item.date,
      name: item.name,
      telefono: item.telefono,
    });
    setShowEditModal(true);
  };

  // Manejo de cambios en el formulario de edición del modal
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Guardar los cambios desde el modal
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5002/api/inventario/details/${editFormData.ticket}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editFormData),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        fetchInventoryDetails();
      } else {
        console.error("Error updating registro:", data);
      }
    } catch (error) {
      console.error("Error updating registro:", error);
    }
  };

  return (
    <>
      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Detalles de Inventario</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Agregar Registro
          </button>
        </div>

        {/* Formulario para agregar un nuevo registro */}
        {showAddForm && (
          <form onSubmit={handleAddRegistroSubmit} className="mb-4 flex items-center gap-4">
            <input
              type="number"
              value={newRegistro}
              onChange={(e) => setNewRegistro(e.target.value)}
              placeholder="Ingrese el ticket (número)"
              className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
              required
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Guardar
            </button>
          </form>
        )}
        {formMessage && <p className="text-gray-100 mb-4">{formMessage}</p>}

        {/* Tabla de detalles */}
        {details.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {details.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {item.ticket}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.telefono}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 flex gap-2">
                      <Edit
                        className="cursor-pointer hover:text-blue-400"
                        size={18}
                        onClick={() => openEditModal(item)}
                      />
                      <Trash
                        className="cursor-pointer hover:text-red-500"
                        size={18}
                        onClick={() => handleDelete(item.ticket)}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-100">No se encontraron detalles.</p>
        )}
      </motion.div>

      {/* Modal para editar registro */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Editar Registro</h3>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Ticket</label>
                <input
                  type="number"
                  name="ticket"
                  value={editFormData.ticket}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Fecha</label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date.substring(0, 10)}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Cliente</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={editFormData.telefono}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default InventoryDetails;
