// ============================================================================
// APP.JSX - Enrutamiento principal de la aplicación
// ============================================================================
// Este es el corazón de la navegación. Decide qué página mostrar según la URL.
// 
// Estructura:
//   1. AuthProvider → Envuelve toda la app para que cualquier página acceda 
//      a los datos de sesión (token, roles, login, logout).
//   2. BrowserRouter → Habilita el enrutamiento por URL (ej: /login, /dashboard).
//   3. Routes → Contenedor de todas las rutas definidas.
//   4. Route → Cada ruta individual. Algunas son públicas, otras protegidas.
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import StaffLayout from './layouts/StaffLayout';

// Componentes reutilizables
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    // -----------------------------------------------------------------------
    // AuthProvider: "Cerebro" global de sesión
    // Todo lo que esté dentro puede usar useAuth() para saber quién está logueado
    // -----------------------------------------------------------------------
    <AuthProvider>
      
      {/* -------------------------------------------------------------------
          BrowserRouter: Habilita navegación por URL sin recargar la página
          ------------------------------------------------------------------- */}
      <BrowserRouter>
        
        {/* ---------------------------------------------------------------
            Routes: Contenedor de rutas. Solo UNA ruta se renderiza a la vez.
            --------------------------------------------------------------- */}
        <Routes>
          
          {/* =============================================================
              RUTAS PÚBLICAS (no requieren autenticación)
              ============================================================= */}
          
          {/* Ruta /login → Pantalla de inicio de sesión */}
          <Route path="/login" element={<Login />} />
          
          {/* =============================================================
              RUTAS PROTEGIDAS (requieren autenticación + roles específicos)
              
              Cada ruta protegida sigue este patrón:
              <ProtectedRoute allowedRoles={['ROL1', 'ROL2']}>
                <StaffLayout>
                  <Pagina />
                </StaffLayout>
              </ProtectedRoute>
              
              StaffLayout envuelve la página con el sidebar.
              ProtectedRoute verifica token y roles antes de mostrar nada.
              ============================================================= */}
          
          {/* Ruta / → Dashboard principal (cualquier usuario logueado) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <StaffLayout>
                  <Dashboard />
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /nuevo-ticket → Solo Recepcionista o Supervisor (si tiene rol adicional) */}
          <Route 
            path="/nuevo-ticket" 
            element={
              <ProtectedRoute allowedRoles={['RECEPCIONISTA', 'SUPERVISOR']}>
                <StaffLayout>
                  {/* Por ahora mostramos un placeholder. La página real se crea en otra sesión */}
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Ticket</h2>
                    <p className="text-gray-500">Esta página se construirá en la siguiente sesión de trabajo.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /dashboard-tecnico → Solo Técnico o Supervisor (si tiene rol adicional) */}
          <Route 
            path="/dashboard-tecnico" 
            element={
              <ProtectedRoute allowedRoles={['TECNICO', 'SUPERVISOR']}>
                <StaffLayout>
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Técnico</h2>
                    <p className="text-gray-500">Esta página se construirá en la siguiente sesión de trabajo.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /dashboard-supervisor → Solo Supervisor */}
          <Route 
            path="/dashboard-supervisor" 
            element={
              <ProtectedRoute allowedRoles={['SUPERVISOR']}>
                <StaffLayout>
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Supervisor</h2>
                    <p className="text-gray-500">Esta página se construirá en la siguiente sesión de trabajo.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /entrega-equipo → Solo Recepcionista o Supervisor (si tiene rol adicional) */}
          <Route 
            path="/entrega-equipo" 
            element={
              <ProtectedRoute allowedRoles={['RECEPCIONISTA', 'SUPERVISOR']}>
                <StaffLayout>
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Entrega de Equipo</h2>
                    <p className="text-gray-500">Esta página se construirá en la siguiente sesión de trabajo.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /usuarios → Solo Administrador */}
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <StaffLayout>
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión de Usuarios</h2>
                    <p className="text-gray-500">Esta página se construirá en la siguiente sesión de trabajo.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* Ruta /configuracion → Solo Administrador (mock, Fase 2+) */}
          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute allowedRoles={['ADMINISTRADOR']}>
                <StaffLayout>
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración del Sistema</h2>
                    <p className="text-gray-500">Esta función estará disponible en Fase 2.</p>
                  </div>
                </StaffLayout>
              </ProtectedRoute>
            } 
          />

          {/* =============================================================
              RUTA DE CONSULTA PÚBLICA (sin autenticación)
              Se creará en una sesión futura. Por ahora redirige al login.
              ============================================================= */}
          <Route path="/consulta" element={<Login />} />

          {/* =============================================================
              RUTA 404: Cualquier URL no definida arriba cae aquí
              ============================================================= */}
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;