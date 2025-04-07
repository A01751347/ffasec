// frontend/src/pages/CustomerUploadPage.jsx (mejorado)
import React, { useState, useEffect } from 'react';
import { Settings, Database, AlertTriangle } from 'lucide-react';
import CustomerExcelUpload from '../components/CustomerExcelUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { customerUploadService } from '../services/customerUploadService';
import { useAppContext } from '../context/AppContext';

const CustomerUploadPage = () => {
  const { showNotification } = useAppContext();
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const [setupResult, setSetupResult] = useState(null);
  const [error, setError] = useState(null);

  // Verificar estructura de la base de datos al cargar la página
  useEffect(() => {
    checkDatabaseStructure();
  }, []);

  // Función para verificar la estructura de la BD
  const checkDatabaseStructure = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerUploadService.checkStructure();
      
      if (response.success) {
        setDbStatus(response.data);
        setSetupNeeded(false);
      } else {
        console.warn('Respuesta no OK de la API:', response.error);
        setDbStatus(response.data);
        setSetupNeeded(response.data?.needsSetup || false);
      }
    } catch (err) {
      console.error('Error al verificar estructura de BD:', err);
      setError('Error al comunicarse con el servidor. Verifica tu conexión.');
      showNotification('Error al verificar la estructura de la base de datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para configurar la tabla
  const setupTable = async () => {
    try {
      setSetupInProgress(true);
      setError(null);
      setSetupResult(null);

      const response = await customerUploadService.setupTable();
      
      if (response.success) {
        setSetupResult(response.data);
        setSetupNeeded(false);
        showNotification('Tabla configurada correctamente', 'success');
        // Verificar estructura nuevamente para actualizarla
        await checkDatabaseStructure();
      } else {
        setError(response.error || 'No se pudo configurar la tabla');
        setSetupResult({
          success: false,
          message: response.error
        });
        showNotification('Error al configurar la tabla: ' + response.error, 'error');
      }
    } catch (err) {
      console.error('Error al configurar tabla:', err);
      setError('Error al comunicarse con el servidor. Verifica tu conexión.');
      showNotification('Error al configurar la tabla', 'error');
    } finally {
      setSetupInProgress(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Actualización de Clientes</h1>
        <p className="text-gray-400">Importa datos de clientes desde un archivo Excel</p>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center my-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error general */}
      {error && !loading && (
        <div className="bg-red-900 bg-opacity-50 text-white p-4 rounded-lg mb-6 flex items-start gap-2">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Configuración de BD requerida */}
      {setupNeeded && !loading && (
        <div className="bg-yellow-900 bg-opacity-50 text-white p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <Database className="text-yellow-400 mr-2" />
            Configuración de base de datos requerida
          </h2>
          <p className="mb-4">
            Se necesita configurar la tabla de clientes antes de poder importar datos.
            {dbStatus?.error && (
              <span className="block mt-2 text-yellow-300">
                {dbStatus.error}
              </span>
            )}
          </p>
          <button
            onClick={setupTable}
            disabled={setupInProgress}
            className={`
              flex items-center px-4 py-2 rounded
              ${setupInProgress
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }
            `}
          >
            {setupInProgress ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Configurando...
              </>
            ) : (
              <>
                <Settings className="mr-2" size={18} />
                Configurar tabla automáticamente
              </>
            )}
          </button>

          {/* Resultado de configuración */}
          {setupResult && (
            <div className={`mt-4 p-3 rounded ${
              setupResult.success ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'
            }`}>
              <p>{setupResult.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Componente de carga de Excel */}
      {!setupNeeded && !loading && (
        <CustomerExcelUpload />
      )}
    </div>
  ); 
};

export default CustomerUploadPage;