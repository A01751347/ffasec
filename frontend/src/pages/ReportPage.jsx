import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Package } from 'lucide-react';
import OrderList from '../components/reports/OrderList';

const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const ReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [totalMoney, setTotalMoney] = useState(0);
  const [totalPieces, setTotalPieces] = useState(0);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchDailyReport = async () => {
      try {
        const res = await fetch(`/api/dailyReport?date=${selectedDate}`);
        const data = await res.json();
        setTotalMoney(data.total_money || 0);
        setTotalPieces(data.total_pieces || 0);
      } catch (error) {
        console.error("Error fetching daily report:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/ordersByDate?date=${selectedDate}`);
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchDailyReport();
    fetchOrders();
  }, [selectedDate]);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title='Reporte Diario' />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-4 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1">
            <label className="text-gray-100 block mb-1">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border p-2 rounded bg-gray-700 text-white"
            />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name="Total Vendido" 
            icon={DollarSign} 
            value={`$${Number(totalMoney).toFixed(2)}`} 
            color="#6366f1" 
          />
          <StatCard 
            name="Total Piezas" 
            icon={Package} 
            value={totalPieces} 
            color="#8B5CF6" 
          />
          <StatCard 
            name="Fecha" 
            icon={Calendar} 
            value={selectedDate} 
            color="#6366f1" 
          />
        </motion.div>

        <OrderList orders={orders} />
      </main>
    </div>
  );
};

export default ReportPage;
