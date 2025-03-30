// uploadController.js
const xlsx = require('xlsx');
const db = require('../config/db');
const { convertDate } = require('../utils/dateUtils');
const { calculatePieces } = require('../utils/calculatePieces');
const fs = require('fs');
const path = require('path');

exports.uploadExcel = (req, res) => {
  if (!req.file) {
    console.error("No se ha recibido ningún archivo.");
    return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
  }
  
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
    
    // Verificar si hay datos
    if (!jsonData || jsonData.length === 0) {
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
    
    // Procesar cada grupo
    for (const orderNum in ordersGrouped) {
      try {
        const group = ordersGrouped[orderNum];
        const orderHeader = group[0];
        const orderDate = convertDate(orderHeader['fecha']);
        
        // Insertar en Customers
        db.query(
          `INSERT IGNORE INTO Customers (id, name) VALUES (?, ?)`,
          [orderHeader['idcliente'], orderHeader['clientebis']],
          (customerErr) => {
            if (customerErr) {
              errors.push(`Error al insertar cliente para la orden ${orderNum}: ${customerErr.message}`);
              return;
            }
            
            // Insertar en Orders
            db.query(
              `INSERT INTO Orders (number, ticket, total, date, id) VALUES (?, ?, ?, ?, ?)`,
              [orderHeader['num'], orderHeader['numero'], orderHeader['total'], orderDate, orderHeader['idcliente']],
              (orderErr) => {
                if (orderErr) {
                  errors.push(`Error al insertar orden ${orderNum}: ${orderErr.message}`);
                  return;
                }
                
                // Insertar en OrderDetails (incluyendo la fecha)
                const detailsRows = group.length > 2 ? group.slice(1, -1) : group.slice(1);
                let detailsProcessed = 0;
                
                detailsRows.forEach(row => {
                  const pieces = calculatePieces(row['descripcio'], row['cantidad']);
                  
                  db.query(
                    `INSERT INTO OrderDetails (number, process, description, pieces, quantity, date, price) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [row['num'], row['proceso'], row['descripcio'], pieces, row['cantidad'], orderDate, row['nimplinea']],
                    (detailErr) => {
                      if (detailErr) {
                        errors.push(`Error al insertar detalle para la orden ${orderNum}: ${detailErr.message}`);
                      }
                      
                      detailsProcessed++;
                      
                      // Si todos los detalles fueron procesados, incrementamos el contador de órdenes exitosas
                      if (detailsProcessed === detailsRows.length) {
                        successCount++;
                        
                        // Si todas las órdenes fueron procesadas, enviamos la respuesta
                        if (successCount + errors.length === totalOrders) {
                          const response = {
                            message: `Archivo procesado: ${successCount} órdenes migradas correctamente.`,
                            total: totalOrders,
                            success: successCount
                          };
                          
                          if (errors.length > 0) {
                            response.errors = errors;
                            response.message += ` Se encontraron ${errors.length} errores.`;
                          }
                          
                          res.json(response);
                        }
                      }
                    }
                  );
                });
                
                // Si no hay detalles para esta orden
                if (detailsRows.length === 0) {
                  successCount++;
                  if (successCount + errors.length === totalOrders) {
                    const response = {
                      message: `Archivo procesado: ${successCount} órdenes migradas correctamente.`,
                      total: totalOrders,
                      success: successCount
                    };
                    
                    if (errors.length > 0) {
                      response.errors = errors;
                      response.message += ` Se encontraron ${errors.length} errores.`;
                    }
                    
                    res.json(response);
                  }
                }
              }
            );
          }
        );
      } catch (groupError) {
        errors.push(`Error al procesar el grupo ${orderNum}: ${groupError.message}`);
      }
    }
    
    // Si no hay órdenes para procesar
    if (totalOrders === 0) {
      res.json({ message: 'El archivo no contiene órdenes para procesar.' });
    }
    
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ 
      error: 'Error al procesar el archivo Excel', 
      details: error.message 
    });
  }
};