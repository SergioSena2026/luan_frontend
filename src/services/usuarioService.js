// ============================================================================
// USUARIO-SERVICE.JS - Comunicación con el backend para usuarios (staff)
// ============================================================================
// Funciones para gestionar el personal del taller: crear, editar, listar,
// cambiar estado laboral, restablecer contraseña, y filtrar técnicos disponibles.
// 
// Endpoints consumidos:
//   POST   /api/usuarios?roles=ROL1,ROL2         → Crear usuario
//   GET    /api/usuarios                         → Listar usuarios activos
//   GET    /api/usuarios/{id}                    → Buscar usuario por ID
//   PUT    /api/usuarios/{id}                    → Actualizar usuario
//   PUT    /api/usuarios/{id}?roles=ROL1         → Actualizar con roles
//   POST   /api/usuarios/{id}/restablecer-contrasena
//        → Genera contraseña temporal
//   PUT    /api/usuarios/{id}/estado-laboral?nuevoEstado=DISPONIBLE
//        → Cambiar estado laboral
//   DELETE /api/usuarios/{id}                    → Eliminar usuario (lógico)
// ============================================================================

import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

/**
 * Obtiene el token JWT del localStorage.
 */
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || localStorage.getItem('token');
};

/**
 * Configuración con header Authorization para peticiones protegidas.
 */
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// ---------------------------------------------------------------------------
// 1. CREAR USUARIO
// ---------------------------------------------------------------------------
// Solo el ADMINISTRADOR puede hacer esto.
// roles es un array de strings: ['TECNICO', 'RECEPCIONISTA']
const crearUsuario = async (usuarioData, roles) => {
  const response = await axios.post(
    `${API_URL}/usuarios`,
    usuarioData,
    {
      ...authConfig(),
      params: { roles: roles.join(',') } // Convierte array a string separado por comas
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 2. LISTAR USUARIOS ACTIVOS
// ---------------------------------------------------------------------------
// Devuelve solo usuarios no eliminados (eliminar es lógico, no físico).
// Se usa en la pantalla de Gestión de Usuarios.
const listarUsuarios = async () => {
  const response = await axios.get(
    `${API_URL}/usuarios`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 3. BUSCAR USUARIO POR ID
// ---------------------------------------------------------------------------
const buscarUsuarioPorId = async (id) => {
  const response = await axios.get(
    `${API_URL}/usuarios/${id}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 4. ACTUALIZAR USUARIO
// ---------------------------------------------------------------------------
// Puede incluir actualización de roles opcionalmente.
const actualizarUsuario = async (id, usuarioData, roles = null) => {
  const config = { ...authConfig() };
  if (roles) {
    config.params = { roles: roles.join(',') };
  }

  const response = await axios.put(
    `${API_URL}/usuarios/${id}`,
    usuarioData,
    config
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 5. RESTABLECER CONTRASEÑA
// ---------------------------------------------------------------------------
// Genera una contraseña temporal. El usuario debe cambiarla al primer login.
const restablecerContrasena = async (id) => {
  const response = await axios.post(
    `${API_URL}/usuarios/${id}/restablecer-contrasena`,
    null,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 6. CAMBIAR ESTADO LABORAL
// ---------------------------------------------------------------------------
// Estados posibles: DISPONIBLE, AUSENTE, VACACIONES, INCAPACITADO, FUERA_DE_JORNADA
// Usado por el supervisor o administrador.
const cambiarEstadoLaboral = async (id, nuevoEstado) => {
  const response = await axios.put(
    `${API_URL}/usuarios/${id}/estado-laboral`,
    null,
    {
      ...authConfig(),
      params: { nuevoEstado }
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 7. ELIMINAR USUARIO (BORRADO LÓGICO)
// ---------------------------------------------------------------------------
// No se borra de la BD. El campo 'eliminado' pasa a true.
// El usuario no puede hacer login pero su nombre permanece en tickets históricos.
const eliminarUsuario = async (id) => {
  const response = await axios.delete(
    `${API_URL}/usuarios/${id}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 8. LISTAR TÉCNICOS DISPONIBLES
// ---------------------------------------------------------------------------
// Función auxiliar para el paso de asignación de técnico en Nuevo Ticket.
// Filtra de la lista general solo los usuarios que:
//   - Tienen rol TECNICO
//   - Estado laboral es DISPONIBLE
//   - No están eliminados
// NOTA: El backend no tiene un endpoint específico para esto, así que
// filtramos en el frontend. Si en el futuro el backend agrega un endpoint
// /api/usuarios/tecnicos-disponibles, reemplazamos esta función.
const listarTecnicosDisponibles = async () => {
  const todos = await listarUsuarios();
  
  return todos.filter(u => 
    u.roles?.some(r => r.nombre === 'TECNICO' || r === 'TECNICO') &&
    u.estadoLaboral === 'DISPONIBLE' &&
    !u.eliminado
  );
};

// ---------------------------------------------------------------------------
// EXPORTACIÓN
// ---------------------------------------------------------------------------
const usuarioService = {
  crearUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  actualizarUsuario,
  restablecerContrasena,
  cambiarEstadoLaboral,
  eliminarUsuario,
  listarTecnicosDisponibles
};

export default usuarioService;