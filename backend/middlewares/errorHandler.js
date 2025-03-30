// backend/middlewares/errorHandler.js

// Para errores 404 - Ruta no encontrada
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  // Manejador de errores general
  const errorHandler = (err, req, res, next) => {
    // Si el status code sigue siendo 200, cambiarlo a 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Establecer código de estado
    res.status(statusCode);
    
    // Responder con JSON
    res.json({
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };
  
  module.exports = { notFound, errorHandler };