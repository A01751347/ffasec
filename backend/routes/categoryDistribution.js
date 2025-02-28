// routes/categoryDistribution.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const query = `
    SELECT 
      REPLACE(SUBSTRING_INDEX(UPPER(description), ' ', 1), '/', '') AS category,
      SUM(pieces) AS totalPieces
    FROM OrderDetails
    WHERE description IS NOT NULL
      AND YEAR(date) = YEAR(CURRENT_DATE())
    GROUP BY category
    ORDER BY totalPieces DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching category distribution:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
