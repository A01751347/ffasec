// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Ruta para obtener órdenes por fecha
router.get('/byDate', orderController.getOrdersByDate);

// Buscar orden por ticket (ya existente)
router.get('/:ticket', orderController.getOrderByTicket);

// Ruta para buscar órdenes por cliente
router.get('/byCustomer/:customerId', orderController.getOrdersByCustomer);
 
// Ruta para traer todas las órdenes
router.get('/', orderController.getAllOrders);

module.exports = router;