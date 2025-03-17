// categoryDistribution.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sqlQuery = `
    WITH CategoryTotals AS (
      SELECT 
        REPLACE(SUBSTRING_INDEX(UPPER(description), ' ', 1), '/', '') AS category,
        SUM(pieces) AS totalPieces
      FROM OrderDetails
      WHERE description IS NOT NULL
        AND YEAR(date) = YEAR(CURRENT_DATE())
      GROUP BY category
    ),
    RankedCategories AS (
      SELECT
        category,
        totalPieces,
        ROW_NUMBER() OVER (ORDER BY totalPieces DESC) AS rn
      FROM CategoryTotals
    )
    SELECT 
      CASE 
        WHEN rn <= 5 THEN category 
        ELSE 'OTROS' 
      END AS category,
      SUM(totalPieces) AS totalPieces
    FROM RankedCategories
    GROUP BY 
      CASE 
        WHEN rn <= 5 THEN category 
        ELSE 'OTROS' 
      END
    ORDER BY totalPieces DESC;
  `;
  
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("Error fetching category distribution:", err);
      return res.status(500).json({ error: err.message });
    }
    
    // Convertir totalPieces a entero
    const parsedResults = results.map(item => ({
      ...item,
      totalPieces: parseInt(item.totalPieces, 10)
    }));
    
    res.json(parsedResults);
  });
});

module.exports = router;
