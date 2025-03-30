// backend/controllers/salesController.js
require('dotenv').config();
const db = require('../config/db'); // Usar la conexión compartida
const { validateSaleData } = require('../validations/salesValidation'); // Importar validaciones

/**
 * Crear una nueva venta
 */
exports.createSale = async (req, res) => {
  let connection = null;
  
  try {
    // Validar los datos de la venta
    const { valid, errors } = validateSaleData(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors });
    }
    
    // Desestructurar los datos validados
    const { items, total, paymentMethod, cashReceived, change, date, customerName } = req.body;
    
    // Formatear fecha correctamente para MySQL
    const formattedDate = date ? 
      new Date(date).toISOString().slice(0, 19).replace('T', ' ') : 
      new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Iniciar transacción
    const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'my_app_user',
  password: process.env.DB_PASSWORD || 'MiContraseñaSegura',
  database: process.env.DB_DATABASE || 'facturas_db'
});
    await connection.beginTransaction();
    
    // Insertar venta principal
    const [result] = await connection.execute(
      `INSERT INTO Sales (date, total, payment_method, cash_received, change_given, customer_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        formattedDate,
        parseFloat(total) || 0,
        paymentMethod,
        paymentMethod === 'cash' ? (parseFloat(cashReceived) || 0) : null,
        paymentMethod === 'cash' ? (parseFloat(change) || 0) : null,
        customerName || 'Cliente General'
      ]
    );
    
    const saleId = result.insertId;
    
    // Insertar items de venta
    for (const item of items) {
      await connection.execute(
        `INSERT INTO SaleItems (sale_id, product_name, product_category, price, quantity, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.name,
          item.category || null,
          parseFloat(item.price) || 0,
          parseInt(item.quantity) || 1,
          parseFloat(item.price) * parseInt(item.quantity)
        ]
      );
    }
    
    // Confirmar transacción
    await connection.commit();
    
    // Responder éxito
    res.status(201).json({ 
      message: 'Venta procesada con éxito',
      saleId,
      total: parseFloat(total),
      items: items.length,
      customerName: customerName || 'Cliente General',
      date: formattedDate
    });
  } catch (error) {
    // Revertir transacción en caso de error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error adicional al hacer rollback:", rollbackError);
      }
    }
    
    console.error('Error al procesar la venta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la venta',
      details: error.message
    });
  } finally {
    // Liberar la conexión en cualquier caso
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error al liberar la conexión:", releaseError);
      }
    }
  }
};

/**
 * Obtener todas las ventas
 */
exports.getAllSales = async (req, res) => {
  try {
    const { startDate, endDate, customerName } = req.query;
    
    let query = `
      SELECT sale_id, date, total, payment_method, cash_received, change_given, customer_name, created_at
      FROM Sales
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtrar por fechas si se proporcionan
    if (startDate && endDate) {
      query += ` AND date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    } else if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }
    
    // Filtrar por cliente si se proporciona
    if (customerName) {
      query += ` AND customer_name LIKE ?`;
      params.push(`%${customerName}%`);
    }
    
    query += ` ORDER BY date DESC`;
    
    const [sales] = await db.promise().query(query, params);
    
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener detalles de una venta por ID
 */
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de venta inválido' });
    }
    
    // Obtener información de la venta
    const [sales] = await db.promise().query(
      `SELECT * FROM Sales WHERE sale_id = ?`,
      [id]
    );
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const sale = sales[0];
    
    // Obtener items de la venta
    const [items] = await db.promise().query(
      `SELECT * FROM SaleItems WHERE sale_id = ?`,
      [id]
    );
    
    // Combinar los datos
    const saleWithItems = {
      ...sale,
      items
    };
    
    res.json(saleWithItems);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener estadísticas de ventas
 */
exports.getSalesStats = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];
    
    // Construir filtro de fecha según el período solicitado
    if (startDate && endDate) {
      dateFilter = 'date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'date >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'date <= ?';
      params.push(endDate);
    } else {
      switch (period) {
        case 'today':
          dateFilter = 'DATE(date) = CURDATE()';
          break;
        case 'yesterday':
          dateFilter = 'DATE(date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
          break;
        case 'week':
          dateFilter = 'YEARWEEK(date) = YEARWEEK(NOW())';
          break;
        case 'month':
          dateFilter = 'MONTH(date) = MONTH(NOW()) AND YEAR(date) = YEAR(NOW())';
          break;
        case 'year':
          dateFilter = 'YEAR(date) = YEAR(NOW())';
          break;
        default:
          dateFilter = '1=1'; // Sin filtro
      }
    }
    
    // Estadísticas totales
    const [totalStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total) as revenue,
        AVG(total) as average_sale,
        COUNT(DISTINCT DATE(date)) as active_days,
        COUNT(DISTINCT customer_name) as total_customers
      FROM Sales
      WHERE ${dateFilter}
    `, params);
    
    // Estadísticas por método de pago
    const [paymentStats] = await db.promise().query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total
      FROM Sales
      WHERE ${dateFilter}
      GROUP BY payment_method
    `, params);
    
    // Productos más vendidos
    const [topProducts] = await db.promise().query(`
      SELECT 
        product_name,
        product_category,
        SUM(quantity) as total_quantity,
        SUM(subtotal) as total_amount
      FROM SaleItems si
      JOIN Sales s ON si.sale_id = s.sale_id
      WHERE ${dateFilter}
      GROUP BY product_name, product_category
      ORDER BY total_quantity DESC
      LIMIT 5
    `, params);
    
    // Clientes principales
    const [topCustomers] = await db.promise().query(`
      SELECT 
        customer_name,
        COUNT(*) as visits,
        SUM(total) as total_spent
      FROM Sales
      WHERE ${dateFilter} AND customer_name IS NOT NULL AND customer_name != 'Cliente General'
      GROUP BY customer_name
      ORDER BY total_spent DESC
      LIMIT 5
    `, params);
    
    res.json({
      overview: totalStats[0],
      payment_methods: paymentStats,
      top_products: topProducts,
      top_customers: topCustomers
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};