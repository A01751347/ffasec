const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  //user: 'root',
  user: 'my_app_user',  // Cambia a 'my_app_user'
  password: '',         // Contraseña vacía (tal como lo creaste)
  database: 'facturas_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error conectando a la BD:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

module.exports = connection;
