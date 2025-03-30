// backend/validations/salesValidation.js

/**
 * Valida los datos de una venta
 * @param {Object} data - Datos de la venta a validar
 * @returns {Object} - Objeto con el resultado de la validación
 */
exports.validateSaleData = (data) => {
    const errors = [];
    
    // Validar que existan items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Se requieren productos para la venta');
    } else {
      // Validar cada item
      data.items.forEach((item, index) => {
        if (!item.name) {
          errors.push(`El producto #${index + 1} debe tener un nombre`);
        }
        
        if (item.price === undefined || isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0) {
          errors.push(`El producto #${index + 1} tiene un precio inválido`);
        }
        
        if (item.quantity === undefined || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
          errors.push(`El producto #${index + 1} tiene una cantidad inválida`);
        }
      });
    }
    
    // Validar total
    if (data.total === undefined || isNaN(parseFloat(data.total)) || parseFloat(data.total) < 0) {
      errors.push('El total de la venta es inválido');
    }
    
    // Validar método de pago
    if (!data.paymentMethod || (data.paymentMethod !== 'cash' && data.paymentMethod !== 'card')) {
      errors.push('El método de pago debe ser efectivo o tarjeta');
    }
    
    // Para pagos en efectivo, validar campos adicionales
    if (data.paymentMethod === 'cash') {
      if (data.cashReceived === undefined || isNaN(parseFloat(data.cashReceived))) {
        errors.push('El monto recibido es requerido para pagos en efectivo');
      } else if (parseFloat(data.cashReceived) < parseFloat(data.total)) {
        errors.push('El monto recibido debe ser mayor o igual al total');
      }
      
      if (data.change === undefined) {
        errors.push('El campo cambio es requerido para pagos en efectivo');
      }
    }
    
    // Validar fecha (opcional)
    if (data.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
      if (!dateRegex.test(data.date) && !isNaN(new Date(data.date).getTime())) {
        errors.push('El formato de fecha es inválido');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };