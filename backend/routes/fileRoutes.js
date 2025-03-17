// fileRoutes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// GET /api/files -> listar archivos en `uploads`
router.get('/', fileController.getAllUploads);

// GET /api/files/download/:filename -> descargar un archivo
router.get('/download/:filename', fileController.downloadFile);

module.exports = router;
