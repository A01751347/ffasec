import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard General</h1>
      <p className="mb-4">Bienvenido al panel principal. Selecciona una sección:</p>
      <nav className="flex gap-4">
        <Link to="/inventory" className="text-blue-500 underline">Inventario</Link>
        <Link to="/orders" className="text-blue-500 underline">Órdenes</Link>
        <Link to="/upload" className="text-blue-500 underline">Subir Excel</Link>
        <Link to="/report" className="text-blue-500 underline">Reporte Diario</Link>
        <Link to="/customers" className="text-blue-500 underline">Clientes</Link>
      </nav>
    </div>
  );
};

export default DashboardPage;
