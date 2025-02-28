import React, { useState } from 'react';
import { motion } from 'framer-motion';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      setError(true);
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch('http://localhost:5002/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setMessage(result.message || 'Archivo subido correctamente.');
      setError(false);
    } catch (error) {
      console.error(error);
      setMessage('Error al subir el archivo.');
      setError(true);
    }
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 text-gray-100 w-full "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-lg font-medium mb-4">Subir Archivo Excel</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="mb-4 w-full p-2 border border-gray-600 rounded bg-gray-900 text-gray-200"
      />
      <button
        onClick={handleUpload}
        className="w-full bg-violet-700 text-white py-2 rounded-md hover:bg-violet-600 transition-all duration-200"
      >
        Subir Archivo
      </button>
      {message && (
        <motion.p
          className={`mt-4 text-center text-sm ${error ? 'text-red-400' : 'text-green-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default UploadExcel;
