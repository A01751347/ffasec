<<<<<<< HEAD
// backend/server.js
=======
// server.js
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
const mysql = require('mysql2');
=======
const { notFound, errorHandler } = require('./middlewares/errorHandler');
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef

const app = express();
const PORT = process.env.PORT || 5002;

<<<<<<< HEAD
// Configurar conexión a la BD
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_DATABASE || ''
});

// Conectar a la BD
connection.connect(err => {
  if (err) {
    console.error('Error conectando a la BD:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Middleware
=======
// Middlewares
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Importar rutas
const orderRoutes = require('./routes/orderRoutes');
const productsRoutes = require('./routes/products');
const salesRoutes = require('./routes/salesRoutes');

// Aplicar rutas
app.use('/api/orders', orderRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);

<<<<<<< HEAD
// Middleware para manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware para manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Error en el servidor', 
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

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


=======
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
>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
