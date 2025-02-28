const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const query = `
    SELECT DATE_FORMAT(date, '%Y-%m') AS month, SUM(total) AS totalSales
    FROM Orders
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching sales overview:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
