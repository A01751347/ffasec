// fileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileController = require('../controllers/fileController');

// Configuración de multer para almacenar archivos
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Configurar almacenamiento con nombres de archivo seguros
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  }, 
  filename: (req, file, cb) => {
    // Crear nombre de archivo seguro: timestamp + nombre sanitizado
    const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeFilename = Date.now() + '-' + sanitizedFilename;
    cb(null, safeFilename);
  }
});

// Filtro para permitir solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, Excel, CSV y algunas imágenes.'), false);
  }
};

// Configurar multer con límites de tamaño
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  }
});

// GET /api/files -> listar archivos en `uploads`
router.get('/', fileController.getAllUploads);

// POST /api/files -> subir un archivo
router.post('/', upload.single('file'), fileController.uploadFile);

// GET /api/files/download/:filename -> descargar un archivo
router.get('/download/:filename', fileController.downloadFile);

module.exports = router;