const db = require('../config/db');

/**
 * Obtener una orden por su ticket, con detalles anidados.
 * Retorna un objeto que representa la orden encontrada.
 */
exports.getOrderByTicket = (req, res) => {
  const ticket = req.params.ticket;
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
  `;

  db.query(query, [ticket], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    // Si no se encontró ninguna fila, la orden no existe
    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontró la orden con ese ticket.' });
    }

    // results = varias filas que comparten datos de la orden pero difieren en detalles
    // Armamos un único objeto "order" con un array de "details"
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
          pieces: row.pieces,
          quantity: row.quantity,
          date: row.detailDate,
          price: row.price
        });
      }
    });

    res.json(orderData);
  });
};
// orderController.js
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT 
      o.number,
      o.ticket,
      o.date,
      o.id,
      c.name,
      d.process,
      d.description,
      d.pieces,
      d.quantity,
      d.date as detailDate,
      d.price
    FROM Orders o
    JOIN Customers c ON o.id = c.id
    LEFT JOIN OrderDetails d ON o.number = d.number
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    // results es un array de filas (cada fila = 1 "detalle" de 1 orden)
    // Para anidar por orden:
    const ordersMap = {};  // { orderNumber: { ...orden, details: [] }}

    results.forEach(row => {
      if (!ordersMap[row.number]) {
        ordersMap[row.number] = {
          number: row.number,
          ticket: row.ticket,
          date: row.date,
          id: row.id,
          name: row.name,
          details: []
        };
      }
      // Agregar el detalle al array
      ordersMap[row.number].details.push({
        process: row.process,
        description: row.description,
        pieces: row.pieces,
        quantity: row.quantity,
        date: row.detailDate,
        price: row.price
      });
    });

    // Obtener un array final de órdenes con details anidados
    const ordersArray = Object.values(ordersMap);

    res.json(ordersArray);
  });
};

/**
 * Obtener todas las órdenes de un cliente, con detalles anidados.
 * Retorna un array de órdenes; cada orden contiene un array de details.
 */
exports.getOrdersByCustomer = (req, res) => {
  const customerId = req.params.customerId;
  const query = `
    SELECT 
      o.number,
      o.ticket,
      o.total,
      o.date as orderDate,
      o.id as customerId,
      d.process,
      d.description,
      d.pieces,
      d.quantity,
      d.date as detailDate,
      d.price
    FROM Orders o
    LEFT JOIN OrderDetails d ON o.number = d.number
    WHERE o.id = ?
  `;

  db.query(query, [customerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    // Si no se encontró nada, puede ser que no existan órdenes para ese cliente
    if (results.length === 0) {
      return res.json([]); // Devuelve un array vacío si no hay órdenes
    }

    // Vamos a agrupar las filas por número de orden
    const ordersMap = {};
    results.forEach(row => {
      if (!ordersMap[row.number]) {
        ordersMap[row.number] = {
          number: row.number,
          ticket: row.ticket,
          total: row.total,
          date: row.orderDate,
          customerId: row.customerId,
          details: []
        };
      }

      // Si la fila tiene información de detalle, la agregamos
      if (row.process || row.description || row.pieces || row.price) {
        ordersMap[row.number].details.push({
          process: row.process,
          description: row.description,
          pieces: row.pieces,
          quantity: row.quantity,
          date: row.detailDate,
          price: row.price
        });
      }
    });

    // Transformamos el objeto en un array de órdenes
    const ordersArray = Object.values(ordersMap);

    res.json(ordersArray);
  });
};
