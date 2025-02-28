const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas existentes
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const customerRoutes = require('./routes/customerRoutes');
// Importar ruta de Inventario
const inventoryRoutes = require('./routes/inventoryRoutes');
const productsRoutes = require('./routes/products');
const salesOverviewRoutes = require('./routes/salesOverview');
const dashboardStatsRoutes = require('./routes/dashboardStats');
const categoryDistributionRoutes = require('./routes/categoryDistribution');

// Montar rutas
app.use('/api/orders', orderRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventario', inventoryRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/salesOverview', salesOverviewRoutes);
app.use('/api/dashboardStats', dashboardStatsRoutes);
app.use('/api/categoryDistribution', categoryDistributionRoutes);

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


