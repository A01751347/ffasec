import React from 'react';
import UploadExcel from '../components/UploadExcel';

const UploadPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4">Subir Archivo Excel</h1>
      <UploadExcel />
    </div>
  );
};

export default UploadPage;
