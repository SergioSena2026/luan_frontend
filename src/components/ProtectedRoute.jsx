// ============================================================================
// PROTECTED-ROUTE.JSX - Guardián de las rutas privadas
// ============================================================================
// Este componente envuelve a las páginas que requieren autenticación.
// Antes de mostrar la página, pregunta: "¿Hay alguien logueado?"
// 
// Si SÍ hay usuario logueado → Muestra la página normalmente.
// Si NO hay usuario logueado → Redirige automáticamente al login.
// 
// Uso en React Router: <Route element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente ProtectedRoute
 * @param {Object} props - Propiedades de React
 * @param {ReactNode} props.children - La página que queremos proteger
 * @param {string[]} props.allowedRoles - (Opcional) Lista de roles permitidos
 *                                        Ej: ['ADMINISTRADOR', 'SUPERVISOR']
 *                                        Si no se pasa, cualquier usuario logueado entra.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  
  // -------------------------------------------------------------------------
  // Obtenemos los datos de sesión desde el AuthContext
  // -------------------------------------------------------------------------
  // 'user' es null si no hay nadie logueado.
  // 'loading' es true mientras revisa el localStorage al arrancar.
  const { user, loading } = useAuth();

  // -------------------------------------------------------------------------
  // Si aún está cargando la sesión, no decidimos nada todavía.
  // Esto evita que un usuario con sesión guardada vea el login por un instante.
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Verificando sesión...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // CASO 1: No hay usuario logueado → MANDAR AL LOGIN
  // -------------------------------------------------------------------------
  // Navigate es un componente de React Router que redirige a otra ruta.
  // 'replace' evita que el usuario pueda volver atrás con el botón del navegador.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // -------------------------------------------------------------------------
  // CASO 2: Se pidieron roles específicos y el usuario no los tiene
  // -------------------------------------------------------------------------
  // Ejemplo: una página solo para ADMINISTRADOR, pero el usuario es TECNICO.
  // En ese caso lo mandamos a su dashboard principal sin mostrarle error.
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => user.roles.includes(role));
    
    if (!hasAllowedRole) {
      // El usuario está logueado pero no tiene permiso para esta página.
      // Según la especificación: "se redirige a su dashboard principal
      // sin mostrar opciones bloqueadas". No mostramos mensaje de "no tienes permiso".
      return <Navigate to="/" replace />;
    }
  }

  // -------------------------------------------------------------------------
  // CASO 3: Todo bien → MOSTRAR LA PÁGINA
  // -------------------------------------------------------------------------
  // 'children' es la página que este componente envuelve (Dashboard, NuevoTicket, etc.)
  return children;
};

export default ProtectedRoute;