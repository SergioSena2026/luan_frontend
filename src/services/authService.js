// ============================================================================
// AUTH-SERVICE.JS - Capa de comunicación con el backend para autenticación
// ============================================================================
// Este archivo es el único lugar donde hablamos directamente con la API de 
// Spring Boot para temas de login. Si mañana cambia la URL del backend, solo
// tocamos aquí.
// ============================================================================

// Importamos axios, la librería para hacer peticiones HTTP
import axios from 'axios';

// URL base de tu backend de Spring Boot. 
// En desarrollo local corre en localhost:8080
// El /api es el prefijo que tienen todos tus endpoints
const API_URL = 'http://localhost:8080/api';

/**
 * Función login: envía las credenciales al backend y recibe el token JWT.
 * 
 * @param {string} correo - El correo del usuario (ej: admin@drboard.com)
 * @param {string} contrasena - La contraseña del usuario
 * @returns {Promise} - La respuesta del backend con {token, nombre, roles, ...}
 */
const login = async (correo, contrasena) => {
  // Hacemos una petición POST a /api/auth/login con el correo y contraseña
  const response = await axios.post(`${API_URL}/auth/login`, {
    correo: correo,
    contrasena: contrasena
  });
  
  // Retornamos la respuesta completa para que el AuthContext la maneje
  return response.data;
};

/**
 * Función logout: limpia el token del almacenamiento local.
 * En el backend no hay endpoint de logout porque JWT es stateless (sin estado).
 * El token simplemente deja de existir en el frontend.
 */
const logout = () => {
  // Eliminamos el token del localStorage (memoria del navegador)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Exportamos las funciones para usarlas en otros archivos
const authService = {
  login,
  logout
};

export default authService;