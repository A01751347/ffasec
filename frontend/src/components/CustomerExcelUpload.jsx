// frontend/src/components/CustomerExcelUpload.jsx
import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

const CustomerExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Función para manejar la selección de archivos
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Validar que sea un archivo Excel
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      setError('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
      setFile(null);
      setPreview(null);
      return;
    }
    
    // Limpiar estados previos
    setError(null);
    setResult(null);
    setFile(selectedFile);
    
    // Vista previa del archivo
    setPreview({
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
      type: selectedFile.type
    });
  };

  // Función para cargar el archivo al servidor
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero');
      return;
    }
    
    const formData = new FormData();
    formData.append('excelFile', file);
    
    setUploading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/upload/customers', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el archivo');
      }
      
      const data = await response.json();
      setResult(data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError(err.message || 'Ocurrió un error al procesar el archivo');
    } finally {
      setUploading(false);
    }
  };

  // Función para formatear el tamaño en bytes
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Función para reiniciar el formulario
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <FileText className="h-6 w-6 text-blue-400 mr-2" />
        Actualizar Clientes desde Excel
      </h2>
      
      {/* Instrucciones */}
      <div className="mb-6 bg-gray-700 p-4 rounded-lg text-gray-300">
        <h3 className="font-medium text-white mb-2">Instrucciones:</h3>
        <p className="mb-2">Para actualizar la tabla de clientes, sube un archivo Excel con las siguientes columnas:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Nombre del cliente</li>
          <li>Número de teléfono</li>
          <li>ID del cliente</li>
        </ol>
        <p className="mt-2 text-sm text-gray-400">
          Nota: Los clientes existentes se actualizarán según su ID. Los clientes nuevos serán añadidos a la tabla.
        </p>
      </div>
      
      {/* Formulario de carga */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="customer-excel-file"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer 
              ${error ? 'border-red-500 bg-red-900 bg-opacity-10' : 'border-gray-600 bg-gray-700 bg-opacity-30 hover:bg-gray-600'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-medium text-blue-400">Haz click para seleccionar</span> o arrastra un archivo Excel
              </p>
              <p className="text-xs text-gray-500">
                Formatos soportados: XLSX, XLS
              </p>
            </div>
            <input
              id="customer-excel-file"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      
      {/* Archivo seleccionado */}
      {preview && (
        <div className="mb-6 bg-blue-900 bg-opacity-20 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="text-blue-400 mr-2" />
              <div>
                <p className="text-white font-medium">{preview.name}</p>
                <p className="text-gray-400 text-sm">{preview.size}</p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={handleReset}
              disabled={uploading}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-900 bg-opacity-20 p-4 rounded-lg flex items-start">
          <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-300">{error}</p>
        </div>
      )}
      
      {/* Resultado */}
      {result && (
        <div className="mb-6 bg-green-900 bg-opacity-20 p-4 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="text-green-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-medium">¡Archivo procesado correctamente!</p>
              <p className="text-gray-300 mt-1">Resultados:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                <li>Clientes actualizados: {result.updated || 0}</li>
                <li>Clientes añadidos: {result.added || 0}</li>
                <li>Errores encontrados: {result.errors || 0}</li>
                <li>Total procesados: {result.total || 0}</li>
              </ul>
              {result.errorDetails && result.errorDetails.length > 0 && (
                <div className="mt-2">
                  <p className="text-yellow-300">Detalles de errores:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-gray-400 text-sm">
                    {result.errorDetails.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {result.errorDetails.length > 5 && (
                      <li>... y {result.errorDetails.length - 5} más</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Botón de carga */}
      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`
            flex items-center justify-center gap-2 px-6 py-2 rounded-lg shadow-lg
            ${!file || uploading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white transition-colors'
            }
          `}
        >
          {uploading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>Subir y Procesar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerExcelUpload;