const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const customerRoutes = require('./routes/customerRoutes');

// Montar rutas
app.use('/api/orders', orderRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/customers', customerRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
