// salesOverview.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') AS month, 
        COALESCE(SUM(total), 0) AS totalSales
      FROM Orders
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    const results = await db.query(query);
    
    // Asegurar que los resultados tengan formatos numéricos consistentes
    const formattedResults = results.map(row => ({
      month: row.month,
      totalSales: parseFloat(row.totalSales) || 0
    }));
    
    res.json(formattedResults);
  } catch (err) {
    console.error("Error fetching sales overview:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;