// backend/validations/schemas.js
const Joi = require('joi');

// Esquemas de validación para diferentes entidades

// Inventario
const inventorySchema = {
  create: Joi.object({
    registro: Joi.number().integer().required().messages({
      'number.base': 'El registro debe ser un número',
      'number.integer': 'El registro debe ser un número entero',
      'any.required': 'El registro es obligatorio'
    })
  }),
  
  update: Joi.object({
    telefono: Joi.string().allow('', null)
  })
};

// Fecha (para reportes, filtros, etc.)
const dateFilterSchema = Joi.object({
  from: Joi.date().iso().required().messages({
    'date.base': 'La fecha debe ser válida',
    'date.format': 'La fecha debe tener formato YYYY-MM-DD',
    'any.required': 'La fecha de inicio es obligatoria'
  }),
  to: Joi.date().iso().min(Joi.ref('from')).required().messages({
    'date.base': 'La fecha debe ser válida',
    'date.format': 'La fecha debe tener formato YYYY-MM-DD',
    'date.min': 'La fecha final debe ser mayor o igual a la fecha de inicio',
    'any.required': 'La fecha final es obligatoria'
  })
});

// Período (para dashboard)
const periodSchema = Joi.object({
  period: Joi.string().valid('semana', 'mes', 'trimestre', 'año').required().messages({
    'string.base': 'El período debe ser texto',
    'any.only': 'El período debe ser uno de: semana, mes, trimestre, año',
    'any.required': 'El período es obligatorio'
  })
});

// Cliente
const customerSchema = Joi.object({
  query: Joi.string().min(2).required().messages({
    'string.base': 'La búsqueda debe ser texto',
    'string.min': 'La búsqueda debe tener al menos 2 caracteres',
    'any.required': 'El término de búsqueda es obligatorio'
  })
});

// Orden
const orderIdSchema = Joi.object({
  ticket: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().pattern(/^\d+$/)
  ).required().messages({
    'alternatives.match': 'El ticket debe ser un número',
    'any.required': 'El ticket es obligatorio'
  })
});

module.exports = {
  inventorySchema,
  dateFilterSchema,
  periodSchema,
  customerSchema,
  orderIdSchema
};