const mysql = require('mysql2');
require('dotenv').config();

console.log('Intentando conectar con configuración:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a MySQL:', {
      errorCode: err.code,
      errorMessage: err.message,
      fatal: err.fatal
    });
    return;
  }
  console.log('Conexión exitosa a MySQL');
});