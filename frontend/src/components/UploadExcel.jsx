// src/components/UploadExcel.jsx
import React, { useState } from 'react';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setMessage(result.message || 'Archivo subido correctamente.');
    } catch (error) {
      console.error(error);
      setMessage('Error al subir el archivo.');
    }
  };

  return (
    <div className="p-4 border rounded mb-8">
      <h2 className="text-2xl font-bold mb-4">Subir Archivo Excel</h2>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="mb-4"
      />
      <br />
      <button
        onClick={handleUpload}
        className="bg-green-500 text-white p-2 rounded"
      >
        Subir Archivo
      </button>
      {message && (
        <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default UploadExcel;
