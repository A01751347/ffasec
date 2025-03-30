// frontend/src/components/ErrorBoundary.jsx
import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capturar el error para mostrar detalles
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Registrar el error en un servicio de monitoreo (opcional)
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    // Intentar recuperar la aplicación
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Recargar la aplicación como último recurso
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
            <h1 className="text-3xl font-bold text-red-500 mb-4">
              Algo salió mal
            </h1>
            
            <p className="text-lg mb-6">
              Ha ocurrido un error inesperado en la aplicación. Nuestro equipo ha sido notificado.
            </p>
            
            <div className="bg-gray-900 p-4 rounded mb-6 overflow-auto max-h-80">
              <p className="text-red-400 font-mono">{this.state.error?.toString()}</p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                    Detalles técnicos
                  </summary>
                  <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
              >
                Volver a la página principal
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors"
              >
                Recargar aplicación
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;