// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Añadido para seguridad
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit'); // Para limitar peticiones
const routes = require('./routes'); // Importar todas las rutas

const app = express();
const PORT = process.env.PORT || 5002;

// Configurar límite de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:"],
      "script-src": ["'self'", "'unsafe-inline'"],
    },
  }
})); // Seguridad con las cabeceras HTTP
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter); // Aplicar limitación de peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Configurar directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aplicar todas las rutas bajo /api
app.use('/api', routes);

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware para manejo de errores
app.use(errorHandler);

// Para cualquier otra ruta, servir el frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
  // Cerrar el servidor de forma ordenada
  server.close(() => {
    process.exit(1);
  });
  
  // Si el servidor no se cierra en 1 segundo, forzar el cierre
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Para cerrar el servidor adecuadamente en caso de señales de terminación
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Recibida señal de terminación, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error('No se pudo cerrar correctamente, forzando salida');
    process.exit(1);
  }, 10000);
}

module.exports = server; // Para testing