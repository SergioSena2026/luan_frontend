// ============================================================================
// LOGIN.JSX - Pantalla de inicio de sesión
// ============================================================================
// Esta es la primera pantalla que ve un usuario no autenticado.
// Envía correo y contraseña al backend de Spring Boot y, si son correctos,
// guarda el token JWT en el AuthContext.
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  
  // -------------------------------------------------------------------------
  // ESTADOS LOCALES (useState)
  // -------------------------------------------------------------------------
  // Estos estados solo existen dentro de esta pantalla. No son globales.
  const [correo, setCorreo] = useState('');      // Guarda lo que escribe en el campo correo
  const [contrasena, setContrasena] = useState(''); // Guarda lo que escribe en el campo contraseña
  const [error, setError] = useState('');        // Guarda mensaje de error si el login falla
  const [cargando, setCargando] = useState(false); // true mientras espera respuesta del backend

  // -------------------------------------------------------------------------
  // HOOKS
  // -------------------------------------------------------------------------
  // useAuth() nos da acceso a la función login del AuthContext
  const { login } = useAuth();
  
  // useNavigate() nos permite redirigir después de un login exitoso
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // MANEJADOR DEL FORMULARIO (se ejecuta al hacer clic en "Iniciar Sesión")
  // -------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    // e.preventDefault() evita que el navegador recargue la página al enviar el formulario
    e.preventDefault();
    
    // Limpiamos errores anteriores
    setError('');
    
    // Validación básica en el frontend antes de llamar al backend
    if (!correo.trim() || !contrasena.trim()) {
      setError('Por favor ingresa correo y contraseña.');
      return;
    }

    // Activamos el estado de carga (deshabilita el botón y muestra spinner)
    setCargando(true);

    try {
      // ---------------------------------------------------------------------
      // LLAMADA AL BACKEND
      // ---------------------------------------------------------------------
      // La función login() del AuthContext internamente llama a authService.login(),
      // que hace el POST a /api/auth/login en tu Spring Boot.
      await login(correo, contrasena);
      
      // Si llegamos aquí, el login fue exitoso. Redirigimos al dashboard.
      // 'replace: true' evita que el usuario pueda volver al login con el botón atrás.
      navigate('/', { replace: true });
      
    } catch (err) {
      // ---------------------------------------------------------------------
      // MANEJO DE ERRORES
      // ---------------------------------------------------------------------
      // Si el backend devuelve 401 (no autorizado) o cualquier error,
      // mostramos un mensaje genérico. No revelamos si el correo existe o no.
      console.error('Error de login:', err);
      
      if (err.response?.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor. Intenta de nuevo.');
      }
    } finally {
      // Desactivamos el estado de carga, pase lo que pase
      setCargando(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------------------
  return (
    // Contenedor centrado vertical y horizontalmente, fondo gris
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      
      {/* Tarjeta blanca del formulario */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">🔧 Luan</h1>
          <p className="text-gray-500 mt-2">Gestor de Tickets de Reparación</p>
        </div>

        {/* Mensaje de error (solo se muestra si hay error) */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo: Correo */}
          <div>
            <label 
              htmlFor="correo" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@drboard.com"
              // disabled cuando está cargando para evitar doble envío
              disabled={cargando}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100"
              required
            />
          </div>

          {/* Campo: Contraseña */}
          <div>
            <label 
              htmlFor="contrasena" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              disabled={cargando}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100"
              required
            />
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={cargando}
            className={`
              w-full py-2.5 px-4 rounded-lg text-white font-medium transition-colors
              ${cargando 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Pie de página */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Proyecto Luan v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;