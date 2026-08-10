// ============================================================================
// TICKET-SERVICE.JS - Comunicación con el backend para tickets
// ============================================================================
// Funciones para crear tickets, cambiar estados, reasignar técnicos,
// buscar tickets y listar por filtros.
// 
// Endpoints consumidos:
//   POST /api/tickets?clienteId=X&equipoId=Y&tecnicoId=Z&usuarioId=W
//        → Crear ticket (tecnicoId es opcional)
//   PUT  /api/tickets/{id}/estado?nuevoEstado=...&usuarioId=...&comentario=...
//        → Cambiar estado del ticket (genera bitácora automáticamente)
//   PUT  /api/tickets/{id}/reasignar?nuevoTecnicoId=...&supervisorId=...
//        → Reasignar técnico (solo supervisor)
//   GET  /api/tickets/{id}
//        → Buscar ticket por ID (el ID ES el número visible del ticket)
//   GET  /api/tickets/tecnico/{tecnicoId}
//        → Listar tickets asignados a un técnico
//   GET  /api/tickets/estado?estado=RECIBIDO
//        → Listar tickets filtrados por estado
//   GET  /api/tickets
//        → Listar todos los tickets
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
// 1. CREAR TICKET
// ---------------------------------------------------------------------------
// Crea una orden de reparación vinculando cliente, equipo y opcionalmente técnico.
// Body: {fallaReportada, caracteristicasIngreso, accesoriosEntregados}
// Query params: clienteId (obligatorio), equipoId (obligatorio),
//               tecnicoId (opcional), usuarioId (obligatorio: quien crea el ticket)
// Si NO se envía tecnicoId, el ticket queda en estado RECIBIDO.
// Si SÍ se envía tecnicoId, el ticket queda en estado ASIGNADO.
const crearTicket = async (clienteId, equipoId, usuarioId, ticketData, tecnicoId = null) => {
  const params = { clienteId, equipoId, usuarioId };
  if (tecnicoId) {
    params.tecnicoId = tecnicoId;
  }

  const response = await axios.post(
    `${API_URL}/tickets`,
    ticketData,
    {
      ...authConfig(),
      params
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 2. CAMBIAR ESTADO DE UN TICKET
// ---------------------------------------------------------------------------
// Cada cambio de estado genera automáticamente un registro en la bitácora.
// Requiere comentario obligatorio y tipo de comentario (PUBLICO o INTERNO).
// Solo recepcionista puede pasar a ENTREGADO.
// Estados finales (ENTREGADO, CANCELADO) no se pueden cambiar.
const cambiarEstado = async (ticketId, nuevoEstado, usuarioId, comentario, tipoComentario = 'PUBLICO') => {
  const response = await axios.put(
    `${API_URL}/tickets/${ticketId}/estado`,
    null, // No hay body, todo va por query params
    {
      ...authConfig(),
      params: {
        nuevoEstado,
        usuarioId,
        comentario,
        tipoComentario
      }
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 3. REASIGNAR TÉCNICO
// ---------------------------------------------------------------------------
// Solo el supervisor puede hacer esto.
// Si el ticket estaba en RECIBIDO, pasa automáticamente a ASIGNADO.
const reasignarTecnico = async (ticketId, nuevoTecnicoId, supervisorId) => {
  const response = await axios.put(
    `${API_URL}/tickets/${ticketId}/reasignar`,
    null,
    {
      ...authConfig(),
      params: {
        nuevoTecnicoId,
        supervisorId
      }
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 4. BUSCAR TICKET POR ID
// ---------------------------------------------------------------------------
// El ID del ticket ES su número visible (1, 2, 3...).
const buscarTicketPorId = async (id) => {
  const response = await axios.get(
    `${API_URL}/tickets/${id}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 5. LISTAR TICKETS DE UN TÉCNICO
// ---------------------------------------------------------------------------
// Se usa en el Dashboard Técnico para mostrar solo los tickets asignados.
const listarTicketsPorTecnico = async (tecnicoId) => {
  const response = await axios.get(
    `${API_URL}/tickets/tecnico/${tecnicoId}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 6. LISTAR TICKETS POR ESTADO
// ---------------------------------------------------------------------------
// Se usa en el Dashboard Supervisor para filtrar por estado.
const listarTicketsPorEstado = async (estado) => {
  const response = await axios.get(
    `${API_URL}/tickets/estado`,
    {
      ...authConfig(),
      params: { estado }
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 7. LISTAR TODOS LOS TICKETS
// ---------------------------------------------------------------------------
const listarTodosLosTickets = async () => {
  const response = await axios.get(
    `${API_URL}/tickets`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// EXPORTACIÓN
// ---------------------------------------------------------------------------
const ticketService = {
  crearTicket,
  cambiarEstado,
  reasignarTecnico,
  buscarTicketPorId,
  listarTicketsPorTecnico,
  listarTicketsPorEstado,
  listarTodosLosTickets
};

export default ticketService;