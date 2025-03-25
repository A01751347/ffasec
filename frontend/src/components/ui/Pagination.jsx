// frontend/src/components/ui/Pagination.jsx
import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true,
  maxPageNumbers = 5,
  className = "",
  disabled = false
}) => {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) return null;

  // Determinar qué números de página mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= maxPageNumbers) {
      // Si hay menos páginas que el máximo, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Distribuir los números de página alrededor de la página actual
      let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2));
      let endPage = Math.min(totalPages, startPage + maxPageNumbers - 1);
      
      // Ajustar si estamos cerca del final
      if (endPage - startPage < maxPageNumbers - 1) {
        startPage = Math.max(1, endPage - maxPageNumbers + 1);
      }
      
      // Agregar primera página y elipsis si es necesario
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }
      
      // Agregar páginas intermedias
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Agregar última página y elipsis si es necesario
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Estilo base para botones de paginación
  const buttonStyle = "px-4 py-2 rounded transition-colors";
  const activeStyle = "bg-blue-500 text-white";
  const inactiveStyle = "bg-gray-700 text-gray-200 hover:bg-gray-600";
  const disabledStyle = "bg-gray-800 text-gray-500 cursor-not-allowed";

  return (
    <div className={`flex flex-wrap justify-center items-center gap-2 ${className}`}>
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={`${buttonStyle} ${
          currentPage === 1 || disabled ? disabledStyle : inactiveStyle
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Números de página */}
      {showPageNumbers && getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || disabled}
          className={`${buttonStyle} ${
            page === currentPage 
              ? activeStyle 
              : page === '...' || disabled 
                ? disabledStyle 
                : inactiveStyle
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={`${buttonStyle} ${
          currentPage === totalPages || disabled ? disabledStyle : inactiveStyle
        }`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// Memorizamos el componente para evitar re-renderizados innecesarios
export default memo(Pagination);