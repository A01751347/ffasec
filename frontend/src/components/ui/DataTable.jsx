// frontend/src/components/ui/DataTable.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';

const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  error = null,
  onRetry = () => {},
  searchable = true,
  searchFields = [],
  pagination = true,
  itemsPerPage = 10,
  emptyMessage = "No hay datos disponibles",
  errorMessage = "Error al cargar los datos",
  onRowClick = null,
  className = "",
  searchPlaceholder = "Buscar...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar datos cuando cambie el término de búsqueda o los datos
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredData(data);
      return;
    }

    // Si no se especifican campos de búsqueda, buscar en todos
    const fieldsToSearch = searchFields.length > 0 
      ? searchFields 
      : Object.keys(data[0]);

    const filtered = data.filter((item) => {
      return fieldsToSearch.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredData(filtered);
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, [searchTerm, data, searchFields]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = pagination
    ? filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : filteredData;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-50 p-6 rounded-lg text-white text-center">
        <p className="text-lg mb-3">{errorMessage}</p>
        <p className="text-sm mb-4 text-red-200">{error.message}</p>
        <button 
          onClick={onRetry} 
          className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar tabla
  return (
    <div className={className}>
      {/* Barra de búsqueda */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-700" : ""}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                    >
                      {column.render 
                        ? column.render(row) 
                        : row[column.accessor] || "-"}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && filteredData.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

// Memorizamos el componente para evitar re-renderizados innecesarios
export default memo(DataTable);