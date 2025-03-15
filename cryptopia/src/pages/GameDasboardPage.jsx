// GameDashboardPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Sword, BarChart2, ChartLine } from 'lucide-react';

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import PlayerEngagementChart from '../components/data/PlayerEngagementChart';
import ClassDistributionChart from '../components/data/ClassDistributionChart';

// Paleta de colores
// Xanthous (#F9BF52), Scarlet (#FE2C01), Carnation Pink (#F9A0D0), White (#FFFFFF), Dark Purple (#3F2934)

const GameDashboardPage = () => {
  // Datos de ejemplo (mock) para la UI
  const [stats] = useState({
    totalCoinsSpent: 12500,
    activePlayers: 342,
    questsCompleted: 986,
    dailyChange: 7.3,
  });

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Game Admin Dashboard" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 xl:px-12">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Sales"
            icon={ChartLine}
            value={`$${stats.totalCoinsSpent.toLocaleString()}`}
            // Usamos Scarlet
            color="#8AD5F6"
          />
          <StatCard
            name="Active Players"
            icon={Users}
            value={stats.activePlayers}
            // Usamos Xanthous
            color="#2288FF"
          />
          <StatCard
            name="Quests Completed"
            icon={Gamepad2}
            value={stats.questsCompleted}
            // Usamos Scarlet
            color="#8AD5F6"
          />
          <StatCard
            name="Daily Change"
            icon={BarChart2}
            value={`${stats.dailyChange.toFixed(2)}%`}
            // Usamos Xanthous
            color="#2288FF"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PlayerEngagementChart />
          <ClassDistributionChart />
        </div>
      </main>
    </div>
  );
};

export default GameDashboardPage;