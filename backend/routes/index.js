// backend/routes/index.js (actualizado)
const express = require('express');
const router = express.Router();

// Importar todas las rutas
const customerRoutes = require('./customerRoutes');
const orderRoutes = require('./orderRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const fileRoutes = require('./fileRoutes');
const uploadRoutes = require('./uploadRoutes');
const reportRoutes = require('./reportRoutes');
const dashboardStatsRoutes = require('./dashboardStats');
const categoryDistributionRoutes = require('./categoryDistribution');
const salesOverviewRoutes = require('./salesOverview');
const productsRoutes = require('./products');
const salesRoutes = require('./salesRoutes');
const customerUploadRoutes = require('./customerUploadRoutes'); // Agregamos esta línea

// Aplicar todas las rutas con sus prefijos
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/inventario', inventoryRoutes);
router.use('/files', fileRoutes);
router.use('/upload', uploadRoutes);
router.use('/upload', customerUploadRoutes); // Agregamos esta línea
router.use('/dailyReport', reportRoutes);
router.use('/dashboardStats', dashboardStatsRoutes);
router.use('/categoryDistribution', categoryDistributionRoutes);
router.use('/salesOverview', salesOverviewRoutes);
router.use('/products', productsRoutes);
router.use('/sales', salesRoutes);

// Exportar router con todas las rutas configuradas
module.exports = router; 