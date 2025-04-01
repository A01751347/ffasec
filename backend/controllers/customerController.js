// customerController.js
const db = require('../config/db');

exports.getCustomersByName = async (req, res) => {
  try {
    const searchTerm = req.query.query || ''; // Valor por defecto para evitar problemas
    const sql = `SELECT * FROM Customers WHERE name LIKE ?`;
    
    const results = await db.query(sql, [`%${searchTerm}%`]);
    res.json(results);
  } catch (err) {
    console.error('Error en búsqueda de clientes:', err);
    res.status(500).json({ error: err.message });
  }
};