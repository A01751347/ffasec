// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const validator = require('../middlewares/validator');
const { inventorySchema } = require('../validations/schemas');

// Obtener todo el inventario
router.get('/', inventoryController.getInventory);

// Obtener detalles del inventario
router.get('/details', inventoryController.getInventoryDetails);

// Agregar registro al inventario
router.post('/', validator(inventorySchema.create), inventoryController.addInventory);

// Actualizar registro por ticket
router.put('/details/:ticket', validator(inventorySchema.update), inventoryController.updateInventory);

// Eliminar registro por ticket
router.delete('/details/:ticket', inventoryController.deleteInventory);

module.exports = router;