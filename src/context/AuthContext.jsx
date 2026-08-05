// ============================================================================
// AUTH-CONTEXT.JSX - "Cerebro" global de la sesión del usuario
// ============================================================================
// React Context permite compartir datos entre componentes sin tener que 
// pasar props manualmente por cada nivel. Es como una variable global segura.
// 
// Este context maneja:
// - ¿Está logueado el usuario?
// - ¿Cuál es su token JWT?
// - ¿Qué roles tiene?
// - Funciones de login y logout disponibles en toda la app
// ============================================================================

import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// ---------------------------------------------------------------------------
// PASO 1: Crear el Contexto
// ---------------------------------------------------------------------------
// createContext() crea un "contenedor" vacío. Los componentes que se suscriban
// a este contenedor podrán leer y modificar los datos que guardemos aquí.
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// PASO 2: Crear el Provider (el proveedor de datos)
// ---------------------------------------------------------------------------
// AuthProvider es un componente envolvente. Todo lo que pongas DENTRO de 
// <AuthProvider> en tu app tendrá acceso a los datos de sesión.
export const AuthProvider = ({ children }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS (useState)
  // -------------------------------------------------------------------------
  // user: guarda toda la info del usuario logueado {token, nombre, correo, roles}
  //        Si es null, significa que NO hay nadie logueado.
  // loading: true mientras revisamos si hay un token guardado en el navegador.
  //          Evita que la app "parpadee" mostrando el login por un instante
  //          cuando en realidad ya había una sesión guardada.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------------------
  // useEffect: Revisar sesión guardada al cargar la aplicación
  // -------------------------------------------------------------------------
  // Este efecto corre UNA SOLA VEZ cuando la app arranca (por eso el [] vacío).
  // Revisa si en el localStorage (memoria del navegador) hay un usuario guardado.
  // Si lo hay, lo recupera automáticamente para no pedir login de nuevo.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // JSON.parse convierte el texto guardado de vuelta a un objeto JavaScript
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Si el JSON está corrupto, limpiamos por seguridad
        console.error('Error al recuperar sesión:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    // Ya terminamos de revisar, quitamos la pantalla de carga
    setLoading(false);
  }, []); // [] vacío = solo al montar el componente

  // -------------------------------------------------------------------------
  // FUNCIÓN LOGIN
  // -------------------------------------------------------------------------
  // Llama al authService (que habla con Spring Boot), y si el login es exitoso,
  // guarda los datos en el estado 'user' y en el localStorage para persistencia.
  const login = async (correo, contrasena) => {
    // Llamamos al backend
    const data = await authService.login(correo, contrasena);
    
    // Armamos el objeto de usuario con los datos que nos devolvió el backend
    const userData = {
      token: data.token,        // El JWT que Spring Boot generó
      nombre: data.nombre,      // Nombre del usuario
      correo: data.correo,      // Correo del usuario
      roles: data.roles || []   // Array de roles (ej: ['ADMINISTRADOR'])
    };
    
    // Guardamos en el estado de React (memoria viva de la app)
    setUser(userData);
    
    // Guardamos en localStorage (memoria persistente del navegador)
    // JSON.stringify convierte el objeto a texto plano para guardarlo
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);
    
    return data;
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN LOGOUT
  // -------------------------------------------------------------------------
  // Limpia el estado y el localStorage. El usuario vuelve a ser "anónimo".
  const logout = () => {
    setUser(null);
    authService.logout(); // Limpia localStorage
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN AUXILIAR: Verificar si el usuario tiene un rol específico
  // -------------------------------------------------------------------------
  // Ejemplo de uso: hasRole('ADMINISTRADOR') devuelve true o false
  // Esto nos servirá para mostrar u ocultar opciones del menú según el rol.
  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN AUXILIAR: Verificar si el usuario tiene AL MENOS UNO de varios roles
  // -------------------------------------------------------------------------
  // Ejemplo: hasAnyRole(['RECEPCIONISTA', 'SUPERVISOR'])
  const hasAnyRole = (rolesArray) => {
    if (!user || !user.roles) return false;
    return rolesArray.some(role => user.roles.includes(role));
  };

  // -------------------------------------------------------------------------
  // VALOR QUE COMPARTIMOS CON TODA LA APP
  // -------------------------------------------------------------------------
  // Cualquier componente que use useAuth() recibirá este objeto completo.
  const value = {
    user,        // Datos del usuario logueado (o null)
    login,       // Función para iniciar sesión
    logout,      // Función para cerrar sesión
    hasRole,     // Función para verificar un rol específico
    hasAnyRole,  // Función para verificar varios roles
    loading      // true/false mientras carga la sesión inicial
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------------------
  // AuthContext.Provider "envuelve" a los hijos y les da acceso a 'value'.
  // Si está cargando, mostramos un mensaje simple para evitar parpadeos.
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-600 text-lg">Cargando sesión...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// PASO 3: Hook personalizado para usar el context fácilmente
// ---------------------------------------------------------------------------
// En vez de escribir useContext(AuthContext) en cada componente,
// creamos este hook que lo hace más corto y limpio.
// Uso: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Seguridad: si alguien usa useAuth() fuera de AuthProvider, lanzamos error
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};