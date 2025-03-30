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
      
      // Validar precio
      const price = parseFloat(item.price);
      if (isNaN(price) || price < 0) {
        errors.push(`El producto #${index + 1} tiene un precio inválido`);
      }
      
      // Validar cantidad
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`El producto #${index + 1} tiene una cantidad inválida`);
      }
    });
  }
  
  // Validar total de la venta
  const total = parseFloat(data.total);
  if (isNaN(total) || total < 0) {
    errors.push('El total de la venta es inválido');
  }
  
  // Validar método de pago
  if (!data.paymentMethod || 
      (data.paymentMethod !== 'cash' && data.paymentMethod !== 'card')) {
    errors.push('El método de pago debe ser efectivo o tarjeta');
  }
  
  // Validaciones específicas para pago en efectivo
  if (data.paymentMethod === 'cash') {
    const cashReceived = parseFloat(data.cashReceived);
    
    // Validar monto recibido
    if (isNaN(cashReceived) || cashReceived < total) {
      errors.push('El monto recibido debe ser mayor o igual al total');
    }
    
    // Validar cambio
    const change = parseFloat(data.change);
    if (isNaN(change)) {
      errors.push('El cambio es inválido');
    }
  }
  
  // Validar nombre de cliente (opcional, pero sanitizar si se proporciona)
  const customerName = (data.customerName || '').trim();
  if (customerName && customerName.length > 255) {
    errors.push('El nombre del cliente es demasiado largo');
  }
  
  // Validar fecha (opcional)
  if (data.date) {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push('La fecha proporcionada no es válida');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};