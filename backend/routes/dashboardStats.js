// dashboardStats.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper para formatear fecha a YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// Helper para restar meses a una fecha (ej: 6 meses, 3 meses)
function subtractMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

// Helper para calcular variación porcentual
function calcTrend(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

router.get('/', async (req, res) => {
  try {
    const { from, to, period } = req.query;

    // ------------------------------------------------------------------
    // 1) Si se envían "from" y "to", se usa esa lógica para filtrar por rango
    // ------------------------------------------------------------------
    if (from && to) {
      // Prendas totales en rango
      const [totalPiecesResults] = await db.query(
        `SELECT COALESCE(SUM(od.pieces), 0) AS totalPiecesRange
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [from, to]
      );
      const totalPiecesRange = parseFloat(totalPiecesResults[0]?.totalPiecesRange || 0);

      // Ventas totales en rango
      const [totalSalesResults] = await db.query(
        `SELECT COALESCE(SUM(total), 0) AS totalSalesRange
         FROM Orders
         WHERE date BETWEEN ? AND ?`,
        [from, to]
      );
      const totalSalesRange = parseFloat(totalSalesResults[0]?.totalSalesRange || 0);

      return res.json({
        totalPiecesRange,
        totalSalesRange
      });
    }

    // ------------------------------------------------------------------
    // 2) Si se pasa el parámetro "period", se usa la lógica de ventanas móviles
    //    (semana, mes, trimestre, año)
    // ------------------------------------------------------------------
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

      const currentStartStr = formatDate(currentStart);
      const currentEndStr = formatDate(currentEndDate);
      const previousStartStr = formatDate(previousStart);
      const previousEndStr = formatDate(previousEnd);

      // Ventas, órdenes, clientes, etc.
      const [currentOrdersResult] = await db.query(
        `SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentOrders = parseInt(currentOrdersResult[0]?.totalOrders || 0);
      const currentSales = parseFloat(currentOrdersResult[0]?.totalSales || 0);
      const currentAverageTicket = currentOrders > 0 ? (currentSales / currentOrders) : 0;

      const [currentCustomersResult] = await db.query(
        `SELECT COUNT(DISTINCT id) AS totalCustomers 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentCustomers = parseInt(currentCustomersResult[0]?.totalCustomers || 0);

      const [currentPiecesResult] = await db.query(
        `SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentPieces = parseInt(currentPiecesResult[0]?.totalPieces || 0);

      // Período anterior
      const [previousOrdersResult] = await db.query(
        `SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousOrders = parseInt(previousOrdersResult[0]?.totalOrders || 0);
      const previousSales = parseFloat(previousOrdersResult[0]?.totalSales || 0);
      const previousAverageTicket = previousOrders > 0 ? (previousSales / previousOrders) : 0;

      const [previousCustomersResult] = await db.query(
        `SELECT COUNT(DISTINCT id) AS totalCustomers 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousCustomers = parseInt(previousCustomersResult[0]?.totalCustomers || 0);

      const [previousPiecesResult] = await db.query(
        `SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousPieces = parseInt(previousPiecesResult[0]?.totalPieces || 0);

      const trends = {
        orders: calcTrend(currentOrders, previousOrders),
        averageTicket: calcTrend(currentAverageTicket, previousAverageTicket),
        customers: calcTrend(currentCustomers, previousCustomers),
        pieces: calcTrend(currentPieces, previousPieces),
        sales: calcTrend(currentSales, previousSales)
      };

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

    // ------------------------------------------------------------------
    // 3) Lógica por defecto (sin "from/to" ni "period")
    // ------------------------------------------------------------------
    else {
      // 3.1) Hallar la última fecha de orden en el año actual
      const [lastDateResult] = await db.query(`
        SELECT MAX(date) AS lastOrderDate
        FROM Orders
        WHERE YEAR(date) = YEAR(CURRENT_DATE())
      `);

      let lastOrderDate = lastDateResult[0]?.lastOrderDate;
      // Si no hay órdenes este año, tomamos la fecha actual como fallback
      if (!lastOrderDate) {
        lastOrderDate = new Date();
      } else {
        lastOrderDate = new Date(lastOrderDate);
      }

      // Rango "actual": 1 de enero año actual -> lastOrderDate
      const currentYear = new Date().getFullYear();
      const currentStart = new Date(currentYear, 0, 1); // 1 de enero
      const currentEnd = lastOrderDate;
      const currentStartStr = formatDate(currentStart);
      const currentEndStr = formatDate(currentEnd);

      // Rango "anterior": 1 de enero año anterior -> misma fecha año anterior
      const previousYear = currentYear - 1;
      const previousStart = new Date(previousYear, 0, 1); // 1 de enero del año anterior
      // "misma fecha" = lastOrderDate - 1 año
      const previousEnd = new Date(currentEnd);
      previousEnd.setFullYear(previousEnd.getFullYear() - 1);
      const previousStartStr = formatDate(previousStart);
      const previousEndStr = formatDate(previousEnd);

      // --- Ventas Totales en rango actual
      const [currentSalesResult] = await db.query(
        `SELECT COALESCE(SUM(total), 0) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentSales = parseFloat(currentSalesResult[0]?.totalSales || 0);

      // --- Ventas Totales en rango anterior
      const [previousSalesResult] = await db.query(
        `SELECT COALESCE(SUM(total), 0) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousSales = parseFloat(previousSalesResult[0]?.totalSales || 0);

      // --- Cambio porcentual de ventas
      const changePercentage = calcTrend(currentSales, previousSales);

      // --- Nuevos clientes (primer compra en el rango actual)
      const [currentNewClientsResult] = await db.query(
        `SELECT COUNT(*) AS newClients 
         FROM (
           SELECT id, MIN(date) AS firstOrder
           FROM Orders
           GROUP BY id
           HAVING MIN(date) BETWEEN ? AND ?
         ) AS t`,
        [currentStartStr, currentEndStr]
      );
      const newClients = parseInt(currentNewClientsResult[0]?.newClients || 0);

      // --- Nuevos clientes en el rango anterior (para comparación)
      const [previousNewClientsResult] = await db.query(
        `SELECT COUNT(*) AS newClients 
         FROM (
           SELECT id, MIN(date) AS firstOrder
           FROM Orders
           GROUP BY id
           HAVING MIN(date) BETWEEN ? AND ?
         ) AS t`,
        [previousStartStr, previousEndStr]
      );
      const oldNewClients = parseInt(previousNewClientsResult[0]?.newClients || 0);
      const newClientsTrend = calcTrend(newClients, oldNewClients);

      // --- Prendas totales en el rango actual
      const [currentPiecesResult] = await db.query(
        `SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const totalPieces = parseInt(currentPiecesResult[0]?.totalPieces || 0);

      // --- Prendas totales en el rango anterior (para comparar)
      const [previousPiecesResult] = await db.query(
        `SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const oldPieces = parseInt(previousPiecesResult[0]?.totalPieces || 0);
      const piecesTrend = calcTrend(totalPieces, oldPieces);

      // --- Ordenes en Inventario
      const [inventoryCountResult] = await db.query(
        `SELECT COUNT(*) AS inventoryCount
         FROM Inventario`
      );
      const inventoryCount = parseInt(inventoryCountResult[0]?.inventoryCount || 0);

      // --- Clientes Frecuentes: más de 5 órdenes en últimos 6 meses
      const sixMonthsAgo = subtractMonths(currentEnd, 6);
      const sixMonthsAgoStr = formatDate(sixMonthsAgo);
      const [frequentResult] = await db.query(
        `SELECT COUNT(*) AS frequentClients
         FROM (
           SELECT id, COUNT(*) AS orderCount
           FROM Orders
           WHERE date BETWEEN ? AND ?
           GROUP BY id
           HAVING COUNT(*) > 5
         ) AS sub`,
        [sixMonthsAgoStr, currentEndStr]
      );
      const frequentClients = parseInt(frequentResult[0]?.frequentClients || 0);

      // --- Clientes Perdidos: sin órdenes en los últimos 3 meses
      const threeMonthsAgo = subtractMonths(currentEnd, 3);
      const threeMonthsAgoStr = formatDate(threeMonthsAgo);
      const [lostResult] = await db.query(
        `SELECT COUNT(*) AS lostClients
         FROM Customers c
         WHERE EXISTS (
           SELECT 1 
           FROM Orders o
           WHERE o.id = c.id
         )
         AND NOT EXISTS (
           SELECT 1 
           FROM Orders o
           WHERE o.id = c.id
             AND o.date > ?
         )`,
        [threeMonthsAgoStr]
      );
      const lostClients = parseInt(lostResult[0]?.lostClients || 0);

      // --- Retornar datos finales
      return res.json({
        // Lo que ya tenías:
        totalSales: currentSales,
        newClients,
        totalPieces,
        // El "cambio" vs. el año pasado:
        changePercentage,
        // Tendencias individuales
        newClientsTrend,
        piecesTrend,
        // Ordenes en Inventario
        inventoryCount,
        // Clientes Frecuentes y Perdidos
        frequentClients,
        lostClients,
        // Info textual para la UI
        infoRange: `Comparado desde el año pasado (del ${formatDate(previousStart)} al ${formatDate(previousEnd)})`
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;