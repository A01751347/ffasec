import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import ProductTable from '../components/products/ProductTables';
import SalesTrendChart from '../components/products/SalesTrendChart';
import CategoryChart from '../components/data/CategoryChart';
import InventoryDetails from '../components/products/inventoryComp/InventoryDetails';

function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];
  return { firstDay, lastDay };
}

// Función para capitalizar la primera letra de un string de forma segura
function capitalizeFirstLetter(val = '') {
  if (!val) return '';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const InventoryPage = () => {
  const { firstDay, lastDay } = getCurrentMonthRange();
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  const [totalPieces, setTotalPieces] = useState(0);
  const [masPopular, setMasPopular] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [lowestStockItem, setLowestStockItem] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1) Dashboard stats
        let statsUrl = `/api/dashboardStats?from=${fromDate}&to=${toDate}`;
        const statsRes = await fetch(statsUrl);
        const statsData = await statsRes.json();

        setTotalPieces(statsData.totalPiecesRange || 0);
        setTotalSales(statsData.totalSalesRange || 0);

        // 2) Category distribution (para "Más popular")
        let catUrl = `/api/categoryDistribution?from=${fromDate}&to=${toDate}`;
        const catRes = await fetch(catUrl);
        const catData = await catRes.json();

        if (catData && catData.length > 0) {
          setMasPopular(catData[0].category);
        } else {
          setMasPopular('');
        }

        // 3) Lista de productos (para "Stock Bajo")
        // Esta parte se mantiene comentada hasta que la API esté configurada
        /*
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();

        if (Array.isArray(productsData) && productsData.length > 0) {
          const minStockProduct = productsData.reduce((lowest, curr) => {
            return curr.stock < lowest.stock ? curr : lowest;
          });
          setLowestStockItem(minStockProduct.name);
        } else {
          setLowestStockItem('');
        }
        */
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      }
    };

    fetchStats();
  }, [fromDate, toDate]);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Productos" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px12">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-4 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1">
            <label className="text-gray-100 block mb-1">Desde:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-gray-100 block mb-1">Hasta:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border p-2 rounded bg-gray-700 text-white"
            />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name="Prendas Totales" 
            icon={Package} 
            value={totalPieces} 
            color="#6366f1" 
          />
          <StatCard 
            name="Más Popular" 
            icon={TrendingUp} 
            value={capitalizeFirstLetter(masPopular)} 
            color="#8B5CF6" 
          />
          <StatCard 
            name="Stock Bajo" 
            icon={AlertTriangle} 
            value={lowestStockItem || "Gancho Largo"} 
            color="#6366f1" 
          />
          <StatCard 
            name="Total" 
            icon={DollarSign} 
            type="Money"
            value={`${Number(totalSales).toFixed(2)}`} 
            color="#8B5CF6" 
          />
        </motion.div>

        <ProductTable fromDate={fromDate} toDate={toDate} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesTrendChart />
          <CategoryChart fromDate={fromDate} toDate={toDate} />
        </div>

        <InventoryDetails />
      </main>
    </div>
  );
};

export default InventoryPage;
