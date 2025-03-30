// backend/utils/db.js
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');
require('dotenv').config();

// Crear pool de conexiones para usar promesas
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'facturas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Ejecuta una consulta SQL con promesas
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise} Promesa que resuelve con los resultados
 */
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    throw error;
  }
};

/**
 * Ejecuta múltiples consultas dentro de una transacción
 * @param {Function} callback - Función que recibe una conexión y realiza las consultas
 * @returns {Promise} Promesa que resuelve con el resultado del callback
 */
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Ejecutar el callback con la conexión
    const result = await callback(connection);
    
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Obtiene un solo registro
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise} Promesa que resuelve con un registro o null
 */
const getOne = async (sql, params = []) => {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Obtiene múltiples registros
 * @param {string} sql - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise} Promesa que resuelve con un array de registros
 */
const getMany = async (sql, params = []) => {
  return await query(sql, params);
};

/**
 * Inserta un registro
 * @param {string} table - Nombre de la tabla
 * @param {Object} data - Objeto con datos a insertar
 * @returns {Promise} Promesa que resuelve con el resultado de la inserción
 */
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await query(sql, values);
  
  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows
  };
};

/**
 * Actualiza registros
 * @param {string} table - Nombre de la tabla
 * @param {Object} data - Datos a actualizar
 * @param {Object} where - Condición WHERE { columna: valor }
 * @returns {Promise} Promesa que resuelve con el resultado de la actualización
 */
const update = async (table, data, where) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const result = await query(sql, [...values, ...whereValues]);
  
  return {
    affectedRows: result.affectedRows
  };
};

/**
 * Elimina registros
 * @param {string} table - Nombre de la tabla
 * @param {Object} where - Condición WHERE { columna: valor }
 * @returns {Promise} Promesa que resuelve con el resultado de la eliminación
 */
const remove = async (table, where) => {
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  const result = await query(sql, whereValues);
  
  return {
    affectedRows: result.affectedRows
  };
};

// Funciones para trabajar con la conexión original (no promesas)
// para mantener compatibilidad con código existente
const legacyDb = {
  query: (sql, params, callback) => {
    return dbConfig.query(sql, params, callback);
  },
  
  beginTransaction: (callback) => {
    return dbConfig.beginTransaction(callback);
  },
  
  commit: (callback) => {
    return dbConfig.commit(callback);
  },
  
  rollback: (callback) => {
    return dbConfig.rollback(callback);
  }
};

module.exports = {
  query,
  transaction,
  getOne,
  getMany,
  insert,
  update,
  remove,
  pool,
  legacyDb
};