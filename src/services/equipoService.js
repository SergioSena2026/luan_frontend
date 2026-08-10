// ============================================================================
// EQUIPO-SERVICE.JS - Comunicación con el backend para equipos
// ============================================================================
// Funciones para crear equipos, listar equipos de un cliente, buscar por ID
// y actualizar datos del equipo.
// 
// Endpoints consumidos:
//   POST /api/equipos?clienteId=X         → Crear equipo para un cliente
//   GET  /api/equipos/cliente/{clienteId} → Listar equipos de un cliente
//   GET  /api/equipos/{id}                → Buscar equipo por ID
//   PUT  /api/equipos/{id}                → Actualizar equipo
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
// 1. CREAR EQUIPO
// ---------------------------------------------------------------------------
// Crea un equipo asociado a un cliente específico.
// Campos obligatorios: tipo, marca, modelo.
// Campos opcionales: serial, contrasena (contraseña o patrón de desbloqueo).
const crearEquipo = async (clienteId, equipoData) => {
  const response = await axios.post(
    `${API_URL}/equipos`,
    equipoData,
    {
      ...authConfig(),
      params: { clienteId } // Query param: ?clienteId=2
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 2. LISTAR EQUIPOS DE UN CLIENTE
// ---------------------------------------------------------------------------
// Se usa en el paso 3 del Nuevo Ticket para mostrar los equipos previos
// del cliente y permitirle seleccionar uno existente.
const listarEquiposPorCliente = async (clienteId) => {
  const response = await axios.get(
    `${API_URL}/equipos/cliente/${clienteId}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 3. BUSCAR EQUIPO POR ID
// ---------------------------------------------------------------------------
const buscarEquipoPorId = async (id) => {
  const response = await axios.get(
    `${API_URL}/equipos/${id}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 4. ACTUALIZAR EQUIPO
// ---------------------------------------------------------------------------
// Se usa cuando el recepcionista selecciona un equipo existente pero quiere
// actualizar algún dato (ej: cambió la contraseña del equipo).
const actualizarEquipo = async (id, equipoData) => {
  const response = await axios.put(
    `${API_URL}/equipos/${id}`,
    equipoData,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// EXPORTACIÓN
// ---------------------------------------------------------------------------
const equipoService = {
  crearEquipo,
  listarEquiposPorCliente,
  buscarEquipoPorId,
  actualizarEquipo
};

export default equipoService;