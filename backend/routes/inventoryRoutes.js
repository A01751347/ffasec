const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/api/inventario', inventoryController.addInventory);
router.get('/api/inventario', inventoryController.getInventory);
router.get('/api/inventario/details', inventoryController.getInventoryDetails);
router.put('/api/inventario/details/:ticket', inventoryController.updateInventory);
router.delete('/api/inventario/details/:ticket', inventoryController.deleteInventory);

module.exports = router;
