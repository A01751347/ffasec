import { motion } from "framer-motion";
import React, { useState } from "react";
import { Trash, Edit, Plus } from "lucide-react";
import { 
  useInventoryDetails, 
  useAddInventory, 
  useUpdateInventory, 
  useDeleteInventory 
} from "../../../hooks/useApi";
import { useAppContext } from "../../../context/AppContext";
import LoadingSpinner from "../../ui/LoadingSpinner";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

const InventoryDetails = () => {
  const { showNotification } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRegistro, setNewRegistro] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    ticket: "",
    date: "",
    name: "",
    telefono: ""
  });

  // Utilizar los hooks personalizados de React Query
  const { 
    data: details = [], 
    isLoading, 
    error, 
    refetch 
  } = useInventoryDetails();
  
  const addInventoryMutation = useAddInventory();
  const updateInventoryMutation = useUpdateInventory();
  const deleteInventoryMutation = useDeleteInventory();

  const handleAddRegistroSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validar que newRegistro sea un número válido
      if (!newRegistro || isNaN(parseInt(newRegistro, 10))) {
        showNotification("Por favor, ingresa un número válido para el registro", "error");
        return;
      }
  
      // Convertir explícitamente a número entero y asegurarse de que sea válido
      const registroNumerico = parseInt(newRegistro, 10);
      console.log("Registro a agregar (valor numérico):", registroNumerico);
      
      // Enviar solo el valor numérico, no un objeto
      const result = await addInventoryMutation.mutateAsync(registroNumerico);
      
      let mensaje = "Registro agregado correctamente";
      if (result?.telefono) {
        mensaje += `. Teléfono del cliente: ${result.telefono}`;
      } else {
        mensaje += ". No se encontró teléfono del cliente.";
      }
      
      showNotification(mensaje, "success");
      setNewRegistro("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding registro:", error);
      showNotification(
        `Error al agregar el registro: ${error.response?.data?.error || error.message}`, 
        "error"
      );
    }
  };

  // Eliminar registro
  const handleDelete = async (ticket) => {
    if (!window.confirm("¿Está seguro de eliminar este registro?")) return;
    
    try {
      await deleteInventoryMutation.mutateAsync(ticket);
      showNotification("Registro eliminado correctamente", "success");
    } catch (error) {
      console.error("Error deleting registro:", error);
      showNotification(
        `Error al eliminar el registro: ${error.response?.data?.error || error.message}`, 
        "error"
      );
    }
  };

  // Abrir el modal de edición y cargar los datos actuales
  const openEditModal = (item) => {
    setEditFormData({
      ticket: item.ticket,
      date: item.date || "",
      name: item.name || "",
      telefono: item.telefono || "",
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
      await updateInventoryMutation.mutateAsync({
        ticket: editFormData.ticket,
        telefono: editFormData.telefono
      });
      
      showNotification("Registro actualizado correctamente", "success");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating registro:", error);
      showNotification(
        `Error al actualizar el registro: ${error.response?.data?.error || error.message}`, 
        "error"
      );
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
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={18} />
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
            <button 
              type="submit" 
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={addInventoryMutation.isLoading}
            >
              {addInventoryMutation.isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Guardando...
                </span>
              ) : (
                "Guardar"
              )}
            </button>
          </form>
        )}

        {/* Estado de carga y error */}
        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg mb-4 text-white">
            <p>Error al cargar detalles: {error.message}</p>
            <button 
              className="mt-2 bg-red-700 px-3 py-1 rounded text-sm"
              onClick={() => refetch()}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla de detalles */}
        {!isLoading && !error && (
          details.length > 0 ? (
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
                        {item.telefono || "-"}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 flex gap-2">
                        <button
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          onClick={() => openEditModal(item)}
                          disabled={updateInventoryMutation.isLoading}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 transition-colors"
                          onClick={() => handleDelete(item.ticket)}
                          disabled={deleteInventoryMutation.isLoading}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No hay registros de inventario para mostrar.</p>
          )
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
                  value={editFormData.date?.substring(0, 10) || ""}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Cliente</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-100 text-sm">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={editFormData.telefono || ""}
                  onChange={handleEditChange}
                  className="border border-gray-600 bg-gray-700 text-white p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  disabled={updateInventoryMutation.isLoading}
                >
                  {updateInventoryMutation.isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Guardando...
                    </span>
                  ) : (
                    "Guardar Cambios"
                  )}
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