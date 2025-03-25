// fileController.js
const fs = require('fs');
const path = require('path');

// Función para sanitizar nombres de archivo y prevenir path traversal
const sanitizeFileName = (fileName) => {
  // Eliminar caracteres no seguros y obtener solo el nombre base del archivo
  return path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, '');
};

/**
 * Listar todos los archivos en /uploads
 */
exports.getAllUploads = (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error leyendo la carpeta uploads:', err);
      return res.status(500).json({ error: 'Error leyendo la carpeta uploads' });
    }
    // Devolvemos un JSON con un array de nombres de archivos
    return res.json({ files });
  });
};

/**
 * Descargar un archivo en /uploads según su nombre
 */
exports.downloadFile = (req, res) => {
  // Sanitizamos el nombre del archivo para prevenir path traversal
  const fileName = sanitizeFileName(req.params.filename);
  
  if (!fileName) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' });
  }
  
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  // Verificamos si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  // Forzamos la descarga con res.download
  return res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      return res.status(500).json({ error: 'Error al descargar el archivo' });
    }
  });
};

/**
 * Subir un archivo a la carpeta /uploads
 */
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  }
  
  // Devolvemos información sobre el archivo subido
  return res.json({ 
    message: 'Archivo subido correctamente',
    fileName: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
};