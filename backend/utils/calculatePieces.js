// Función para calcular pieces usando la expresión regular proporcionada
function calculatePieces(description, quantity) {
    const regex = /(\d+)\s*[XxDdEe]/; // Busca el número antes de "X" o "DE"
    const match = description.match(regex);
    
    if (match) {
      const factor = parseInt(match[1], 10); // Convierte el número encontrado a entero
      return factor * quantity; // Multiplica por la cantidad
    }
    return quantity; // Si no hay coincidencia, usa quantity como fallback
  }
  
  module.exports = { calculatePieces };
  