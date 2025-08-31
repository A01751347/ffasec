// backend/controllers/customerUploadController.js
const xlsx = require('xlsx');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

/**
 * Procesa un archivo Excel de clientes y actualiza la base de datos
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.uploadCustomersExcel = async (req, res) => {
  // Verificar si se ha subido un archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }

  const filePath = req.file.path;
  console.log(`Procesando archivo Excel de clientes: ${filePath}`);

  try {
    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });

    // Verificar si hay datos
    if (!jsonData || jsonData.length === 0) {
      // Limpiar archivo
      fs.unlink(filePath, () => {});
      return res.status(400).json({ error: 'El archivo no contiene datos válidos' });
    }

    console.log(`Se encontraron ${jsonData.length} registros en el Excel`);

    // Inicializar contadores y registro de errores
    let updated = 0;
    let added = 0;
    let errors = 0;
    const errorDetails = [];

    // Iniciar transacción
    const connection = await db.promisePool.getConnection();
    await connection.beginTransaction();

    try {
      // Procesar cada fila del Excel
      for (const row of jsonData) {
        // Obtenemos las columnas en el orden específico
        const clientName = row['Nombre'] || null;
        const clientPhone = row['Teléfono'] || row['Telefono'] || null; // Aceptar ambas formas de escribir teléfono
        const clientId = row['ID'] || null;

        // Validar campos requeridos
        if (!clientName || !clientId) {
          errors++;
          errorDetails.push(`Fila con ID ${clientId || 'desconocido'}: Falta nombre o ID`);
          continue;
        }

        // Verificar si el cliente existe
        const [existingClients] = await connection.query(
          'SELECT id FROM Customers WHERE id = ?',
          [clientId]
        );

        if (existingClients.length > 0) {
          // Actualizar cliente existente
          try {
            await connection.query(
              'UPDATE Customers SET name = ?, phone = ? WHERE id = ?',
              [clientName, clientPhone || null, clientId]
            );
            updated++;
            console.log(`Cliente actualizado - ID: ${clientId}, Nombre: ${clientName}, Teléfono: ${clientPhone || 'No proporcionado'}`);
          } catch (err) {
            errors++;
            errorDetails.push(`Error al actualizar cliente ID ${clientId}: ${err.message}`);
          }
        } else {
          // Insertar nuevo cliente
          try {
            await connection.query(
              'INSERT INTO Customers (id, name, phone) VALUES (?, ?, ?)',
              [clientId, clientName, clientPhone || null]
            );
            added++;
            console.log(`Cliente añadido - ID: ${clientId}, Nombre: ${clientName}, Teléfono: ${clientPhone || 'No proporcionado'}`);
          } catch (err) {
            errors++;
            errorDetails.push(`Error al añadir cliente ID ${clientId}: ${err.message}`);
          }
        }
      }

      // Confirmar transacción
      await connection.commit();
      console.log(`Procesamiento completado: ${updated} actualizados, ${added} añadidos, ${errors} errores`);

      // Respuesta exitosa
      res.json({
        message: 'Archivo procesado correctamente',
        total: jsonData.length,
        updated,
        added,
        errors,
        errorDetails
      });
    } catch (err) {
      // Revertir en caso de error
      await connection.rollback();
      console.error('Error en la transacción:', err);
      throw err;
    } finally {
      // Liberar conexión
      connection.release();
      
      // Limpiar el archivo temporal
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error al eliminar archivo temporal: ${err.message}`);
      });
    }
  } catch (err) {
    console.error('Error al procesar el archivo Excel:', err);
    
    // Limpiar archivo en caso de error
    fs.unlink(filePath, () => {});
    
    res.status(500).json({
      error: 'Error al procesar el archivo Excel',
      details: err.message
    });
  }
};

/**
 * Verifica la estructura de la base de datos para asegurar que existan
 * todos los campos necesarios en la tabla Customers
 */
exports.checkCustomersTable = async (req, res) => {
  try {
    const connection = await db.promisePool.getConnection();
    
    try {
      // Verificar si existe la tabla Customers
      const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Customers'`,
        [process.env.DB_DATABASE]
      );
      
      if (tables.length === 0) {
        connection.release();
        return res.status(404).json({ 
          error: 'La tabla Customers no existe',
          needsSetup: true
        });
      }
      
      // Verificar columnas
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Customers'`,
        [process.env.DB_DATABASE]
      );
      
      const columnNames = columns.map(col => col.COLUMN_NAME.toLowerCase());
      const hasIdColumn = columnNames.includes('id');
      const hasNameColumn = columnNames.includes('name');
      const hasPhoneColumn = columnNames.includes('phone');
      
      connection.release();
      
      if (!hasIdColumn || !hasNameColumn) {
        return res.status(400).json({ 
          error: 'La tabla Customers no tiene las columnas requeridas (id, name)',
          needsSetup: true,
          currentColumns: columnNames
        });
      } 
      
      // Si falta la columna phone, podemos intentar añadirla
      if (!hasPhoneColumn) {
        try {
          await db.query(
            `ALTER TABLE Customers ADD COLUMN phone VARCHAR(20) NULL`
          );
          console.log('Columna phone añadida a la tabla Customers');
        } catch (alterErr) {
          console.error('Error al añadir columna phone:', alterErr);
          return res.status(400).json({ 
            error: 'No se pudo añadir la columna phone a la tabla Customers',
            details: alterErr.message
          });
        }
      }
      
      return res.json({ 
        success: true,
        message: 'La tabla Customers está lista para la importación',
        columns: columnNames
      });
    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error('Error al verificar la tabla Customers:', err);
    res.status(500).json({ 
      error: 'Error al verificar la estructura de la base de datos',
      details: err.message
    });
  }
};

/**
 * Configuración de la tabla Customers si no existe o necesita modificaciones
 */
exports.setupCustomersTable = async (req, res) => {
  try {
    const connection = await db.promisePool.getConnection();
    
    try {
      // Verificar si existe la tabla Customers
      const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Customers'`,
        [process.env.DB_DATABASE]
      );
      
      if (tables.length === 0) {
        // Crear la tabla si no existe
        await connection.query(`
          CREATE TABLE Customers (
            id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            PRIMARY KEY (id)
          )
        `);
        
        connection.release();
        return res.json({ 
          success: true,
          message: 'Tabla Customers creada correctamente'
        });
      }
      
      // Verificar columnas existentes
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Customers'`,
        [process.env.DB_DATABASE]
      );
      
      const columnNames = columns.map(col => col.COLUMN_NAME.toLowerCase());
      
      // Añadir columnas faltantes
      const missingColumns = [];
      
      if (!columnNames.includes('id')) {
        missingColumns.push(`ADD COLUMN id INT NOT NULL, ADD PRIMARY KEY (id)`);
      }
      
      if (!columnNames.includes('name')) {
        missingColumns.push(`ADD COLUMN name VARCHAR(255) NOT NULL`);
      }
      
      if (!columnNames.includes('phone')) {
        missingColumns.push(`ADD COLUMN phone VARCHAR(20)`);
      }
      
      if (missingColumns.length > 0) {
        // Aplicar modificaciones
        const alterQuery = `ALTER TABLE Customers ${missingColumns.join(', ')}`;
        await connection.query(alterQuery);
      }
      
      connection.release();
      return res.json({ 
        success: true,
        message: 'Tabla Customers configurada correctamente',
        columnsAdded: missingColumns.length
      });
    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error('Error al configurar la tabla Customers:', err);
    res.status(500).json({ 
      error: 'Error al configurar la estructura de la base de datos',
      details: err.message
    });
  }
};