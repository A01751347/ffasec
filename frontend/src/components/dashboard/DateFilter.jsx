// src/components/dashboard/DateFilter.jsx
import React, { useState } from 'react';

const DateFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('month');
  const [comparePeriod, setComparePeriod] = useState('previous');

  const handleFilterChange = () => {
    onFilterChange({ startDate, endDate, period, comparePeriod });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2">
        <label className="text-gray-300">Desde:</label>
        <input
          type="date"
          className="p-2 rounded border border-gray-600 bg-gray-700 text-gray-100"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="text-gray-300">Hasta:</label>
        <input
          type="date"
          className="p-2 rounded border border-gray-600 bg-gray-700 text-gray-100"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
        <select
          className="p-2 rounded border border-gray-600 bg-gray-700 text-gray-100"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
          <option value="quarter">Trimestre</option>
          <option value="year">Año</option>
        </select>
        <select
          className="p-2 rounded border border-gray-600 bg-gray-700 text-gray-100"
          value={comparePeriod}
          onChange={(e) => setComparePeriod(e.target.value)}
        >
          <option value="previous">Comparar con periodo anterior</option>
          <option value="year">Comparar con año anterior</option>
        </select>
        <button
          onClick={handleFilterChange}
          className="bg-blue-600 p-2 rounded text-white"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default DateFilter;
