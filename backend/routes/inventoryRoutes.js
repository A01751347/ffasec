// inventoryRoutes
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const validator = require('../middlewares/validator');
const { inventorySchema } = require('../validations/schemas');

// Rutas con validación
router.post('/api/inventario', validator(inventorySchema.create), inventoryController.addInventory);
router.get('/api/inventario', inventoryController.getInventory);
router.get('/api/inventario/details', inventoryController.getInventoryDetails);
router.put('/api/inventario/details/:ticket', validator(inventorySchema.update), inventoryController.updateInventory);
router.delete('/api/inventario/details/:ticket', inventoryController.deleteInventory);

module.exports = router;