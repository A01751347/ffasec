// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config();

console.log('Intentando conectar con configuración:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE
});

// Crear pool de conexiones en lugar de una sola conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportar la promesa de conexión para usar async/await
const promisePool = pool.promise();

// Comprobar conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error de conexión a MySQL:', {
      errorCode: err.code,
      errorMessage: err.message,
      fatal: err.fatal
    });
    return;
  }
  console.log('Conexión exitosa a MySQL');
  connection.release(); // Liberar la conexión
});

// Exportamos tanto el pool normal (para callbacks) como el promise pool
module.exports = {
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  },
  pool,
  promisePool
};