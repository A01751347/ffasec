// products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    let dateCondition = "";
    const params = [];

    if (from && to) {
      dateCondition = "AND date BETWEEN ? AND ?";
      params.push(from, to);
    }

    const query = `
      SELECT
        od.description,
        od.process,
        (
          COALESCE(SUM(od.price), 0) / NULLIF(SUM(od.quantity), 0)
        ) AS price, -- Precio promedio unitario
        COALESCE(SUM(od.quantity), 0) AS stock,
        COALESCE(SUM(od.pieces), 0) AS sales
      FROM OrderDetails od
      WHERE od.description IS NOT NULL
        AND od.process NOT LIKE '%spot on%'
        ${dateCondition}
      GROUP BY od.description, od.process
      ORDER BY sales DESC;
    `;
    
    const results = await db.query(query, params);
    
    const mapped = results.map(row => ({
      name: row.description || 'Sin nombre',
      category: row.process || 'Sin categoría',
      price: parseFloat(row.price) || 0,
      stock: parseInt(row.stock) || 0,
      sales: parseInt(row.sales) || 0
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error('Error al obtener datos de OrderDetails:', err);
    res.status(500).json({ error: 'Error al obtener datos de OrderDetails' });
  }
});

module.exports = router;