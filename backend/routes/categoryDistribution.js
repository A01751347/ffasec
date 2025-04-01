// categoryDistribution.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'Faltan parámetros de fecha "from" o "to"' });
    }

    const sqlQuery = `
      WITH CategoryTotals AS (
        SELECT 
          REPLACE(SUBSTRING_INDEX(UPPER(description), ' ', 1), '/', '') AS category,
          COALESCE(SUM(pieces), 0) AS totalPieces
        FROM OrderDetails
        WHERE description IS NOT NULL
          AND date BETWEEN ? AND ?
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

    const results = await db.query(sqlQuery, [from, to]);
    
    const parsedResults = results.map(item => ({
      ...item,
      totalPieces: parseInt(item.totalPieces, 10) || 0
    }));
    
    res.json(parsedResults);
  } catch (err) {
    console.error("Error fetching category distribution:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;