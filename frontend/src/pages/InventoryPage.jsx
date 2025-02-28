import React, { useState, useEffect } from 'react';
import Inventory from '../components/Inventory';
import InventoryDetails from '../components/InventoryDetails';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import { motion } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import ProductTable from '../components/products/ProductTables';
import SalesTrendChart from '../components/products/SalesTrendChart';
import CategoryChart from '../components/data/CategoryChart';

const InventoryPage = () => {
  const [totalPieces, setTotalPieces] = useState(0);
  const [masPopular, setMasPopular] = useState("");
  const [totalSales, setTotalSales] = useState(0);

  // Obtener el total de prendas (suma de piezas) de los últimos 365 días
  useEffect(() => {
    fetch("http://localhost:5002/api/dashboardStats")
      .then((res) => res.json())
      .then((data) => {
        setTotalPieces(data.totalPieces365 || 0);
      })
      .catch((err) => console.error("Error fetching total pieces:", err));
  }, []);

  // Obtener la categoría más popular a partir del endpoint de categoryDistribution
  useEffect(() => {
    fetch("http://localhost:5002/api/categoryDistribution")
      .then((res) => res.json())
      .then((data) => {
        // Suponemos que el primer objeto es el de mayor suma de piezas
        if (data.length > 0) {
          setMasPopular(data[1].category);
        }
      })
      .catch((err) => console.error("Error fetching category distribution:", err));
  }, []);

  // Obtener el total de ventas desde hace 365 días hasta hoy
  useEffect(() => {
    fetch("http://localhost:5002/api/dashboardStats")
      .then((res) => res.json())
      .then((data) => {
        setTotalSales(data.totalSales365 || 0);
      })
      .catch((err) => console.error("Error fetching total sales:", err));
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title='Productos' />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px12">
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
            value={masPopular} 
            color="#8B5CF6" 
          />
          <StatCard 
            name="Stock Bajo" 
            icon={AlertTriangle} 
            value="Gancho Largo" 
            color="#6366f1" 
          />
          <StatCard 
            name="Total" 
            icon={DollarSign} 
            value={`$${Number(totalSales).toFixed(2)}`} 
            color="#8B5CF6" 
          />
        </motion.div>

        <ProductTable />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SalesTrendChart />
          <CategoryChart />
        </div>

        <InventoryDetails />
      </main>
    </div>
  );
};

export default InventoryPage;
