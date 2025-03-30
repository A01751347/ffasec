import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { productService } from "../../services/api";
import LoadingSpinner from "../ui/LoadingSpinner";

const ProductsTable = ({ fromDate, toDate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Usar React Query para obtener productos
  const { data: products, isLoading, error } = useQuery(
    ['products', fromDate, toDate],
    () => productService.getAll(fromDate, toDate).then((res) => res.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutos
      enabled: !!fromDate && !!toDate, // Solo ejecutar si hay fechas
    }
  );

  // Filtrar productos según el término de búsqueda
  useEffect(() => {
    if (!products) return;
    
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Título y búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-100">Lista de Productos</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>

      {/* Estado de carga y error */}
      {isLoading && (
        <div className="py-8 text-center">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="py-8 text-center text-red-500">
          <p>Error al cargar los productos: {error.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de productos */}
      {!isLoading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Piezas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => {
                    let priceValue = parseFloat(product.price);
                    if (isNaN(priceValue)) priceValue = 0;
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          ${priceValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {product.sales}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      No se encontraron productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          {filteredProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1 ? "bg-gray-600 text-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Anterior
              </button>
              <span className="text-gray-100">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages ? "bg-gray-600 text-gray-300" : "bg-blue-500 text-white"
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ProductsTable;