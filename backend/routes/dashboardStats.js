// routes/dashboardStats.js
const express = require('express');
const router = express.Router();
const db = require('../config/db').promise();

router.get('/', async (req, res) => {
  try {
    // Ventas totales del año actual:
    const [totalSalesResult] = await db.query(
      `SELECT SUM(total) AS totalSales 
       FROM Orders 
       WHERE YEAR(date) = YEAR(CURRENT_DATE())`
    );
    const totalSales = totalSalesResult[0].totalSales || 0;
    
    // Nuevos clientes (clientes cuyo primer pedido es este año):
    const [newClientsResult] = await db.query(
      `SELECT COUNT(*) AS newClients FROM (
         SELECT id, MIN(date) as firstOrder 
         FROM Orders 
         GROUP BY id 
         HAVING YEAR(firstOrder) = YEAR(CURRENT_DATE())
       ) AS t`
    );
    const newClients = newClientsResult[0].newClients || 0;
    
    // Prendas totales (suma de pieces de OrderDetails para órdenes de este año):
    const [totalPiecesResult] = await db.query(
      `SELECT SUM(od.pieces) AS totalPieces 
       FROM OrderDetails od
       JOIN Orders o ON od.number = o.number
       WHERE YEAR(o.date) = YEAR(CURRENT_DATE())`
    );
    const totalPieces = totalPiecesResult[0].totalPieces || 0;
    
    // Cambio de ventas: calcular ventas del último mes y del mes anterior
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
    
    res.json({
      totalSales,
      newClients,
      totalPieces,
      changePercentage
    });
    
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
