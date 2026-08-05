// ============================================================================
// DASHBOARD.JSX - Pantalla principal después del login
// ============================================================================
// Esta es la página de inicio que ve el usuario al entrar.
// Según la especificación, cada rol tiene su dashboard diferente, pero para
// el MVP empezamos con un dashboard unificado que muestra tarjetas según
// los roles del usuario logueado.
// 
// En sesiones futuras conectaremos esto con la API para mostrar datos reales:
// - Técnico: sus tickets asignados
// - Supervisor: alertas críticas y estado global
// - Recepcionista: acceso rápido a crear ticket y entregar equipo
// ============================================================================

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  
  // -------------------------------------------------------------------------
  // Obtenemos los datos del usuario logueado
  // -------------------------------------------------------------------------
  const { user, hasRole } = useAuth();

  // -------------------------------------------------------------------------
  // TARJETAS DEL DASHBOARD
  // -------------------------------------------------------------------------
  // Definimos qué tarjetas mostrar según el rol del usuario.
  // Cada tarjeta tiene un título, descripción, color e icono.
  const tarjetas = [];

  // Tarjeta para RECEPCIONISTA: Crear nuevo ticket
  if (hasRole('RECEPCIONISTA')) {
    tarjetas.push({
      titulo: 'Nuevo Ticket',
      descripcion: 'Registrar cliente, equipo y generar orden de reparación',
      icono: '🎫',
      color: 'bg-blue-500',
      ruta: '/nuevo-ticket'
    });
  }

  // Tarjeta para RECEPCIONISTA: Entrega de equipo
  if (hasRole('RECEPCIONISTA')) {
    tarjetas.push({
      titulo: 'Entrega de Equipo',
      descripcion: 'Procesar la entrega de equipos listos o cancelados',
      icono: '📦',
      color: 'bg-green-500',
      ruta: '/entrega-equipo'
    });
  }

  // Tarjeta para TECNICO: Ver mis tickets
  if (hasRole('TECNICO')) {
    tarjetas.push({
      titulo: 'Mis Tickets',
      descripcion: 'Ver tickets asignados y actualizar estados',
      icono: '🔧',
      color: 'bg-orange-500',
      ruta: '/dashboard-tecnico'
    });
  }

  // Tarjeta para SUPERVISOR: Dashboard global
  if (hasRole('SUPERVISOR')) {
    tarjetas.push({
      titulo: 'Supervisión Global',
      descripcion: 'Alertas críticas, reasignaciones y estado del taller',
      icono: '📊',
      color: 'bg-purple-500',
      ruta: '/dashboard-supervisor'
    });
  }

  // Tarjeta para ADMINISTRADOR: Gestión de usuarios
  if (hasRole('ADMINISTRADOR')) {
    tarjetas.push({
      titulo: 'Gestión de Usuarios',
      descripcion: 'Crear, editar y administrar personal del taller',
      icono: '👥',
      color: 'bg-gray-700',
      ruta: '/usuarios'
    });
  }

  // Tarjeta para ADMINISTRADOR: Configuración
  if (hasRole('ADMINISTRADOR')) {
    tarjetas.push({
      titulo: 'Configuración',
      descripcion: 'Ajustes del sistema (mock - Fase 2+)',
      icono: '⚙️',
      color: 'bg-gray-600',
      ruta: '/configuracion'
    });
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------------------
  return (
    <div>
      {/* Cabecera de bienvenida */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Bienvenido, {user?.nombre || 'Usuario'}
        </h2>
        <p className="text-gray-500 mt-1">
          Selecciona una opción para comenzar
        </p>
      </div>

      {/* Grid de tarjetas: 1 columna en móvil, 2 en tablet, 3 en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tarjetas.map((tarjeta, index) => (
          <Link
            key={index}
            to={tarjeta.ruta}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 group"
          >
            {/* Icono con fondo de color */}
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4
              ${tarjeta.color} text-white
            `}>
              {tarjeta.icono}
            </div>
            
            {/* Título */}
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {tarjeta.titulo}
            </h3>
            
            {/* Descripción */}
            <p className="text-sm text-gray-500 mt-2">
              {tarjeta.descripcion}
            </p>
          </Link>
        ))}
      </div>

      {/* Mensaje si no hay tarjetas (caso improbable pero seguro) */}
      {tarjetas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">
            No tienes acceso a ninguna función. Contacta al administrador.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;