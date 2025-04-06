// backend/routes/customerUploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const customerUploadController = require('../controllers/customerUploadController');

// Configuración de multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Guardar en la carpeta uploads
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre seguro: timestamp + nombre original sanitizado
    const timestamp = Date.now();
    const originalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9_.-]/g, '');
    const safeFilename = `customers_${timestamp}_${originalName}`;
    cb(null, safeFilename);
  }
});

// Filtro para permitir solo archivos Excel
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

// Configurar multer con límites y filtros
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Ruta para verificar la estructura de la tabla Customers
router.get('/check-structure', customerUploadController.checkCustomersTable);

// Ruta para configurar la tabla Customers si es necesario
router.post('/setup-table', customerUploadController.setupCustomersTable);

// Ruta para procesar archivo Excel de clientes
router.post('/customers', upload.single('excelFile'), customerUploadController.uploadCustomersExcel);

module.exports = router;