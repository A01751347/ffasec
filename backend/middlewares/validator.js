// backend/middlewares/validator.js
/**
 * Middleware para validar datos de entrada en las peticiones
 * @param {Object} schema - Schema de validación (usando Joi, express-validator, etc)
 * @param {String} property - Propiedad a validar ('body', 'query', 'params')
 */
const validator = (schema, property = 'body') => {
    return (req, res, next) => {
      const { error } = schema.validate(req[property]);
      
      if (!error) {
        next();
      } else {
        const { details } = error;
        const message = details.map(detail => detail.message).join(', ');
        console.error("Error de validación:", message);
        
        res.status(400).json({
          error: "Datos de entrada inválidos",
          details: message
        });
      }
    };
  };
  
  module.exports = validator;