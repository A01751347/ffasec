// src/components/dashboard/WelcomeCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const WelcomeCard = ({ username, notifications }) => {
  return (
    <motion.div
      className="bg-gray-900 bg-opacity-50 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-gray-700 p-4"
      whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
    >
      <div className="px-4 py-5">
        <p className="text-xl text-gray-100 font-bold">
          ¡Bienvenid@ {username || 'usuario'}!
        </p>
        {notifications && (
          <p className="mt-1 text-sm text-gray-300">
            Tienes {notifications} notificaciones pendientes.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
