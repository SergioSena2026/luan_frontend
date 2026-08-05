// ============================================================================
// STAFF-LAYOUT.JSX - Estructura visual para el personal del taller
// ============================================================================
// Este componente envuelve TODAS las pantallas del staff autenticado.
// Tiene dos partes:
//   1. Sidebar (barra lateral izquierda): Menú de navegación que cambia
//      según los roles del usuario logueado.
//   2. Main (área principal derecha): Aquí se renderiza la página actual.
// 
// La consulta pública NO usa este layout. Tiene su propio layout limpio.
// ============================================================================

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StaffLayout = ({ children }) => {
  
  // -------------------------------------------------------------------------
  // HOOKS DE REACT ROUTER
  // -------------------------------------------------------------------------
  // useLocation() nos dice en qué ruta estamos ahora mismo.
  // Lo usamos para resaltar la opción activa del menú.
  const location = useLocation();
  
  // useNavigate() nos permite redirigir programáticamente (ej: después de logout).
  const navigate = useNavigate();

  // -------------------------------------------------------------------------
  // DATOS DE SESIÓN DESDE EL AUTHCONTEXT
  // -------------------------------------------------------------------------
  const { user, logout, hasAnyRole } = useAuth();

  // -------------------------------------------------------------------------
  // FUNCIÓN LOGOUT
  // -------------------------------------------------------------------------
  // Cierra la sesión y redirige al login. 
  // 'replace' evita que el usuario pueda volver atrás al dashboard.
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // -------------------------------------------------------------------------
  // DEFINICIÓN DEL MENÚ POR ROL
  // -------------------------------------------------------------------------
  // Cada opción del menú tiene:
  //   - path: La ruta URL (ej: "/nuevo-ticket")
  //   - label: El texto que se muestra en el sidebar
  //   - icon: Un emoji simple como icono (en fases futuras podemos usar iconos SVG)
  //   - roles: Array de roles que pueden ver esta opción
  // 
  // NOTA: Según la especificación, el supervisor solo ve ciertas opciones
  // si tiene también el rol adicional correspondiente. Por eso validamos
  // con hasAnyRole() que revisa los roles reales del usuario.
  const menuItems = [
    {
      path: '/',
      label: 'Inicio',
      icon: '🏠',
      roles: ['RECEPCIONISTA', 'TECNICO', 'SUPERVISOR', 'ADMINISTRADOR']
    },
    {
      path: '/nuevo-ticket',
      label: 'Nuevo Ticket',
      icon: '🎫',
      roles: ['RECEPCIONISTA', 'SUPERVISOR'] // Supervisor solo si tiene rol Recepcionista adicional
    },
    {
      path: '/dashboard-tecnico',
      label: 'Dashboard Técnico',
      icon: '🔧',
      roles: ['TECNICO', 'SUPERVISOR'] // Supervisor solo si tiene rol Técnico adicional
    },
    {
      path: '/dashboard-supervisor',
      label: 'Dashboard Supervisor',
      icon: '📊',
      roles: ['SUPERVISOR']
    },
    {
      path: '/entrega-equipo',
      label: 'Entrega de Equipo',
      icon: '📦',
      roles: ['RECEPCIONISTA', 'SUPERVISOR'] // Supervisor solo si tiene rol Recepcionista adicional
    },
    {
      path: '/usuarios',
      label: 'Gestión de Usuarios',
      icon: '👥',
      roles: ['ADMINISTRADOR']
    },
    {
      path: '/configuracion',
      label: 'Configuración',
      icon: '⚙️',
      roles: ['ADMINISTRADOR']
    }
  ];

  // -------------------------------------------------------------------------
  // FILTRAR MENÚ: Solo mostrar opciones que el usuario puede ver
  // -------------------------------------------------------------------------
  // Recorremos el array de menú y nos quedamos solo con las que el usuario
  // tiene permiso según sus roles.
  const visibleMenuItems = menuItems.filter(item => 
    hasAnyRole(item.roles)
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------------------
  return (
    // Contenedor principal: altura mínima de toda la pantalla, fondo gris
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* ==================================================================
          SIDEBAR (Barra lateral izquierda)
          ================================================================== */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        
        {/* -----------------------------------------------------------
            CABECERA DEL SIDEBAR: Logo y nombre del proyecto
            ----------------------------------------------------------- */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">🔧 Luan</h1>
          <p className="text-xs text-gray-500 mt-1">Gestor de Tickets</p>
        </div>

        {/* -----------------------------------------------------------
            INFORMACIÓN DEL USUARIO LOGUEADO
            ----------------------------------------------------------- */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm font-semibold text-gray-800">
            {user?.nombre || 'Usuario'}
          </p>
          <p className="text-xs text-gray-500">
            {/* Mostramos los roles separados por coma, traducidos a español */}
            {user?.roles?.map(rol => {
              const traducciones = {
                'RECEPCIONISTA': 'Recepcionista',
                'TECNICO': 'Técnico',
                'SUPERVISOR': 'Supervisor',
                'ADMINISTRADOR': 'Administrador'
              };
              return traducciones[rol] || rol;
            }).join(', ')}
          </p>
        </div>

        {/* -----------------------------------------------------------
            MENÚ DE NAVEGACIÓN
            ----------------------------------------------------------- */}
        <nav className="flex-1 p-4 space-y-1">
          {visibleMenuItems.map(item => {
            // Determinamos si esta opción está activa (coincide con la URL actual)
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* -----------------------------------------------------------
            BOTÓN DE CERRAR SESIÓN (al final del sidebar)
            ----------------------------------------------------------- */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="mr-2">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ==================================================================
          ÁREA PRINCIPAL (derecha)
          ================================================================== */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Aquí se renderiza la página actual que este layout envuelve */}
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;