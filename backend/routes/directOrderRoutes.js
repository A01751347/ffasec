// Archivo: backend/routes/directOrderRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta directa para consulta de órdenes sin middleware ni controladores
router.get('/api/direct/customer-orders/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    console.log(`CONSULTA DIRECTA - Órdenes para cliente ${customerId}`);
    
    if (!customerId) {
      return res.status(400).json({ error: 'Se requiere ID de cliente' });
    }
    
    // Consulta simple y directa sin ningún procesamiento
    const query = `
      SELECT 
        number, 
        ticket, 
        total, 
        date 
      FROM Orders 
      WHERE id = ? 
      ORDER BY date DESC
    `;
    
    // Usar directamente promisePool para obtener resultados sin capas adicionales
    const [results] = await db.promisePool.execute(query, [customerId]);
    
    console.log(`CONSULTA DIRECTA - Se encontraron ${results.length} órdenes`);
    console.log('CONSULTA DIRECTA - Primeras órdenes:', JSON.stringify(results.slice(0, 2)));
    
    // Devolver resultados tal cual, sin estructura adicional
    return res.json(results);
    
  } catch (error) {
    console.error('CONSULTA DIRECTA - Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;