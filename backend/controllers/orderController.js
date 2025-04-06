// orderController.js
const db = require('../config/db');

/**
 * Obtener una orden por su ticket, con detalles anidados.
 * Retorna un objeto que representa la orden encontrada.
 */
exports.getOrderByTicket = async (req, res) => {
  try {
    const ticket = req.params.ticket;
    
    // Log detallado para depuración
    console.log(`getOrderByTicket - Buscando orden con ticket: ${ticket}`);
    
    // Validación básica
    if (!ticket) {
      console.log('getOrderByTicket - Error: Se requiere un número de ticket');
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
    console.log(`getOrderByTicket - Resultados obtenidos: ${results.length} filas`);
    
    // Verificar resultados
    if (results.length === 0) {
      console.log(`getOrderByTicket - No se encontró orden con ticket: ${ticket}`);
      return res.status(404).json({ 
        message: 'No se encontró la orden con ese ticket.',
        success: false
      });
    }

    // Log para depuración de la primera fila
    console.log('getOrderByTicket - Primera fila de resultados:', JSON.stringify(results[0]));

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
          process: row.process || '',
          description: row.description || '',
          pieces: row.pieces || 0,
          quantity: row.quantity || 0,
          date: row.detailDate,
          price: row.price || 0
        });
      }
    });

    // Log para depuración de la respuesta final
    console.log('getOrderByTicket - Respuesta estructurada:', JSON.stringify(orderData));

    // Enviar respuesta
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
    
    console.log(`getAllOrders - Página: ${page}, Límite: ${limit}`);
    
    // Obtener conteo total para la paginación
    const countQuery = 'SELECT COUNT(DISTINCT o.number) as total FROM Orders o';
    const [countResults] = await db.query(countQuery);
    console.log('getAllOrders - Resultado de conteo:', countResults);
    
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
    console.log(`getAllOrders - Se obtuvieron ${orderResults.length} órdenes`);
    
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
    console.log(`getAllOrders - Se obtuvieron ${detailsResults.length} detalles de órdenes`);
    
    // Agrupar detalles por número de orden
    const detailsByOrder = {};
    detailsResults.forEach(detail => {
      if (!detailsByOrder[detail.number]) {
        detailsByOrder[detail.number] = [];
      }
      
      detailsByOrder[detail.number].push({
        process: detail.process || '',
        description: detail.description || '',
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
      total: parseFloat(order.total || 0),
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

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    console.log(`====== DEPURACIÓN: getOrdersByCustomer =======`);
    console.log(`INICIO: Cliente ${customerId}, Página ${page}, Límite ${limit}`);
    
    // Validación básica
    if (!customerId) {
      console.log('ERROR: Se requiere un ID de cliente');
      return res.status(400).json({ error: 'Se requiere un ID de cliente' });
    }
    
    // Obtener conteo total de órdenes del cliente
    console.log(`EJECUTANDO: Consulta de conteo de órdenes`);
    let countResults = [];
    
    try {
      countResults = await db.query('SELECT COUNT(*) as total FROM Orders WHERE id = ?', [customerId]);
      console.log(`RESULTADO CONTEO: ${JSON.stringify(countResults)}`);
    } catch (countError) {
      console.error(`ERROR EN CONTEO: ${countError.message}`);
      throw new Error(`Error al contar órdenes: ${countError.message}`);
    }
    
    const totalOrders = parseInt(countResults[0]?.total || 0);
    console.log(`TOTAL DE ÓRDENES: ${totalOrders}`);
    
    // Si no hay órdenes, devolver array vacío
    if (totalOrders === 0) {
      console.log(`SIN ÓRDENES: Cliente ${customerId} no tiene órdenes`);
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
    console.log(`PAGINACIÓN: Total de páginas ${totalPages}`);
    
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
    
    console.log(`EJECUTANDO: Consulta de órdenes`);
    console.log(`SQL: ${orderQuery}`);
    console.log(`PARÁMETROS: [${customerId}, ${limit}, ${offset}]`);
    
    let orderResults = [];
    
    try {
      orderResults = await db.query(orderQuery, [customerId, limit, offset]);
      console.log(`ÓRDENES OBTENIDAS: ${orderResults.length}`);
      console.log(`PRIMERA ORDEN: ${orderResults.length > 0 ? JSON.stringify(orderResults[0]) : 'ninguna'}`);
    } catch (ordersError) {
      console.error(`ERROR EN ÓRDENES: ${ordersError.message}`);
      throw new Error(`Error al obtener órdenes: ${ordersError.message}`);
    }
    
    // Si no hay órdenes en esta página, devolver array vacío con metadatos
    if (orderResults.length === 0) {
      console.log(`SIN RESULTADOS: No hay órdenes en la página ${page}`);
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
    
    // Preparar una respuesta simplificada sin detalles adicionales
    const simplifiedOrders = orderResults.map(order => ({
      number: order.number,
      ticket: order.ticket,
      total: parseFloat(order.total || 0),
      date: order.orderDate,
      customerId: parseInt(customerId)
    }));
    
    // En este punto, simplificamos y no buscamos los detalles de las órdenes
    // para enfocarnos en solucionar el problema principal
    
    const response = {
      data: simplifiedOrders,
      pagination: {
        page,
        limit,
        totalItems: totalOrders,
        totalPages
      }
    };
    
    console.log(`RESPUESTA FINAL: ${simplifiedOrders.length} órdenes`);
    console.log(`MUESTRA DE DATOS: ${JSON.stringify(simplifiedOrders.slice(0, 2))}`);
    console.log(`====== FIN DEPURACIÓN ======`);
    
    res.json(response);
  } catch (err) {
    console.error(`ERROR CRÍTICO: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ 
      error: err.message,
      success: false
    });
  }
};
/**
 * Obtener todas las órdenes de una fecha específica.
 * Retorna un array de órdenes para la fecha solicitada.
 */
exports.getOrdersByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    console.log(`getOrdersByDate - Fecha: ${date}`);
    
    // Validación básica
    if (!date) {
      console.log('getOrdersByDate - Error: Se requiere el parámetro de fecha');
      return res.status(400).json({ error: 'Se requiere el parámetro de fecha (formato YYYY-MM-DD)' });
    }
    
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log(`getOrdersByDate - Error: Formato de fecha inválido: ${date}`);
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
    console.log(`getOrdersByDate - Se obtuvieron ${orders.length} órdenes para la fecha ${date}`);
    
    // Asegurar formato de datos consistente
    const formattedOrders = orders.map(order => ({
      number: order.number,
      ticket: order.ticket,
      date: order.date,
      id: order.id,
      total: parseFloat(order.total || 0),
      name: order.name || 'Sin nombre'
    }));
    
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error al obtener órdenes por fecha:', err);
    res.status(500).json({ error: err.message });
  }
};