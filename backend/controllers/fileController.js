// fileController.js
const fs = require('fs');
const path = require('path');

/**
 * Listar todos los archivos en /uploads
 */
exports.getAllUploads = (req, res) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error(err);
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
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);

  // Verificamos si el archivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  // Forzamos la descarga con res.download
  return res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al descargar el archivo' });
    }
  });
};
