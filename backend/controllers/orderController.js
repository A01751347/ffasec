const db = require('../config/db');

exports.getOrderByTicket = (req, res) => {
  const ticket = req.params.ticket;
  const query = `
    SELECT o.number, o.ticket, o.date, o.id , c.name, d.process, d.description, d.pieces, d.quantity, d.date, d.price
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
    res.json(results);
  });
};


exports.getOrdersByCustomer = (req, res) => {
  const customerId = req.params.customerId;
  const query = `
    SELECT o.number, o.ticket, o.total, o.date
    FROM Orders o
    WHERE o.id = ?
  `;
  db.query(query, [customerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

