const xlsx = require('xlsx');
const db = require('../config/db');
const { convertDate } = require('../utils/dateUtils');
const { calculatePieces } = require('../utils/calculatePieces');

exports.uploadExcel = (req, res) => {
  if (!req.file) {
    console.error("No se ha recibido ningún archivo.");
    return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
  }
  
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    
    // Agrupar datos por 'num' (número de orden)
    const ordersGrouped = jsonData.reduce((acc, row) => {
      const orderNum = row['num'];
      if (!acc[orderNum]) acc[orderNum] = [];
      acc[orderNum].push(row);
      return acc;
    }, {});
    
    // Procesar cada grupo
    for (const orderNum in ordersGrouped) {
      const group = ordersGrouped[orderNum];
      const orderHeader = group[0];
      const orderDate = convertDate(orderHeader['fecha']);
      
      // Insertar en Customers
      const insertCustomerQuery = `
        INSERT IGNORE INTO Customers (id, name)
        VALUES (?, ?)
      `;
      db.query(insertCustomerQuery, [
        orderHeader['idcliente'],
        orderHeader['clientebis']
      ], (err) => {
        if (err) {
          console.error('Error en Customers:', err);
          return;
        }
        // Insertar en Orders
        const insertOrderQuery = `
          INSERT INTO Orders (number, ticket, total, date, id)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertOrderQuery, [
          orderHeader['num'],
          orderHeader['numero'],
          orderHeader['total'],
          orderDate,
          orderHeader['idcliente']
        ], (err) => {
          if (err) {
            console.error('Error en Orders:', err);
            return;
          }
          // Insertar en OrderDetails (incluyendo la fecha)
          const detailsRows = group.length > 2 ? group.slice(1, -1) : group.slice(1);
detailsRows.forEach(row => {
  const pieces = calculatePieces(row['descripcio'], row['cantidad']);
  const insertDetailQuery = `
    INSERT INTO OrderDetails (number, process, description, pieces, quantity, date, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
            db.query(insertDetailQuery, [
              row['num'],
              row['proceso'],
              row['descripcio'],
              pieces,
              row['cantidad'],
              orderDate,
              row['nimplinea']
            ], (err) => {
              if (err) console.error('Error en OrderDetails:', err);
            });
          });
        });
      });
    }
    
    res.json({ message: 'Archivo procesado y datos migrados correctamente.' });
  } catch (error) {
    console.error("Error al procesar el archivo:", error);
    res.status(500).json({ error: 'Error al procesar el archivo.' });
  }
};
