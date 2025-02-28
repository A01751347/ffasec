// src/pages/InventoryPage.jsx
import React from 'react';
import Inventory from '../components/Inventory';
import InventoryDetails from '../components/InventoryDetails';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, DollarSign, Package, TrendingUp} from 'lucide-react';
import ProductTable from '../components/products/ProductTables';
import SalesTrendChart from '../components/products/SalesTrendChart';
import CategoryChart from '../components/data/CategoryChart';

const InventoryPage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
    <Header title='Overview' />
    <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px12'>
    <motion.div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}>
            <StatCard name='Prendas Totales' icon={Package} value='213' color='#6366f1'/>
            <StatCard name='Mas Popular' icon={TrendingUp} value='Camisas' color='#8B5CF6'/>
            <StatCard name='Stock Bajo' icon={AlertTriangle} value='Gancho Largo' color='#6366f1'/>
            <StatCard name='Total' icon={DollarSign} value='$329,323' color='#8B5CF6'/>
        </motion.div>

      <ProductTable/>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 '>
      <SalesTrendChart/>
      <CategoryChart/>
      <Inventory />
      <InventoryDetails />
      </div>
      </main>
    </div>
  );
};

export default InventoryPage;
