import React, { useState } from 'react';
import { BarChart2, DollarSign, Home, Menu, PersonStanding, Settings, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { name: 'Inicio', icon: Home, color: '#818CF8', path: '/' },
  { name: 'Datos', icon: BarChart2, color: '#818CF8', path: '/upload' },
  { name: 'Inventario', icon: ShoppingBag, color: '#818CF8', path: '/inventory' },
  { name: 'Reporte Diario', icon: DollarSign, color: '#818CF8', path: '/report' },
  { name: 'Órdenes', icon: Settings, color: '#818CF8', path: '/orders' },
  { name: 'Clientes', icon: PersonStanding, color: '#818CF8', path: '/customers' },
];
// colors={[ '#6366F1', // principal
//   '#818CF8', // un poco más claro
//   '#A5B4FC', // más claro
//   '#C7D2FE', // aún más claro
//   ]}
const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 h-screen ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
        {/* Botón de menú */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        {/* Navegación */}
        <nav className="mt-8 flex-grow ">
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                <item.icon size={20} style={{ color: item.color, minWidth: '20px' }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                     <motion.span
                     className="ml-4 whitespace-nowrap overflow-hidden"
                     style={{ color: '#C7D2FE' }} // ✅ Agregando color dinámico al texto
                     initial={{ opacity: 0, width: 0 }}
                     animate={{ opacity: 1, width: 'auto' }}
                     exit={{ opacity: 0, width: 0 }}
                     transition={{ duration: 0.2, delay: 0.3 }}
                   >
                     {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>
    </motion.div>
    
    // <div className="container mx-auto p-4">
    // {/* Navbar principal (opcional, ya tienes links en DashboardPage) */}
    // <nav className="flex gap-4 mb-8">
    //   <Link to="/" className="text-blue-500 underline">Dashboard</Link>
    //   <Link to="/inventory" className="text-blue-500 underline">Inventario</Link>
    //   <Link to="/orders" className="text-blue-500 underline">Órdenes</Link>
    //   <Link to="/upload" className="text-blue-500 underline">Subir Excel</Link>
    //   <Link to="/report" className="text-blue-500 underline">Reporte Diario</Link>
    //   <Link to="/customers" className="text-blue-500 underline">Clientes</Link>
    // </nav>
    // </div>
  )
}

export default Sidebar
