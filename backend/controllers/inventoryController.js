// inventoryController.js
const db = require('../config/db');

exports.addInventory = async (req, res) => {
  try {
    const { registro } = req.body;
    if (typeof registro !== 'number') {
      return res.status(400).json({ error: 'El registro debe ser un número' });
    }
    
    const query = `INSERT INTO Inventario (registro) VALUES (?)`;
    const result = await db.query(query, [registro]);
    
    res.json({ 
      message: 'Registro agregado correctamente', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error al agregar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const query = `SELECT * FROM Inventario`;
    const results = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryDetails = async (req, res) => {
  try {
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
    
    const results = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener detalles de inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

// Función para actualizar (PUT)
exports.updateInventory = async (req, res) => {
  try {
    const { ticket } = req.params;
    const { telefono } = req.body;
    
    const query = `UPDATE Inventario SET telefono = ? WHERE registro = ?`;
    await db.query(query, [telefono, ticket]);
    
    res.json({ message: 'Registro actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

// Función para eliminar (DELETE)
exports.deleteInventory = async (req, res) => {
  try {
    const { ticket } = req.params;
    
    const query = `DELETE FROM Inventario WHERE registro = ?`;
    await db.query(query, [ticket]);
    
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};