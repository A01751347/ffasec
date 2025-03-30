// backend/controllers/salesController.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Función para obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || ''
  });
};

/**
 * Crear una nueva venta
 */
exports.createSale = async (req, res) => {
  let connection;
  
  try {
    console.log("Recibidos datos de venta:", JSON.stringify(req.body, null, 2));
    
    const { items, total, paymentMethod, cashReceived, change, date, customerName } = req.body;
    
    // Validación de datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requieren productos para la venta' });
    }

    if (total === undefined || isNaN(parseFloat(total)) || parseFloat(total) < 0) {
      return res.status(400).json({ error: 'El total de la venta es inválido' });
    }

    if (!paymentMethod || (paymentMethod !== 'cash' && paymentMethod !== 'card')) {
      return res.status(400).json({ error: 'El método de pago debe ser efectivo o tarjeta' });
    }

    // Crear conexión y comenzar transacción
    try {
      connection = await getConnection();
      await connection.beginTransaction();
      console.log("Transacción iniciada");
    } catch (dbError) {
      console.error("Error al conectar a la base de datos:", dbError);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }
    
    // Formatear fecha correctamente para MySQL
    const formattedDate = date ? 
      new Date(date).toISOString().slice(0, 19).replace('T', ' ') : 
      new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
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
      console.log(`Venta insertada con ID: ${saleId}`);
      
      // Insertar items de venta
      for (const item of items) {
        // Validar cada item
        if (!item.name) {
          await connection.rollback();
          return res.status(400).json({ error: 'Todos los productos deben tener un nombre' });
        }
        
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 1;
        const subtotal = itemPrice * itemQuantity;
        
        console.log(`Insertando item: ${item.name}, precio: ${itemPrice}, cantidad: ${itemQuantity}`);
        
        await connection.execute(
          `INSERT INTO SaleItems (sale_id, product_name, product_category, price, quantity, subtotal) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            saleId,
            item.name,
            item.category || null,
            itemPrice,
            itemQuantity,
            subtotal
          ]
        );
      }
      
      await connection.commit();
      console.log("Transacción completada");
      
      res.status(201).json({ 
        message: 'Venta procesada con éxito',
        saleId,
        total: parseFloat(total),
        items: items.length,
        customerName: customerName || 'Cliente General',
        date: formattedDate
      });
    } catch (dbError) {
      // Error específico de la base de datos
      console.error("Error en operación de base de datos:", dbError);
      if (connection) {
        await connection.rollback();
        console.log("Transacción revertida");
      }
      return res.status(500).json({ 
        error: 'Error al guardar datos en la base de datos', 
        details: dbError.message
      });
    }
  } catch (error) {
    // Error general
    console.error('Error general al procesar la venta:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (e) {
        console.error("Error adicional al hacer rollback:", e);
      }
    }
    res.status(500).json({ 
      error: 'Error al procesar la venta',
      details: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        console.error("Error al cerrar la conexión:", e);
      }
    }
  }
};

/**
 * Obtener todas las ventas
 */
exports.getAllSales = async (req, res) => {
  let connection;
  
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
    
    connection = await getConnection();
    const [sales] = await connection.execute(query, params);
    
    res.json(sales);
    
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * Obtener detalles de una venta por ID
 */
exports.getSaleById = async (req, res) => {
  let connection;
  
  try {
    const { id } = req.params;
    
    connection = await getConnection();
    
    // Obtener información de la venta
    const [sales] = await connection.execute(
      `SELECT * FROM Sales WHERE sale_id = ?`,
      [id]
    );
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const sale = sales[0];
    
    // Obtener items de la venta
    const [items] = await connection.execute(
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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

/**
 * Obtener estadísticas de ventas
 */
exports.getSalesStats = async (req, res) => {
  let connection;
  
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
    
    connection = await getConnection();
    
    // Estadísticas totales
    const [totalStats] = await connection.execute(`
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
    const [paymentStats] = await connection.execute(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total
      FROM Sales
      WHERE ${dateFilter}
      GROUP BY payment_method
    `, params);
    
    // Productos más vendidos
    const [topProducts] = await connection.execute(`
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
    const [topCustomers] = await connection.execute(`
      SELECT 
        customer_name,
        COUNT(*) as visits,
        SUM(total) as total_spent
      FROM Sales
      WHERE ${dateFilter} AND customer_name IS NOT NULL
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
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};


