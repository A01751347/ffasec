const db = require('../config/db');

exports.addInventory = (req, res) => {
  const { registro } = req.body;
  if (typeof registro !== 'number') {
    return res.status(400).json({ error: 'El registro debe ser un número' });
  }
  const query = `INSERT INTO Inventario (registro) VALUES (?)`;
  db.query(query, [registro], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Registro agregado correctamente', id: results.insertId });
  });
};

exports.getInventory = (req, res) => {
  const query = `SELECT * FROM Inventario`;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getInventoryDetails = (req, res) => {
  const query = `
    SELECT 
      i.registro AS ticket,
      o.date,
      c.name,
      i.telefono
    FROM Inventario i
    JOIN Orders o ON i.registro = o.ticket
    JOIN Customers c ON o.id = c.id
    ORDER BY i.registro;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener detalles de inventario:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
