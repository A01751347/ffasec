// src/FileList.jsx
import React, { useEffect, useState } from 'react';

function FileList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Hacemos fetch a nuestro backend
    fetch('/api/files')  // Ajusta la ruta si tu backend está en otro puerto o URL
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files || []);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Archivos en uploads:</h1>
      <ul>
        {files.map((fileName) => (
          <li key={fileName}>
            {/* Enlace para forzar descarga al hacer click */}
            <a href={`/api/files/download/${fileName}`} download>
              {fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileList;
