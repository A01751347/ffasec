import React from 'react'

const Sidebar = () => {
  return (
    
    <div className="container mx-auto p-4">
    {/* Navbar principal (opcional, ya tienes links en DashboardPage) */}
    <nav className="flex gap-4 mb-8">
      <Link to="/" className="text-blue-500 underline">Dashboard</Link>
      <Link to="/inventory" className="text-blue-500 underline">Inventario</Link>
      <Link to="/orders" className="text-blue-500 underline">Órdenes</Link>
      <Link to="/upload" className="text-blue-500 underline">Subir Excel</Link>
      <Link to="/report" className="text-blue-500 underline">Reporte Diario</Link>
      <Link to="/customers" className="text-blue-500 underline">Clientes</Link>
    </nav>
    </div>
  )
}

export default Sidebar
