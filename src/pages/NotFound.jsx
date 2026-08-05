// ============================================================================
// NOT-FOUND.JSX - Página 404: Ruta no encontrada
// ============================================================================
// Se muestra cuando el usuario escribe una URL que no existe en la app
// o intenta acceder a una página que no está implementada aún.
// ============================================================================

import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Número grande 404 */}
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        
        {/* Mensaje */}
        <h2 className="text-2xl font-semibold text-gray-700 mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          La ruta que buscas no existe o no tienes permiso para verla.
        </p>
        
        {/* Botón para volver al inicio */}
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;