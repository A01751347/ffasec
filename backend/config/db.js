// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Asegúrate de instalar dotenv: npm install dotenv

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_DATABASE || ''
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a la BD:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

module.exports = connection;