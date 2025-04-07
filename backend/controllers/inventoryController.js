// backend/controllers/inventoryController.js
const db = require('../config/db');

exports.addInventory = async (req, res) => {
  try {
    console.log('addInventory - Datos recibidos:', req.body);
    const { registro } = req.body;
    
    // Validar que registro sea un número
    if (typeof registro !== 'number' && isNaN(parseInt(registro))) {
      console.error('Error: El registro debe ser un número válido', { received: registro, type: typeof registro });
      return res.status(400).json({ error: 'El registro debe ser un número válido' });
    }
    
    const registroNumerico = parseInt(registro, 10);
    console.log('addInventory - Valor numérico a insertar:', registroNumerico);
    
    // Primero, buscar si existe una orden con este ticket para obtener el ID del cliente
    const orderQuery = `SELECT o.id, c.phone FROM Orders o 
                        JOIN Customers c ON o.id = c.id 
                        WHERE o.ticket = ?`;
    const orderResults = await db.query(orderQuery, [registroNumerico]);
    
    // Determinar teléfono del cliente si está disponible
    let telefono = null;
    if (orderResults.length > 0) {
      telefono = orderResults[0].phone || null;
      console.log(`addInventory - Cliente encontrado con teléfono: ${telefono || 'No disponible'}`);
    } else {
      console.log('addInventory - No se encontró cliente asociado al ticket');
    }
    
    // Ahora insertar en el inventario con el teléfono si está disponible
    const query = `INSERT INTO Inventario (registro, telefono) VALUES (?, ?)`;
    console.log('addInventory - Ejecutando consulta:', query);
    
    const result = await db.query(query, [registroNumerico, telefono]);
    console.log('addInventory - Resultado de la inserción:', result);
    
    res.json({ 
      message: 'Registro agregado correctamente', 
      id: result.insertId,
      telefono: telefono
    });
  } catch (err) {
    console.error('Error al agregar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    console.log('getInventory - Obteniendo todos los registros de inventario');
    const query = `SELECT * FROM Inventario`;
    
    const results = await db.query(query);
    console.log(`getInventory - Se obtuvieron ${results.length} registros`);
    
    // Asegurar que los datos son del formato correcto antes de enviarlos
    const formattedResults = results.map(item => ({
      registro: parseInt(item.registro) || 0,
      // Incluir otros campos si existen
      ...item
    }));
    
    res.json(formattedResults);
  } catch (err) {
    console.error('Error al obtener inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryDetails = async (req, res) => {
  try {
    console.log('getInventoryDetails - Obteniendo detalles enriquecidos de inventario');
    
    // Consulta mejorada con mejor manejo de JOIN y resultados NULL
    const query = `
      SELECT 
        i.registro AS ticket,
        o.date,
        c.name,
        i.telefono
      FROM Inventario i
      LEFT JOIN Orders o ON i.registro = o.ticket
      LEFT JOIN Customers c ON o.id = c.id
      ORDER BY i.registro
    `;
    
    console.log('getInventoryDetails - Ejecutando consulta:', query);
    const results = await db.query(query);
    console.log(`getInventoryDetails - Se obtuvieron ${results.length} registros`);
    
    // Formatear correctamente los resultados
    const formattedResults = results.map(item => ({
      ticket: parseInt(item.ticket) || 0,
      date: item.date,
      name: item.name || 'No disponible',
      telefono: item.telefono || '',
    }));
    
    res.json(formattedResults);
  } catch (err) {
    console.error('Error al obtener detalles de inventario:', err);
    res.status(500).json({ error: err.message });
  } 
};

// Función para actualizar (PUT)
exports.updateInventory = async (req, res) => {
  try {
    console.log('updateInventory - Datos recibidos:', { 
      params: req.params,
      body: req.body 
    });
    
    const { ticket } = req.params;
    const { telefono } = req.body;
    
    if (!ticket || isNaN(parseInt(ticket))) {
      console.error('Error: Ticket inválido', { received: ticket });
      return res.status(400).json({ error: 'Ticket inválido' });
    }
    
    const ticketNumerico = parseInt(ticket, 10);
    console.log('updateInventory - Actualizando registro:', ticketNumerico);
    
    const query = `UPDATE Inventario SET telefono = ? WHERE registro = ?`;
    const result = await db.query(query, [telefono, ticketNumerico]);
    
    console.log('updateInventory - Resultado de la actualización:', result);
    
    // Verificar si el registro existía
    if (result.affectedRows === 0) {
      console.warn(`No se encontró inventario con ticket ${ticketNumerico}`);
      return res.status(404).json({ error: 'No se encontró el registro' });
    }
    
    res.json({ 
      message: 'Registro actualizado correctamente',
      ticket: ticketNumerico
    });
  } catch (err) {
    console.error('Error al actualizar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};

// Función para eliminar (DELETE)
exports.deleteInventory = async (req, res) => {
  try {
    console.log('deleteInventory - Params recibidos:', req.params);
    const { ticket } = req.params;
    
    if (!ticket || isNaN(parseInt(ticket))) {
      console.error('Error: Ticket inválido', { received: ticket });
      return res.status(400).json({ error: 'Ticket inválido' });
    }
    
    const ticketNumerico = parseInt(ticket, 10);
    console.log('deleteInventory - Eliminando registro:', ticketNumerico);
    
    const query = `DELETE FROM Inventario WHERE registro = ?`;
    const result = await db.query(query, [ticketNumerico]);
    
    console.log('deleteInventory - Resultado de la eliminación:', result);
    
    // Verificar si el registro existía
    if (result.affectedRows === 0) {
      console.warn(`No se encontró inventario con ticket ${ticketNumerico}`);
      return res.status(404).json({ error: 'No se encontró el registro' });
    }
    
    res.json({ 
      message: 'Registro eliminado correctamente',
      ticket: ticketNumerico
    });
  } catch (err) {
    console.error('Error al eliminar inventario:', err);
    res.status(500).json({ error: err.message });
  }
};