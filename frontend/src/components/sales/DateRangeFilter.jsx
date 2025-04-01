import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onDateChange 
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const handleApply = () => {
    onDateChange(localStartDate, localEndDate);
  };

  // Establecer rango predefinido
  const setQuickRange = (range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'thisWeek':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:

      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
        return;
    }

    // Formatear fechas para input
    setLocalStartDate(start.toISOString().split('T')[0]);
    setLocalEndDate(end.toISOString().split('T')[0]);
    onDateChange(
      start.toISOString().split('T')[0], 
      end.toISOString().split('T')[0]
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 w-full">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label className="text-sm text-gray-400 whitespace-nowrap">Desde:</label>
        <input
          type="date"
          value={localStartDate}
          onChange={(e) => setLocalStartDate(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1 w-full"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <label className="text-sm text-gray-400 whitespace-nowrap">Hasta:</label>
        <input
          type="date"
          value={localEndDate}
          onChange={(e) => setLocalEndDate(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1 w-full"
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <button 
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Calendar size={16} />
          Aplicar
        </button>
        
        <div className="relative">
          <select
            onChange={(e) => setQuickRange(e.target.value)}
            className="bg-gray-700 text-white rounded px-4 py-2 appearance-none"
          >
            <option value="">Rápido</option>
            <option value="today">Hoy</option>
            <option value="thisWeek">Esta Semana</option>
            <option value="thisMonth">Este Mes</option>
            <option value="lastMonth">Mes Anterior</option>
            <option value="thisYear">Este Año</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;