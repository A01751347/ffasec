// customerController.js
const db = require('../config/db');

exports.getCustomersByName = async (req, res) => {
  try {
    const searchTerm = req.query.query || ''; // Valor por defecto para evitar problemas
    
    console.log(`getCustomersByName - Término de búsqueda: "${searchTerm}"`);
    
    // Validación básica
    if (!searchTerm || searchTerm.trim().length === 0) {
      console.log('getCustomersByName - Error: Término de búsqueda vacío');
      return res.status(400).json({ 
        error: 'Se requiere un término de búsqueda',
        success: false
      });
    }
    
    // Limitar longitud mínima para evitar búsquedas muy amplias
    if (searchTerm.trim().length < 2) {
      console.log('getCustomersByName - Error: Término de búsqueda demasiado corto');
      return res.status(400).json({ 
        error: 'El término de búsqueda debe tener al menos 2 caracteres',
        success: false
      });
    }
    
    const sql = `SELECT * FROM Customers WHERE name LIKE ?`;
    console.log(`getCustomersByName - Ejecutando consulta: ${sql} con parámetro: %${searchTerm}%`);
    
    const results = await db.query(sql, [`%${searchTerm}%`]);
    console.log(`getCustomersByName - Se encontraron ${results.length} clientes`);
    
    // Si no hay resultados, retornar array vacío en lugar de error
    if (results.length === 0) {
      console.log('getCustomersByName - No se encontraron clientes que coincidan');
      return res.json([]);
    }
    
    // Formatear resultados para garantizar estructura consistente
    const formattedResults = results.map(customer => ({
      id: customer.id,
      name: customer.name || 'Sin nombre',
      // Agregar otros campos si están disponibles en la tabla
    }));
    
    // Log para depuración
    console.log('getCustomersByName - Primeros 3 resultados:', 
      formattedResults.slice(0, 3).map(c => ({ id: c.id, name: c.name }))
    );
    
    res.json(formattedResults);
  } catch (err) {
    console.error('Error en búsqueda de clientes:', err);
    res.status(500).json({ 
      error: err.message,
      success: false
    });
  }
};