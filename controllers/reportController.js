// reportController.js
const db = require('../config/db');

exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query; // Formato esperado: 'YYYY-MM-DD'
    
    // Validación de fecha
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Formato esperado: YYYY-MM-DD' });
    } 
    
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(total), 0) FROM Orders WHERE date = ?) AS total_money,
        (SELECT COALESCE(SUM(pieces), 0) FROM OrderDetails WHERE date = ?) AS total_pieces
    `;
    
    const results = await db.query(query, [date, date]);
    
    // Asegurar que se devuelven valores numéricos
    const result = {
      total_money: parseFloat(results[0].total_money || 0),
      total_pieces: parseInt(results[0].total_pieces || 0)
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error al obtener reporte diario:', err);
    res.status(500).json({ error: err.message });
  }
};