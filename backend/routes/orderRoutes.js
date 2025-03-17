// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Buscar orden por ticket (ya existente)
router.get('/:ticket', orderController.getOrderByTicket);

// Nueva ruta: Buscar órdenes por cliente
router.get('/byCustomer/:customerId', orderController.getOrdersByCustomer);

// orderRoutes.js
router.get('/', orderController.getAllOrders);  // Nueva ruta para traer todas las órdenes


module.exports = router;
