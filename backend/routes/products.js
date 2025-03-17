// products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
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
    SUM(od.price) / SUM(od.quantity)
  ) AS price, -- Precio promedio unitario
  SUM(od.quantity) AS stock,
  SUM(od.pieces)   AS sales
FROM OrderDetails od
WHERE od.description IS NOT NULL
  AND od.process NOT LIKE '%spot on%'
  
      ${dateCondition}
GROUP BY od.description, od.process
ORDER BY sales DESC;

  `;
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener datos de OrderDetails:', err);
      return res.status(500).json({ error: 'Error al obtener datos de OrderDetails' });
    }
    const mapped = results.map(row => ({
      name: row.description,
      category: row.process,
      price: Number(row.price),
      stock: Number(row.stock),
      sales: Number(row.sales)
    }));
    res.json(mapped);
  });
});

module.exports = router;
