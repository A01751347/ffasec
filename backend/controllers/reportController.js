const db = require('../config/db');

exports.getDailyReport = (req, res) => {
  const { date } = req.query; // Formato esperado: 'YYYY-MM-DD'
  const query = `
    SELECT 
      (SELECT SUM(total) FROM Orders WHERE date = ?) AS total_money,
      (SELECT SUM(pieces) FROM OrderDetails WHERE date = ?) AS total_pieces
  `;
  db.query(query, [date, date], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
};
