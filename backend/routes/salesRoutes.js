// backend/routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Ruta para crear una nueva venta
router.post('/', salesController.createSale);

// Ruta para obtener todas las ventas
router.get('/', salesController.getAllSales);

// Ruta para obtener una venta específica por ID
router.get('/:id', salesController.getSaleById);

// Ruta para obtener estadísticas de ventas
router.get('/stats/summary', salesController.getSalesStats);


module.exports = router;