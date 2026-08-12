// ============================================================================
// BITACORA-SERVICE.JS - Comunicación con el backend para bitácoras
// ============================================================================
// Funciones para consultar el historial de cambios de estado de un ticket.
// 
// Endpoints consumidos:
//   GET /api/bitacoras/ticket/{ticketId}  → Ver historial completo de un ticket
//   PUT /api/bitacoras/{id}               → Editar comentario (solo supervisor)
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
// 1. LISTAR BITÁCORA POR TICKET
// ---------------------------------------------------------------------------
// Devuelve todo el historial de cambios de estado de un ticket específico,
// incluyendo comentarios, quién hizo el cambio, y fechas.
const listarBitacoraPorTicket = async (ticketId) => {
  const response = await axios.get(
    `${API_URL}/bitacoras/ticket/${ticketId}`,
    authConfig()
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// 2. EDITAR COMENTARIO DE BITÁCORA
// ---------------------------------------------------------------------------
// Solo el supervisor puede hacer esto. No borra el original, crea un nuevo
// registro con la edición.
const editarComentario = async (bitacoraId, nuevoComentario, supervisorId) => {
  const response = await axios.put(
    `${API_URL}/bitacoras/${bitacoraId}`,
    null,
    {
      ...authConfig(),
      params: {
        nuevoComentario,
        supervisorId
      }
    }
  );
  return response.data;
};

// ---------------------------------------------------------------------------
// EXPORTACIÓN
// ---------------------------------------------------------------------------
const bitacoraService = {
  listarBitacoraPorTicket,
  editarComentario
};

export default bitacoraService;