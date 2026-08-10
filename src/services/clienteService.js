// ============================================================================
// CLIENTE-SERVICE.JS - Comunicación con el backend para clientes
// ============================================================================
// Este archivo contiene TODAS las funciones que hablan con la API de clientes.
// Cualquier pantalla que necesite crear, buscar o editar un cliente usa este archivo.
// 
// Endpoints consumidos:
//   POST   /api/clientes              → Crear cliente
//   GET    /api/clientes              → Listar todos
//   GET    /api/clientes/{id}         → Buscar por ID
//   GET    /api/clientes/whatsapp/{w}  → Buscar por WhatsApp
//   GET    /api/clientes/buscar?texto= → Búsqueda parcial
//   PUT    /api/clientes/{id}         → Actualizar cliente
// ============================================================================

import axios from 'axios';

// URL base de la API. En producción esto vendría de una variable de entorno.
const API_URL = 'http://localhost:8080/api';

/**
 * Obtiene el token JWT guardado en localStorage.
 * Cada petición protegida debe enviar este token en el header Authorization.
 */
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || localStorage.getItem('token');
};

/**
 * Configuración común para todas las peticiones protegidas.
 * Agrega automáticamente el header Authorization: Bearer <token>
 */
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
});

// ---------------------------------------------------------------------------
// 1. CREAR CLIENTE
// ---------------------------------------------------------------------------
// Envía los datos del formulario al backend.
// El backend valida: WhatsApp único (bloquea 409), cédula única (bloquea 409),
// teléfono duplicado (advertencia, no bloquea).
const crearCliente = async (clienteData) => {
  const response = await axios.post(`${API_URL}/clientes`, clienteData, authConfig());
  return response.data;
};

// ---------------------------------------------------------------------------
// 2. LISTAR TODOS LOS CLIENTES
// ---------------------------------------------------------------------------
const listarClientes = async () => {
  const response = await axios.get(`${API_URL}/clientes`, authConfig());
  return response.data;
};

// ---------------------------------------------------------------------------
// 3. BUSCAR CLIENTE POR ID
// ---------------------------------------------------------------------------
const buscarClientePorId = async (id) => {
  const response = await axios.get(`${API_URL}/clientes/${id}`, authConfig());
  return response.data;
};

// ---------------------------------------------------------------------------
// 4. BUSCAR CLIENTE POR WHATSAPP
// ---------------------------------------------------------------------------
// WhatsApp es el identificador más fuerte del sistema.
// Se usa para detectar si un cliente ya existe al crear uno nuevo.
const buscarClientePorWhatsApp = async (whatsapp) => {
  const response = await axios.get(`${API_URL}/clientes/whatsapp/${whatsapp}`, authConfig());
  return response.data;
};

// ---------------------------------------------------------------------------
// 5. BÚSQUEDA PARCIAL (nombre, apellido, teléfono, WhatsApp, cédula)
// ---------------------------------------------------------------------------
// Insensible a mayúsculas. Usado en la pantalla de búsqueda de cliente existente.
const buscarClientes = async (texto) => {
  const response = await axios.get(`${API_URL}/clientes/buscar`, {
    ...authConfig(),
    params: { texto }
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// 6. ACTUALIZAR CLIENTE
// ---------------------------------------------------------------------------
// Se usa cuando el recepcionista encuentra un cliente existente y quiere
// actualizar sus datos (teléfono, dirección, etc.) antes de crear el ticket.
const actualizarCliente = async (id, clienteData) => {
  const response = await axios.put(`${API_URL}/clientes/${id}`, clienteData, authConfig());
  return response.data;
};

// ---------------------------------------------------------------------------
// EXPORTACIÓN: Agrupamos todo en un objeto para importarlo limpio
// ---------------------------------------------------------------------------
const clienteService = {
  crearCliente,
  listarClientes,
  buscarClientePorId,
  buscarClientePorWhatsApp,
  buscarClientes,
  actualizarCliente
};

export default clienteService;