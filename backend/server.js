// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

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
})); 
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Aplicar todas las rutas bajo /api
app.use('/api', routes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Para cualquier otra ruta, servir el frontend (SPA)
// IMPORTANTE: Esta ruta debe estar después de todas las demás rutas API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Middleware para rutas no encontradas debe venir después del fallback a index.html
// para evitar que capture rutas SPA
app.use(notFound);

// Middleware para manejo de errores
app.use(errorHandler);

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

module.exports = server;