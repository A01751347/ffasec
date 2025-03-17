// customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Ejemplo: GET /api/customers?query=Nombre
router.get('/', customerController.getCustomersByName);

module.exports = router;
