// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5002;
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

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

app.use('/api/orders', orderRoutes);
app.use('/api/dailyReport', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/salesOverview', salesOverviewRoutes);
app.use('/api/dashboardStats', dashboardStatsRoutes);
app.use('/api/categoryDistribution', categoryDistributionRoutes);
app.use('/api/files', fileRoutes);

app.use(inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Cualquier otra ruta que no sea /api/... regresa el index.html del frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
