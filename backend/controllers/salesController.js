// backend/controllers/salesController.js
const db = require('../config/db');
const { validateSaleData } = require('../validations/salesValidation');

/**
 * Crear una nueva venta
 */
exports.createSale = async (req, res) => {
  try {
    // Registrar datos de entrada para depuración
    console.log('Datos de venta recibidos:', JSON.stringify(req.body, null, 2));
    
    // Validar los datos de la venta
    const { valid, errors } = validateSaleData(req.body);
    if (!valid) {
      console.error('Errores de validación:', errors);
      return res.status(400).json({ 
        error: 'Datos de venta inválidos', 
        details: errors 
      });
    }
    
    // Desestructurar los datos validados
    const { 
      items, 
      total, 
      paymentMethod, 
      cashReceived, 
      change, 
      date, 
      customerName 
    } = req.body;
    
    // Formatear fecha correctamente para MySQL
    const formattedDate = date ? 
      new Date(date).toISOString().slice(0, 19).replace('T', ' ') : 
      new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Iniciar transacción
    const connection = await db.promisePool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insertar venta principal
      const [saleResult] = await connection.query(
        `INSERT INTO Sales (
          date, 
          total, 
          payment_method, 
          cash_received, 
          change_given, 
          customer_name
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          formattedDate,
          parseFloat(total) || 0,
          paymentMethod,
          paymentMethod === 'cash' ? (parseFloat(cashReceived) || 0) : null,
          paymentMethod === 'cash' ? (parseFloat(change) || 0) : null,
          customerName || 'Cliente General'
        ]
      );
      
      const saleId = saleResult.insertId;
      
      // Insertar items de venta
      for (const item of items) {
        await connection.query(
          `INSERT INTO SaleItems (
            sale_id, 
            product_name, 
            product_category, 
            price, 
            quantity, 
            subtotal
          ) VALUES (?, ?, ?, ?, ?, ?)`,
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
      connection.release();
      
      // Responder éxito
      console.log('Venta procesada exitosamente:', {
        saleId,
        total,
        items: items.length,
        customerName: customerName || 'Cliente General'
      });
      
      res.status(201).json({ 
        message: 'Venta procesada con éxito',
        saleId,
        total: parseFloat(total),
        items: items.length,
        customerName: customerName || 'Cliente General',
        date: formattedDate
      });
      
    } catch (dbError) {
      // Revertir transacción en caso de error
      await connection.rollback();
      connection.release();
      
      console.error('Error al procesar la transacción de venta:', {
        message: dbError.message,
        sql: dbError.sql,
        sqlState: dbError.sqlState,
        sqlMessage: dbError.sqlMessage
      });
      
      res.status(500).json({ 
        error: 'Error al guardar la venta en la base de datos',
        details: dbError.message,
        sqlError: dbError.sqlMessage || 'Error de base de datos desconocido'
      });
    }
  } catch (error) {
    console.error('Error general al procesar la venta:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Error interno al procesar la venta',
      details: error.message
    });
  }
};

/**
 * Obtener todas las ventas
 */
exports.getAllSales = async (req, res) => {
  try {
    const { startDate, endDate, customerName } = req.query;
    
    let query = `
      SELECT 
        sale_id, 
        date, 
        total, 
        payment_method, 
        cash_received, 
        change_given, 
        customer_name, 
        created_at
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
    
    const sales = await db.query(query, params);
    
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ 
      error: 'Error al recuperar las ventas', 
      details: error.message 
    });
  }
};

/**
 * Obtener detalles de una venta por ID
 */
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch sale details
    const sales = await db.query(
      `SELECT * FROM Sales WHERE sale_id = ?`,
      [id]
    );
    
    if (sales.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const sale = sales[0];
    
    // Fetch sale items
    const items = await db.query(
      `SELECT 
        product_name, 
        product_category, 
        price, 
        quantity, 
        subtotal 
      FROM SaleItems 
      WHERE sale_id = ?`,
      [id]
    );
    
    // Combine sale details with items
    res.json({
      ...sale,
      items
    });
    
  } catch (error) {
    console.error('Error al obtener detalles de venta:', error);
    res.status(500).json({ 
      error: 'Error al recuperar los detalles de la venta', 
      details: error.message 
    });
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
    const [totalStats] = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total), 0) as revenue,
        (CASE WHEN COUNT(*) > 0 THEN SUM(total)/COUNT(*) ELSE 0 END) as average_sale,
        COUNT(DISTINCT DATE(date)) as active_days,
        COUNT(DISTINCT customer_name) as total_customers
      FROM Sales
      WHERE ${dateFilter}
    `, params);
    
    // Estadísticas por método de pago
    const paymentStats = await db.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM Sales
      WHERE ${dateFilter}
      GROUP BY payment_method
    `, params);
    
    // Productos más vendidos
    const topProducts = await db.query(`
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
    const topCustomers = await db.query(`
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
    res.status(500).json({ 
      error: 'Error al recuperar las estadísticas de ventas', 
      details: error.message 
    });
  }
};