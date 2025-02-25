const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/', inventoryController.addInventory);
router.get('/', inventoryController.getInventory);
router.get('/details', inventoryController.getInventoryDetails);

module.exports = router;
