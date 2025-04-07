// uploadController.js
const xlsx = require('xlsx');
const db = require('../config/db');
const { convertDate } = require('../utils/dateUtils');
const { calculatePieces } = require('../utils/calculatePieces');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

/**
 * Verifica si el archivo es un Excel válido
 * @param {string} filePath - Ruta del archivo
 * @returns {boolean} - true si es válido, false si no
 */
const isValidExcelFile = (filePath) => {
  try {
    // Verificar el tipo MIME
    const mimeType = mime.lookup(filePath);
    const validMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ];
    
    if (!validMimeTypes.includes(mimeType)) {
      return false;
    } 
    
    // Intentar leer el archivo como Excel
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    return workbook && workbook.SheetNames && workbook.SheetNames.length > 0;
  } catch (error) {
    console.error("Error al validar archivo Excel:", error);
    return false;
  }
};

/**
 * Procesa una orden a partir de los datos del Excel
 * @param {Object} orderHeader - Datos de la cabecera de la orden
 * @param {Array} detailsRows - Filas de detalles de la orden
 * @returns {Promise} - Promesa que resuelve cuando se ha procesado la orden
 */
const processOrder = async (orderHeader, detailsRows) => {
  // Iniciar transacción
  const connection = await db.promisePool.getConnection();
  await connection.beginTransaction();
  
  try {
    const orderDate = convertDate(orderHeader['fecha']);
    
    // Insertar cliente (si no existe)
    await connection.query(
      `INSERT IGNORE INTO Customers (id, name) VALUES (?, ?)`,
      [orderHeader['idcliente'], orderHeader['clientebis']]
    );
    
    // Insertar orden
    await connection.query(
      `INSERT INTO Orders (number, ticket, total, date, id) VALUES (?, ?, ?, ?, ?)`,
      [orderHeader['num'], orderHeader['numero'], orderHeader['total'], orderDate, orderHeader['idcliente']]
    );
    
    // Insertar detalles
    for (const row of detailsRows) {
      const pieces = calculatePieces(row['descripcio'], row['cantidad']);
      
      await connection.query(
        `INSERT INTO OrderDetails (number, process, description, pieces, quantity, date, price) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [row['num'], row['proceso'], row['descripcio'], pieces, row['cantidad'], orderDate, row['nimplinea']]
      );
    }
    
    // Confirmar transacción
    await connection.commit();
    connection.release();
    
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    connection.release();
    throw error;
  }
};

exports.uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
  }
  
  const filePath = req.file.path;
  
  // Verificar que el archivo es un Excel válido
  if (!isValidExcelFile(filePath)) {
    // Eliminar el archivo si no es válido
    fs.unlink(filePath, () => {});
    return res.status(400).json({ error: 'El archivo no es un Excel válido.' });
  }
  
  try {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    
    // Verificar si hay datos
    if (!jsonData || jsonData.length === 0) {
      // Limpiar archivo
      fs.unlink(filePath, () => {});
      return res.status(400).json({ error: 'El archivo no contiene datos válidos.' });
    }
    
    // Agrupar datos por 'num' (número de orden)
    const ordersGrouped = jsonData.reduce((acc, row) => {
      const orderNum = row['num'];
      if (!acc[orderNum]) acc[orderNum] = [];
      acc[orderNum].push(row);
      return acc;
    }, {});
    
    // Contador para operaciones exitosas
    let successCount = 0;
    const totalOrders = Object.keys(ordersGrouped).length;
    const errors = [];
    const processedOrders = [];
    
    // Procesar cada grupo
    for (const orderNum in ordersGrouped) {
      try {
        const group = ordersGrouped[orderNum];
        const orderHeader = group[0];
        const detailsRows = group.length > 2 ? group.slice(1, -1) : group.slice(1);
        
        await processOrder(orderHeader, detailsRows);
        
        // Registrar orden procesada
        processedOrders.push(orderNum);
        successCount++;
      } catch (error) {
        errors.push(`Error al procesar la orden ${orderNum}: ${error.message}`);
      }
    }
    
    // Limpiar el archivo después de procesarlo
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar archivo temporal:", err);
    });
    
    // Preparar respuesta
    const response = {
      message: `Archivo procesado: ${successCount} órdenes migradas correctamente.`,
      total: totalOrders,
      success: successCount,
      processedOrders
    };
    
    if (errors.length > 0) {
      response.errors = errors;
      response.message += ` Se encontraron ${errors.length} errores.`;
    }
    
    return res.json(response);
    
  } catch (error) {
    // Limpiar el archivo en caso de error
    fs.unlink(filePath, () => {});
    
    console.error('Error al procesar el archivo Excel:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el archivo Excel', 
      details: error.message 
    });
  }
};