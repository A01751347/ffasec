// backend/routes/dashboardStats.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper para formatear fecha a YYYY-MM-DD de forma consistente
const formatDate = (date) => {
  if (!date) return null;
  return date instanceof Date 
    ? date.toISOString().split('T')[0]
    : String(date).split('T')[0];
};

// Helper para restar meses a una fecha (ej: 6 meses, 3 meses)
function subtractMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

// Helper para calcular variación porcentual con mejor manejo de casos especiales
function calcTrend(current, previous) {
  // Convertir a números si son strings
  current = typeof current === 'string' ? parseFloat(current) : current;
  previous = typeof previous === 'string' ? parseFloat(previous) : previous;
  
  // Validar que sean números
  if (isNaN(current)) current = 0;
  if (isNaN(previous)) previous = 0;
  
  // Manejar caso especial de previous = 0
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  // Calcular tendencia (nunca retornar null)
  const trend = ((current - previous) / previous) * 100;
  
  // Devolver con 2 decimales para evitar números enormes
  return parseFloat(trend.toFixed(2));
}

router.get('/', async (req, res) => {
  try {
    // Registrar parámetros recibidos para depuración
    console.log('Parámetros recibidos:', req.query);
    const { from, to, period } = req.query;

    // ------------------------------------------------------------------
    // 1) Si se envían "from" y "to", se usa esa lógica para filtrar por rango
    // ------------------------------------------------------------------
    if (from && to) {
      console.log(`Procesando estadísticas con rango: ${from} a ${to}`);
      
      // Prendas totales en rango
      const totalPiecesQuery = `
        SELECT COALESCE(SUM(od.pieces), 0) AS totalPiecesRange
        FROM OrderDetails od
        JOIN Orders o ON od.number = o.number
        WHERE o.date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de piezas totales');
      const [totalPiecesResults] = await db.promisePool.query(totalPiecesQuery, [from, to]);
      console.log('Resultado de piezas totales:', totalPiecesResults);
      
      const totalPiecesRange = parseFloat(totalPiecesResults[0]?.totalPiecesRange || 0);

      // Ventas totales en rango
      const totalSalesQuery = `
        SELECT COALESCE(SUM(total), 0) AS totalSalesRange
        FROM Orders
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de ventas totales');
      const [totalSalesResults] = await db.promisePool.query(totalSalesQuery, [from, to]);
      console.log('Resultado de ventas totales:', totalSalesResults);
      
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
      console.log(`Procesando estadísticas con periodo: ${period}`);
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

      // Log para depurar
      console.log('Rango actual:', currentStartStr, 'a', currentEndStr);
      console.log('Rango anterior:', previousStartStr, 'a', previousEndStr);

      // Ventas, órdenes, clientes, etc. en periodo actual
      const currentOrdersQuery = `
        SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalSales 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de órdenes actuales');
      const [currentOrdersResult] = await db.promisePool.query(currentOrdersQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de órdenes actuales:', currentOrdersResult);
      
      const currentOrders = parseInt(currentOrdersResult[0]?.totalOrders || 0);
      const currentSales = parseFloat(currentOrdersResult[0]?.totalSales || 0);
      const currentAverageTicket = currentOrders > 0 ? (currentSales / currentOrders) : 0;

      const currentCustomersQuery = `
        SELECT COUNT(DISTINCT id) AS totalCustomers 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de clientes actuales');
      const [currentCustomersResult] = await db.promisePool.query(currentCustomersQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de clientes actuales:', currentCustomersResult);
      
      const currentCustomers = parseInt(currentCustomersResult[0]?.totalCustomers || 0);

      const currentPiecesQuery = `
        SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces 
        FROM OrderDetails od
        JOIN Orders o ON od.number = o.number
        WHERE o.date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de piezas actuales');
      const [currentPiecesResult] = await db.promisePool.query(currentPiecesQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de piezas actuales:', currentPiecesResult);
      
      const currentPieces = parseInt(currentPiecesResult[0]?.totalPieces || 0);

      // Período anterior
      const previousOrdersQuery = `
        SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total), 0) AS totalSales 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de órdenes anteriores');
      const [previousOrdersResult] = await db.promisePool.query(previousOrdersQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de órdenes anteriores:', previousOrdersResult);
      
      const previousOrders = parseInt(previousOrdersResult[0]?.totalOrders || 0);
      const previousSales = parseFloat(previousOrdersResult[0]?.totalSales || 0);
      const previousAverageTicket = previousOrders > 0 ? (previousSales / previousOrders) : 0;

      const previousCustomersQuery = `
        SELECT COUNT(DISTINCT id) AS totalCustomers 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de clientes anteriores');
      const [previousCustomersResult] = await db.promisePool.query(previousCustomersQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de clientes anteriores:', previousCustomersResult);
      
      const previousCustomers = parseInt(previousCustomersResult[0]?.totalCustomers || 0);

      const previousPiecesQuery = `
        SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces 
        FROM OrderDetails od
        JOIN Orders o ON od.number = o.number
        WHERE o.date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de piezas anteriores');
      const [previousPiecesResult] = await db.promisePool.query(previousPiecesQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de piezas anteriores:', previousPiecesResult);
      
      const previousPieces = parseInt(previousPiecesResult[0]?.totalPieces || 0);

      // Calcular tendencias con mejor manejo de casos especiales
      const ordersTrend = calcTrend(currentOrders, previousOrders);
      const averageTicketTrend = calcTrend(currentAverageTicket, previousAverageTicket);
      const customersTrend = calcTrend(currentCustomers, previousCustomers);
      const piecesTrend = calcTrend(currentPieces, previousPieces);
      const salesTrend = calcTrend(currentSales, previousSales);

      // Log para depurar tendencias
      console.log('Tendencias calculadas:', {
        ordersTrend,
        averageTicketTrend,
        customersTrend,
        piecesTrend,
        salesTrend
      });

      return res.json({
        current: {
          orders: currentOrders,
          averageTicket: parseFloat(currentAverageTicket.toFixed(2)),
          customers: currentCustomers,
          pieces: currentPieces,
        },
        previous: {
          orders: previousOrders,
          averageTicket: parseFloat(previousAverageTicket.toFixed(2)),
          customers: previousCustomers,
          pieces: previousPieces,
        },
        trends: {
          orders: ordersTrend,
          averageTicket: averageTicketTrend,
          customers: customersTrend,
          pieces: piecesTrend,
          sales: salesTrend
        },
        totalSales: currentSales,
        newClients: currentCustomers,
        totalPieces: currentPieces,
        changePercentage: salesTrend
      });
    }

    // ------------------------------------------------------------------
    // 3) Lógica por defecto (sin "from/to" ni "period") - Todo el año
    // ------------------------------------------------------------------
    else {
      console.log('Procesando estadísticas para el año completo (por defecto)');
      
      // 3.1) Hallar la última fecha de orden en el año actual
      const lastDateQuery = `
        SELECT MAX(date) AS lastOrderDate
        FROM Orders
        WHERE YEAR(date) = YEAR(CURRENT_DATE())
      `;
      
      console.log('Ejecutando consulta de última fecha');
      const [lastDateResult] = await db.promisePool.query(lastDateQuery);
      console.log('Resultado de última fecha:', lastDateResult);
      
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

      // Log para depurar rangos
      console.log('Rango actual año completo:', currentStartStr, 'a', currentEndStr);
      console.log('Rango anterior año completo:', previousStartStr, 'a', previousEndStr);

      // --- Ventas Totales en rango actual
      const currentSalesQuery = `
        SELECT COALESCE(SUM(total), 0) AS totalSales 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de ventas actuales - año completo');
      const [currentSalesResult] = await db.promisePool.query(currentSalesQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de ventas actuales - año completo:', currentSalesResult);
      
      const currentSales = parseFloat(currentSalesResult[0]?.totalSales || 0);

      // --- Ventas Totales en rango anterior
      const previousSalesQuery = `
        SELECT COALESCE(SUM(total), 0) AS totalSales 
        FROM Orders 
        WHERE date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de ventas anteriores - año completo');
      const [previousSalesResult] = await db.promisePool.query(previousSalesQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de ventas anteriores - año completo:', previousSalesResult);
      
      const previousSales = parseFloat(previousSalesResult[0]?.totalSales || 0);

      // --- Cambio porcentual de ventas
      const changePercentage = calcTrend(currentSales, previousSales);

      // --- Nuevos clientes (primer compra en el rango actual)
      const currentNewClientsQuery = `
        SELECT COUNT(*) AS newClients 
        FROM (
          SELECT id, MIN(date) AS firstOrder
          FROM Orders
          GROUP BY id
          HAVING MIN(date) BETWEEN ? AND ?
        ) AS t
      `;
      
      console.log('Ejecutando consulta de nuevos clientes - año completo');
      const [currentNewClientsResult] = await db.promisePool.query(currentNewClientsQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de nuevos clientes - año completo:', currentNewClientsResult);
      
      const newClients = parseInt(currentNewClientsResult[0]?.newClients || 0);

      // --- Nuevos clientes en el rango anterior (para comparación)
      const previousNewClientsQuery = `
        SELECT COUNT(*) AS newClients 
        FROM (
          SELECT id, MIN(date) AS firstOrder
          FROM Orders
          GROUP BY id
          HAVING MIN(date) BETWEEN ? AND ?
        ) AS t
      `;
      
      console.log('Ejecutando consulta de nuevos clientes anteriores - año completo');
      const [previousNewClientsResult] = await db.promisePool.query(previousNewClientsQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de nuevos clientes anteriores - año completo:', previousNewClientsResult);
      
      const oldNewClients = parseInt(previousNewClientsResult[0]?.newClients || 0);
      const newClientsTrend = calcTrend(newClients, oldNewClients);

      // --- Prendas totales en el rango actual
      const currentPiecesQuery = `
        SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces
        FROM OrderDetails od
        JOIN Orders o ON od.number = o.number
        WHERE o.date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de piezas totales - año completo');
      const [currentPiecesResult] = await db.promisePool.query(currentPiecesQuery, [currentStartStr, currentEndStr]);
      console.log('Resultado de piezas totales - año completo:', currentPiecesResult);
      
      const totalPieces = parseInt(currentPiecesResult[0]?.totalPieces || 0);

      // --- Prendas totales en el rango anterior (para comparar)
      const previousPiecesQuery = `
        SELECT COALESCE(SUM(od.pieces), 0) AS totalPieces
        FROM OrderDetails od
        JOIN Orders o ON od.number = o.number
        WHERE o.date BETWEEN ? AND ?
      `;
      
      console.log('Ejecutando consulta de piezas anteriores - año completo');
      const [previousPiecesResult] = await db.promisePool.query(previousPiecesQuery, [previousStartStr, previousEndStr]);
      console.log('Resultado de piezas anteriores - año completo:', previousPiecesResult);
      
      const oldPieces = parseInt(previousPiecesResult[0]?.totalPieces || 0);
      const piecesTrend = calcTrend(totalPieces, oldPieces);

      // --- Ordenes en Inventario
      const inventoryCountQuery = `
        SELECT COUNT(*) AS inventoryCount
        FROM Inventario
      `;
      
      console.log('Ejecutando consulta de inventario');
      const [inventoryCountResult] = await db.promisePool.query(inventoryCountQuery);
      console.log('Resultado de inventario:', inventoryCountResult);
      
      const inventoryCount = parseInt(inventoryCountResult[0]?.inventoryCount || 0);

      // --- Clientes Frecuentes: más de 5 órdenes en últimos 6 meses
      const sixMonthsAgo = subtractMonths(currentEnd, 6);
      const sixMonthsAgoStr = formatDate(sixMonthsAgo);
      
      const frequentQuery = `
        SELECT COUNT(*) AS frequentClients
        FROM (
          SELECT id, COUNT(*) AS orderCount
          FROM Orders
          WHERE date BETWEEN ? AND ?
          GROUP BY id
          HAVING COUNT(*) > 5
        ) AS sub
      `;
      
      console.log('Ejecutando consulta de clientes frecuentes');
      const [frequentResult] = await db.promisePool.query(frequentQuery, [sixMonthsAgoStr, currentEndStr]);
      console.log('Resultado de clientes frecuentes:', frequentResult);
      
      const frequentClients = parseInt(frequentResult[0]?.frequentClients || 0);

      // --- Clientes Perdidos: sin órdenes en los últimos 3 meses
      const threeMonthsAgo = subtractMonths(currentEnd, 3);
      const threeMonthsAgoStr = formatDate(threeMonthsAgo);
      
      const lostQuery = `
        SELECT COUNT(*) AS lostClients
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
        )
      `;
      
      console.log('Ejecutando consulta de clientes perdidos');
      const [lostResult] = await db.promisePool.query(lostQuery, [threeMonthsAgoStr]);
      console.log('Resultado de clientes perdidos:', lostResult);
      
      const lostClients = parseInt(lostResult[0]?.lostClients || 0);

      // --- Respuesta final, asegurando que todos los campos son números válidos
      const response = {
        // Lo que ya tenías:
        totalSales: parseFloat(currentSales.toFixed(2)),
        newClients: newClients,
        totalPieces: totalPieces,
        // El "cambio" vs. el año pasado:
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        // Tendencias individuales
        newClientsTrend: parseFloat(newClientsTrend.toFixed(2)),
        piecesTrend: parseFloat(piecesTrend.toFixed(2)),
        // Ordenes en Inventario
        inventoryCount: inventoryCount,
        // Clientes Frecuentes y Perdidos
        frequentClients: frequentClients,
        lostClients: lostClients,
        // Info textual para la UI
        infoRange: `Comparado desde el año pasado (del ${formatDate(previousStart)} al ${formatDate(previousEnd)})`
      };
      
      // Log final para depurar respuesta completa
      console.log('Respuesta final de dashboard por defecto:', response);
      
      return res.json(response);
    }
  } catch (err) {
    console.error("Error crítico en dashboard stats:", err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
});

module.exports = router;