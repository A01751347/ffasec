const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
   //user: 'my_app_user',
   //password: 'MiContraseñaSegura', 
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
