// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Importar rutas
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const productsRoutes = require('./routes/products');
const salesOverviewRoutes = require('./routes/salesOverview');
const dashboardStatsRoutes = require('./routes/dashboardStats');
const categoryDistributionRoutes = require('./routes/categoryDistribution');
const fileRoutes = require('./routes/fileRoutes');

// Aplicar rutas
app.use('/api/orders', orderRoutes);
app.use('/api/dailyReport', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/salesOverview', salesOverviewRoutes);
app.use('/api/dashboardStats', dashboardStatsRoutes);
app.use('/api/categoryDistribution', categoryDistributionRoutes);
app.use('/api/files', fileRoutes);

// Las rutas de inventario están definidas de forma diferente
app.use(inventoryRoutes);

// Cualquier otra ruta que no sea /api/... regresa el index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Middlewares de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});