// backend/utils/sqlHelper.js
const db = require('../config/db');

/**
 * Ejecuta una consulta SQL parametrizada de forma segura
 * @param {string} query - Consulta SQL con placeholders (?)
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise} - Promesa que resuelve con los resultados
 */
const executeQuery = (query, params = []) => {
  return db.query(query, params);
};

/**
 * Obtiene un solo registro de la base de datos
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros
 * @returns {Promise} - Promesa que resuelve con un solo registro o null
 */ 
const getOne = async (query, params = []) => {
  const results = await executeQuery(query, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Obtiene múltiples registros de la base de datos
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros
 * @returns {Promise} - Promesa que resuelve con un array de registros
 */
const getMany = async (query, params = []) => {
  return await executeQuery(query, params);
};

/**
 * Inserta un registro en la base de datos
 * @param {string} table - Nombre de la tabla
 * @param {Object} data - Datos a insertar
 * @returns {Promise} - Promesa que resuelve con el resultado de la inserción
 */
const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  return await executeQuery(query, values);
};

/**
 * Actualiza un registro en la base de datos
 * @param {string} table - Nombre de la tabla
 * @param {Object} data - Datos a actualizar
 * @param {Object} where - Condición WHERE { columna: valor }
 * @returns {Promise} - Promesa que resuelve con el resultado de la actualización
 */
const update = async (table, data, where) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  return await executeQuery(query, [...values, ...whereValues]);
};

/**
 * Elimina registros de la base de datos
 * @param {string} table - Nombre de la tabla
 * @param {Object} where - Condición WHERE { columna: valor }
 * @returns {Promise} - Promesa que resuelve con el resultado de la eliminación
 */
const remove = async (table, where) => {
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  return await executeQuery(query, whereValues);
};

module.exports = {
  executeQuery,
  getOne,
  getMany,
  insert,
  update,
  remove
};