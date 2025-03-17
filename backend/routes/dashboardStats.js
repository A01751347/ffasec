// dashboardStats.js
const express = require('express');
const router = express.Router();
const db = require('../config/db').promise();

// Helper para formatear fecha a YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

router.get('/', async (req, res) => {
  try {
    const { from, to, period } = req.query;
    
    // 1. Si se envían "from" y "to", se usa esa lógica para filtrar por rango
    if (from && to) {
      // Prendas totales en rango
      const [totalPiecesRangeResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPiecesRange
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [from, to]
      );
      const totalPiecesRange = totalPiecesRangeResult[0].totalPiecesRange || 0;

      // Ventas totales en rango
      const [totalSalesRangeResult] = await db.query(
        `SELECT SUM(total) AS totalSalesRange
         FROM Orders
         WHERE date BETWEEN ? AND ?`,
        [from, to]
      );
      const totalSalesRange = totalSalesRangeResult[0].totalSalesRange || 0;

      return res.json({
        totalPiecesRange,
        totalSalesRange
      });
    } 
    // 2. Si se pasa el parámetro "period", se usa la lógica de ventanas móviles (DashboardPage)
    else if (period) {
      let currentStart, previousStart, previousEnd;
      const currentEndDate = new Date();

      switch (period) {
        case 'semana': {
          currentStart = new Date(currentEndDate);
          currentStart.setDate(currentStart.getDate() - 6);
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 6);
          break;
        }
        case 'mes': {
          currentStart = new Date(currentEndDate);
          currentStart.setDate(currentStart.getDate() - 29);
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 29);
          break;
        }
        case 'trimestre': {
          currentStart = new Date(currentEndDate);
          currentStart.setDate(currentStart.getDate() - 89);
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 89);
          break;
        }
        case 'año':
        default: {
          currentStart = new Date(currentEndDate);
          currentStart.setDate(currentStart.getDate() - 364);
          previousEnd = new Date(currentStart);
          previousEnd.setDate(previousEnd.getDate() - 1);
          previousStart = new Date(previousEnd);
          previousStart.setDate(previousStart.getDate() - 364);
          break;
        }
      }

      // Formateamos las fechas para MySQL
      const currentStartStr = formatDate(currentStart);
      const currentEndStr = formatDate(currentEndDate);
      const previousStartStr = formatDate(previousStart);
      const previousEndStr = formatDate(previousEnd);

      // Consultas para el período actual
      const [currentOrdersResult] = await db.query(
        `SELECT COUNT(*) AS totalOrders, SUM(total) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentOrders = currentOrdersResult[0].totalOrders || 0;
      const currentSales = currentOrdersResult[0].totalSales || 0;
      const currentAverageTicket = currentOrders > 0 ? (currentSales / currentOrders) : 0;

      const [currentCustomersResult] = await db.query(
        `SELECT COUNT(DISTINCT id) AS totalCustomers 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentCustomers = currentCustomersResult[0].totalCustomers || 0;

      const [currentPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentPieces = currentPiecesResult[0].totalPieces || 0;

      // Consultas para el período anterior
      const [previousOrdersResult] = await db.query(
        `SELECT COUNT(*) AS totalOrders, SUM(total) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousOrders = previousOrdersResult[0].totalOrders || 0;
      const previousSales = previousOrdersResult[0].totalSales || 0;
      const previousAverageTicket = previousOrders > 0 ? (previousSales / previousOrders) : 0;

      const [previousCustomersResult] = await db.query(
        `SELECT COUNT(DISTINCT id) AS totalCustomers 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousCustomers = previousCustomersResult[0].totalCustomers || 0;

      const [previousPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousPieces = previousPiecesResult[0].totalPieces || 0;

      // Función para calcular tendencia (variación porcentual)
      const calcTrend = (current, previous) => {
        return previous > 0 ? ((current - previous) / previous) * 100 : null;
      };

      const trends = {
        orders: calcTrend(currentOrders, previousOrders),
        averageTicket: calcTrend(currentAverageTicket, previousAverageTicket),
        customers: calcTrend(currentCustomers, previousCustomers),
        pieces: calcTrend(currentPieces, previousPieces),
        sales: calcTrend(currentSales, previousSales)
      };

      // Se retorna tanto la estructura para DashboardPage como la plana para UploadPage
      return res.json({
        current: {
          orders: currentOrders,
          averageTicket: currentAverageTicket,
          customers: currentCustomers,
          pieces: currentPieces,
        },
        previous: {
          orders: previousOrders,
          averageTicket: previousAverageTicket,
          customers: previousCustomers,
          pieces: previousPieces,
        },
        trends,
        totalSales: currentSales,
        newClients: currentCustomers,
        totalPieces: currentPieces,
        changePercentage: trends.sales
      });
    } 
    // 3. Si no se pasa "period", se usa la lógica original (por ejemplo, para UploadPage)
    else {
      // Ventas totales del año actual
      const [totalSalesResult] = await db.query(
        `SELECT SUM(total) AS totalSales 
         FROM Orders 
         WHERE YEAR(date) = YEAR(CURRENT_DATE())`
      );
      const totalSales = totalSalesResult[0].totalSales || 0;
      
      // Nuevos clientes (clientes cuyo primer pedido es este año)
      const [newClientsResult] = await db.query(
        `SELECT COUNT(*) AS newClients FROM (
           SELECT id, MIN(date) AS firstOrder 
           FROM Orders 
           GROUP BY id 
           HAVING YEAR(firstOrder) = YEAR(CURRENT_DATE())
         ) AS t`
      );
      const newClients = newClientsResult[0].newClients || 0;
      
      // Prendas totales: suma de pieces en órdenes de este año
      const [totalPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE YEAR(o.date) = YEAR(CURRENT_DATE())`
      );
      const totalPieces = totalPiecesResult[0].totalPieces || 0;
      
      // Cambio de ventas (mes anterior vs. penúltimo mes)
      const [lastMonthResult] = await db.query(
        `SELECT SUM(total) AS lastMonthSales
         FROM Orders
         WHERE date BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                        AND LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
      );
      const lastMonthSales = lastMonthResult[0].lastMonthSales || 0;
      
      const [prevMonthResult] = await db.query(
        `SELECT SUM(total) AS prevMonthSales
         FROM Orders
         WHERE date BETWEEN DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), '%Y-%m-01')
                        AND LAST_DAY(DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH))`
      );
      const prevMonthSales = prevMonthResult[0].prevMonthSales || 0;
      
      let changePercentage = null;
      if (prevMonthSales > 0) {
        changePercentage = ((lastMonthSales - prevMonthSales) / prevMonthSales) * 100;
      }
      
      // Prendas totales en los últimos 365 días
      const [totalPieces365Result] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces365
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY) AND CURRENT_DATE()`
      );
      const totalPieces365 = totalPieces365Result[0].totalPieces365 || 0;
      
      // Total de ventas en los últimos 365 días
      const [totalSales365Result] = await db.query(
        `SELECT SUM(total) AS totalSales365
         FROM Orders
         WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY) AND CURRENT_DATE()`
      );
      const totalSales365 = totalSales365Result[0].totalSales365 || 0;
      
      return res.json({
        totalSales,
        newClients,
        totalPieces,
        changePercentage,
        totalPieces365,
        totalSales365
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
