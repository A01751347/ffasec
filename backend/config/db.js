// backend/config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Asegúrate de instalar dotenv: npm install dotenv

const connection = mysql.createConnection({
<<<<<<< HEAD
  host: 'localhost',
  //user: 'root',
  //password: '', 
   user: 'my_app_user',
  password: 'MiContraseñaSegura', 
  database: 'facturas_db'
});



=======
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_DATABASE || ''
});

>>>>>>> 5c3da81d3366b0916a52abddb9a0e8ac145d4bef
connection.connect(err => {
  if (err) {
    console.error('Error conectando a la BD:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

module.exports = connection;