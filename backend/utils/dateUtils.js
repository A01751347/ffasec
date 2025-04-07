// Función para convertir fechas del formato 'DD-MMM-YY' a 'YYYY-MM-DD'
function convertDate(dateStr) {
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return dateStr; // Si no se ajusta al formato esperado, retorna tal cual
    }
    let [day, mon, year] = parts;
    day = day.padStart(2, '0');
    mon = months[mon] || mon;
    if (year.length === 2) {
      year = '20' + year; // Asume siglo 21
    }
    return `${year}-${mon}-${day}`;
  }
   
  module.exports = { convertDate };
  