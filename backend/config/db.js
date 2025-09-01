// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Mejor log de configuración con valores reales
console.log('Intentando conectar a MySQL con configuración:', {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE ,
  connectionLimit: 10
});

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir el pool a promesas para usar async/await
const promisePool = pool.promise();

// Comprobar conexión al iniciar y realizar consulta de prueba
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error crítico de conexión a MySQL:', {
      errorCode: err.code,
      errorMessage: err.message,
      fatal: err.fatal
    });
    return;
  }
  
  console.log('Conexión inicial a MySQL exitosa');
  
  // Realizar consulta de prueba
  connection.query('SELECT 1 AS test', (queryErr, results) => {
    if (queryErr) {
      console.error('Error en consulta de prueba:', queryErr);
    } else {
      console.log('Consulta de prueba exitosa:', results);
    }
    connection.release(); // Liberar la conexión
  });
});

// Wrapper para consultas que incluye mejor logging
const query = (sql, params) => {
  // Log para depuración
  console.log(`Ejecutando consulta: ${sql}`);
  console.log('Parámetros:', JSON.stringify(params));

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    pool.query(sql, params, (error, results) => {
      const executionTime = Date.now() - startTime;
      
      if (error) {
        console.error(`Error en consulta (${executionTime}ms):`, {
          sql,
          params,
          errorMessage: error.message,
          errorCode: error.code
        });
        return reject(error);
      }
      
      console.log(`Consulta exitosa (${executionTime}ms):`, {
        rowCount: Array.isArray(results) ? results.length : (results.affectedRows || 0)
      });
      
      return resolve(results);
    });
  });
}; 

module.exports = {
  query,
  pool,
  promisePool
};