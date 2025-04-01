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

    // ------------------------------------------------------------------
    // 2) Si se pasa el parámetro "period", se usa la lógica de ventanas móviles
    //    (semana, mes, trimestre, año) [la lógica previa que ya tenías].
    // ------------------------------------------------------------------
    else if (period) {
      // Se mantiene igual a tu implementación previa
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

      // Ventas, órdenes, clientes, etc. (tal cual tu código original)
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

      // Período anterior
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

      
      //console.log(previousCustomersResult[0].totalCustomers);

      const [previousPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces 
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousPieces = previousPiecesResult[0].totalPieces || 0;

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
        newClients: currentCustomers, // puedes ajustar
        totalPieces: currentPieces,
        changePercentage: trends.sales
      });
    }

    // ------------------------------------------------------------------
    // 3) Lógica por defecto (sin "from/to" ni "period")
    //    Aquí añadimos la nueva lógica que necesitas:
    //    - Última fecha de orden del año actual
    //    - Comparación 1 enero de este año -> última fecha
    //      vs. 1 enero del año anterior -> misma fecha
    //    - Nuevos clientes, clientes frecuentes, clientes perdidos, etc.
    // ------------------------------------------------------------------
    else {
      // 3.1) Hallar la última fecha de orden en el año actual
      const [lastDateResult] = await db.query(`
        SELECT MAX(date) AS lastOrderDate
        FROM Orders
        WHERE YEAR(date) = YEAR(CURRENT_DATE())
      `);

      let lastOrderDate = lastDateResult[0].lastOrderDate;
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
        `SELECT SUM(total) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const currentSales = currentSalesResult[0].totalSales || 0;
      console.log('camara',currentSales);

      // --- Ventas Totales en rango anterior
      const [previousSalesResult] = await db.query(
        `SELECT SUM(total) AS totalSales 
         FROM Orders 
         WHERE date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const previousSales = previousSalesResult[0].totalSales || 0;

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
      const newClients = currentNewClientsResult[0].newClients || 0;
      //console.log(newClients);
    

      // --- Nuevos clientes en el rango anterior (para comparación, si quieres)
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
      const oldNewClients = previousNewClientsResult[0].newClients || 0;
      const newClientsTrend = calcTrend(newClients, oldNewClients);
    //console.log(oldNewClients);
    //console.log(newClientsTrend);
      // --- Prendas totales en el rango actual
      const [currentPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [currentStartStr, currentEndStr]
      );
      const totalPieces = currentPiecesResult[0].totalPieces || 0;

      // --- Prendas totales en el rango anterior (para comparar si deseas)
      const [previousPiecesResult] = await db.query(
        `SELECT SUM(od.pieces) AS totalPieces
         FROM OrderDetails od
         JOIN Orders o ON od.number = o.number
         WHERE o.date BETWEEN ? AND ?`,
        [previousStartStr, previousEndStr]
      );
      const oldPieces = previousPiecesResult[0].totalPieces || 0;
      const piecesTrend = calcTrend(totalPieces, oldPieces);

      // --- Ordenes en Inventario
      const [inventoryCountResult] = await db.query(
        `SELECT COUNT(*) AS inventoryCount
         FROM Inventario`
      );
      const inventoryCount = inventoryCountResult[0].inventoryCount || 0;

      // --- Clientes Frecuentes: más de 5 órdenes en últimos 6 meses
      //     Tomamos la fecha 'currentEnd' como referencia
      const sixMonthsAgo = subtractMonths(currentEnd, 6);
      const sixMonthsAgoStr = formatDate(sixMonthsAgo);
      const [frequentResult] = await db.query(
        `SELECT COUNT(*) AS frequentClients
         FROM (
           SELECT id, COUNT(*) AS orderCount
           FROM Orders
           WHERE date BETWEEN ? AND ?
           GROUP BY id
         ) AS sub
         WHERE sub.orderCount > 5`,
        [sixMonthsAgoStr, currentEndStr]
      );
      const frequentClients = frequentResult[0].frequentClients || 0;

      // --- Clientes Perdidos: sin órdenes en los últimos 3 meses
      //     Tomamos 'currentEnd' como referencia también
      const threeMonthsAgo = subtractMonths(currentEnd, 3);
      const threeMonthsAgoStr = formatDate(threeMonthsAgo);
      // Contamos en la tabla de 'Customers' los que NO tengan
      // órdenes posteriores a 'threeMonthsAgo'
      const [lostResult] = await db.query(
        `SELECT COUNT(*) AS lostClients
         FROM Customers c
         WHERE NOT EXISTS (
           SELECT 1 
           FROM Orders o
           WHERE o.id = c.id
             AND o.date > ?
         )`,
        [threeMonthsAgoStr]
      );
      const lostClients = lostResult[0].lostClients || 0;
console.log(currentSales,
  newClients,
  totalPieces,
  // El "cambio" vs. el año pasado:
  changePercentage,
  // Ejemplo de tendencias individuales
  newClientsTrend,
  piecesTrend,
  // Ordenes en Inventario
  inventoryCount,
  // Clientes Frecuentes y Perdidos
  frequentClients,
  lostClients,)
      // --- Retornar datos finales
      return res.json({
        // Lo que ya tenías:
        totalSales: currentSales,
        newClients,
        totalPieces,
        // El "cambio" vs. el año pasado:
        changePercentage,
        // Ejemplo de tendencias individuales
        newClientsTrend,
        piecesTrend,
        // Ordenes en Inventario
        inventoryCount,
        // Clientes Frecuentes y Perdidos
        frequentClients,
        lostClients,
        // Info textual para tu UI
        infoRange: `Comparado desde el año pasado (del ${formatDate(previousStart)} al ${formatDate(previousEnd)})`

        
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
