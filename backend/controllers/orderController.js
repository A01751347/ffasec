// orderController.js
const db = require('../config/db');

/**
 * Obtener una orden por su ticket, con detalles anidados.
 * Retorna un objeto que representa la orden encontrada.
 */
exports.getOrderByTicket = async (req, res) => {
  try {
    const ticket = req.params.ticket;
    
    // Validación básica
    if (!ticket) {
      return res.status(400).json({ error: 'Se requiere un número de ticket' });
    }
    
    // Consulta optimizada con índices adecuados
    const query = `
      SELECT 
        o.number,
        o.ticket,
        o.date as orderDate,
        o.id as customerId,
        c.name as customerName,
        d.process,
        d.description,
        d.pieces,
        d.quantity,
        d.date as detailDate,
        d.price
      FROM Orders o
      JOIN Customers c ON o.id = c.id
      LEFT JOIN OrderDetails d ON o.number = d.number
      WHERE o.ticket = ?
      ORDER BY d.process, d.description
    `;

    const results = await db.query(query, [ticket]);

    // Si no se encontró ninguna fila, la orden no existe
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró la orden con ese ticket.' });
    }

    // Estructurar respuesta
    const orderData = {
      number: results[0].number,
      ticket: results[0].ticket,
      date: results[0].orderDate,
      customerId: results[0].customerId,
      customerName: results[0].customerName,
      details: []
    };

    // Rellenamos el array de details
    results.forEach(row => {
      // Si no hay un proceso (puede haber filas "vacías" si no existen detalles),
      // validamos para no meter objetos vacíos
      if (row.process || row.description || row.pieces || row.price) {
        orderData.details.push({
          process: row.process,
          description: row.description,
          pieces: row.pieces || 0,
          quantity: row.quantity || 0,
          date: row.detailDate,
          price: row.price || 0
        });
      }
    });

    res.json(orderData);
  } catch (err) {
    console.error('Error al buscar orden por ticket:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtener todas las órdenes con sus detalles, aplicando paginación
 * para mejorar el rendimiento
 */
exports.getAllOrders = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Obtener conteo total para la paginación
    const [countResults] = await db.query('SELECT COUNT(DISTINCT o.number) as total FROM Orders o');
    const totalOrders = countResults[0]?.total || 0;
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Consulta para obtener las órdenes con paginación
    const orderQuery = `
      SELECT 
        o.number,
        o.ticket,
        o.date,
        o.id,
        o.total,
        c.name
      FROM Orders o
      JOIN Customers c ON o.id = c.id
      ORDER BY o.date DESC
      LIMIT ? OFFSET ?
    `;
    
    const orderResults = await db.query(orderQuery, [limit, offset]);
    
    // Si no hay órdenes, devolver array vacío con metadatos de paginación
    if (orderResults.length === 0) {
      return res.json({
        data: [],
        pagination: {
          page,
          limit,
          totalItems: totalOrders,
          totalPages
        }
      });
    }
    
    // Extraer los números de orden para buscar los detalles
    const orderNumbers = orderResults.map(order => order.number);
    
    // Consulta para obtener los detalles de las órdenes
    const detailsQuery = `
      SELECT 
        d.number,
        d.process,
        d.description,
        d.pieces,
        d.quantity,
        d.date as detailDate,
        d.price
      FROM OrderDetails d
      WHERE d.number IN (?)
      ORDER BY d.number, d.process, d.description
    `;
    
    const detailsResults = await db.query(detailsQuery, [orderNumbers]);
    
    // Agrupar detalles por número de orden
    const detailsByOrder = {};
    detailsResults.forEach(detail => {
      if (!detailsByOrder[detail.number]) {
        detailsByOrder[detail.number] = [];
      }
      
      detailsByOrder[detail.number].push({
        process: detail.process,
        description: detail.description,
        pieces: detail.pieces || 0,
        quantity: detail.quantity || 0,
        date: detail.detailDate,
        price: detail.price || 0
      });
    });
    
    // Combinar órdenes con sus detalles
    const ordersWithDetails = orderResults.map(order => ({
      number: order.number,
      ticket: order.ticket,
      date: order.date,
      id: order.id,
      name: order.name,
      total: order.total,
      details: detailsByOrder[order.number] || []
    }));
    
    // Enviar respuesta con metadatos de paginación
    res.json({
      data: ordersWithDetails,
      pagination: {
        page,
        limit,
        totalItems: totalOrders,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error al obtener órdenes:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtener todas las órdenes de un cliente, con detalles anidados.
 * Implementa paginación para mejorar rendimiento.
 */
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Validación básica
    if (!customerId) {
      return res.status(400).json({ error: 'Se requiere un ID de cliente' });
    }
    
    // Obtener conteo total de órdenes del cliente
    const [countResults] = await db.query(
      'SELECT COUNT(*) as total FROM Orders WHERE id = ?',
      [customerId]
    );
    
    const totalOrders = countResults[0]?.total || 0;
    
    // Si no hay órdenes, devolver array vacío
    if (totalOrders === 0) {
      return res.json({
        data: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0
        }
      });
    }
    
    const totalPages = Math.ceil(totalOrders / limit);
    
    // Obtener órdenes del cliente con paginación
    const orderQuery = `
      SELECT 
        number,
        ticket,
        total,
        date as orderDate
      FROM Orders
      WHERE id = ?
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;
    
    const orderResults = await db.query(orderQuery, [customerId, limit, offset]);
    
    // Extraer números de orden para buscar detalles
    const orderNumbers = orderResults.map(order => order.number);
    
    // Si no hay órdenes en esta página, devolver array vacío con metadatos
    if (orderNumbers.length === 0) {
      return res.json({
        data: [],
        pagination: {
          page,
          limit,
          totalItems: totalOrders,
          totalPages
        }
      });
    }
    
    // Obtener detalles de las órdenes
    const detailsQuery = `
      SELECT
        number,
        process,
        description,
        pieces,
        quantity,
        date as detailDate,
        price
      FROM OrderDetails
      WHERE number IN (?)
      ORDER BY number, process, description
    `;
    
    const detailsResults = await db.query(detailsQuery, [orderNumbers]);
    
    // Agrupar detalles por número de orden
    const detailsByOrder = {};
    detailsResults.forEach(detail => {
      if (!detailsByOrder[detail.number]) {
        detailsByOrder[detail.number] = [];
      }
      
      detailsByOrder[detail.number].push({
        process: detail.process,
        description: detail.description,
        pieces: detail.pieces || 0,
        quantity: detail.quantity || 0,
        date: detail.detailDate,
        price: detail.price || 0
      });
    });
    
    // Combinar órdenes con sus detalles
    const ordersWithDetails = orderResults.map(order => ({
      number: order.number,
      ticket: order.ticket,
      total: order.total,
      date: order.orderDate,
      customerId: parseInt(customerId),
      details: detailsByOrder[order.number] || []
    }));
    
    // Enviar respuesta con metadatos de paginación
    res.json({
      data: ordersWithDetails,
      pagination: {
        page,
        limit,
        totalItems: totalOrders,
        totalPages
      }
    });
  } catch (err) {
    console.error('Error al obtener órdenes del cliente:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtener todas las órdenes de una fecha específica.
 * Retorna un array de órdenes para la fecha solicitada.
 */
exports.getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Validación básica
    if (!date) {
      return res.status(400).json({ error: 'Se requiere el parámetro de fecha (formato YYYY-MM-DD)' });
    }
    
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }
    
    // Consulta para obtener órdenes por fecha
    const query = `
      SELECT 
        o.number,
        o.ticket,
        o.date,
        o.id,
        o.total,
        c.name
      FROM Orders o
      JOIN Customers c ON o.id = c.id
      WHERE DATE(o.date) = ?
      ORDER BY o.number
    `;
    
    const orders = await db.query(query, [date]);
    
    res.json(orders);
  } catch (err) {
    console.error('Error al obtener órdenes por fecha:', err);
    res.status(500).json({ error: err.message });
  }
};