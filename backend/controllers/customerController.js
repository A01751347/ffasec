// customerController.js
const db = require('../config/db');

exports.getCustomersByName = (req, res) => {
  const searchTerm = req.query.query; // Se espera que la consulta venga en el parámetro 'query'
  const sql = `SELECT * FROM Customers WHERE name LIKE ?`;
  db.query(sql, [`%${searchTerm}%`], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
