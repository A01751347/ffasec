// reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Validación de fecha en middleware
const validateDateFormat = (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Se requiere el parámetro "date"' });
  }
  
  // Validar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
  }
  
  next();
};

// Aplicar middleware de validación
router.get('/', validateDateFormat, reportController.getDailyReport);

module.exports = router;