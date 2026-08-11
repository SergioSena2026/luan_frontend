// ============================================================================
// PASO-EQUIPO.JSX - Paso 2 del wizard: Buscar o registrar equipo
// ============================================================================
// Este componente maneja el flujo del equipo para el ticket:
// 
//   OPCIÓN A: Equipo Existente
//     - Lista los equipos del cliente seleccionado en el paso anterior
//     - Búsqueda por serial dentro de los equipos del cliente
//     - Al seleccionar: muestra historial de ingresos (tickets anteriores)
//     - Permite editar datos (ej: cambió contraseña) antes de continuar
// 
//   OPCIÓN B: Equipo Nuevo
//     - Formulario con campos obligatorios: tipo, marca, modelo
//     - Campos opcionales: serial, contraseña/patrón
//     - Se vincula automáticamente al cliente del paso 1
// 
// NOTA: El historial de ingresos se obtiene filtrando todos los tickets
// por equipoId en el frontend. Si el backend agrega en el futuro un endpoint
// /api/tickets/equipo/{equipoId}, se puede optimizar esta parte.
// ============================================================================

import { useState, useEffect } from 'react';
import equipoService from '../services/equipoService';
import ticketService from '../services/ticketService';

const PasoEquipo = ({ clienteId, datos, onGuardar, onVolver }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  
  // 'existente' = buscar entre equipos del cliente
  // 'nuevo'     = registrar equipo nuevo
  // 'editar'    = editando un equipo existente seleccionado
  const [modo, setModo] = useState('existente');
  
  // Lista de equipos del cliente
  const [equiposCliente, setEquiposCliente] = useState([]);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  
  // Término de búsqueda por serial
  const [terminoSerial, setTerminoSerial] = useState('');
  
  // Equipo seleccionado
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(datos || null);
  
  // Historial de tickets de un equipo
  const [historialTickets, setHistorialTickets] = useState([]);
  const [historialExpandido, setHistorialExpandido] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  
  // Formulario para equipo nuevo o editar existente
  const [formData, setFormData] = useState({
    tipo: '',
    marca: '',
    modelo: '',
    serial: '',
    contrasena: ''
  });
  
  // Estados de validación y carga
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // -------------------------------------------------------------------------
  // EFECTO: Cargar equipos del cliente al montar el componente
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (clienteId) {
      cargarEquiposCliente();
    }
  }, [clienteId]);

  // -------------------------------------------------------------------------
  // EFECTO: Si recibimos datos del padre (volver atrás), cargarlos
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (datos) {
      setEquipoSeleccionado(datos);
      setFormData({
        tipo: datos.tipo || '',
        marca: datos.marca || '',
        modelo: datos.modelo || '',
        serial: datos.serial || '',
        contrasena: datos.contrasena || ''
      });
      // Si ya tenía datos, asumimos que viene de una edición previa
      if (datos.id) {
        setModo('editar');
        cargarHistorial(datos.id);
      }
    }
  }, [datos]);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Cargar equipos del cliente desde el backend
  // -------------------------------------------------------------------------
  const cargarEquiposCliente = async () => {
    setCargandoEquipos(true);
    try {
      const data = await equipoService.listarEquiposPorCliente(clienteId);
      setEquiposCliente(data);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
      setErrores({ general: 'Error al cargar los equipos del cliente.' });
    } finally {
      setCargandoEquipos(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Cargar historial de ingresos de un equipo
  // -------------------------------------------------------------------------
  // Obtenemos todos los tickets y filtramos los de este equipo.
  // En una fase futura el backend podría tener /api/tickets/equipo/{id}
  const cargarHistorial = async (equipoId) => {
    setCargandoHistorial(true);
    try {
      const todos = await ticketService.listarTodosLosTickets();
      // Filtramos solo los tickets que pertenecen a este equipo
      const delEquipo = todos.filter(t => t.equipo?.id === equipoId || t.equipoId === equipoId);
      setHistorialTickets(delEquipo);
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setHistorialTickets([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Seleccionar un equipo existente
  // -------------------------------------------------------------------------
  const seleccionarEquipo = (equipo) => {
    setEquipoSeleccionado(equipo);
    setFormData({
      tipo: equipo.tipo || '',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      serial: equipo.serial || '',
      contrasena: equipo.contrasena || ''
    });
    setModo('editar');
    setErrores({});
    cargarHistorial(equipo.id);
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Manejar cambios en el formulario
  // -------------------------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico al escribir
    if (errores[name]) {
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Validar formulario
  // -------------------------------------------------------------------------
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.tipo.trim()) nuevosErrores.tipo = 'El tipo es obligatorio.';
    if (!formData.marca.trim()) nuevosErrores.marca = 'La marca es obligatoria.';
    if (!formData.modelo.trim()) nuevosErrores.modelo = 'El modelo es obligatorio.';
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar equipo nuevo
  // -------------------------------------------------------------------------
  const handleGuardarNuevo = async () => {
    if (!validarFormulario()) return;
    if (!clienteId) {
      setErrores({ general: 'No hay cliente seleccionado. Vuelve al paso anterior.' });
      return;
    }
    
    setGuardando(true);
    try {
      const equipoCreado = await equipoService.crearEquipo(clienteId, formData);
      onGuardar(equipoCreado);
    } catch (err) {
      console.error('Error al crear equipo:', err);
      setErrores({ general: 'Error al crear el equipo. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar cambios en equipo existente y continuar
  // -------------------------------------------------------------------------
  const handleGuardarEditado = async () => {
    if (!validarFormulario()) return;
    if (!equipoSeleccionado?.id) return;
    
    setGuardando(true);
    try {
      // Solo actualizamos si hay cambios reales
      const equipoActualizado = await equipoService.actualizarEquipo(
        equipoSeleccionado.id,
        formData
      );
      onGuardar(equipoActualizado);
    } catch (err) {
      console.error('Error al actualizar equipo:', err);
      setErrores({ general: 'Error al actualizar el equipo. Intenta de nuevo.' });
    } finally {
      setGuardando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Continuar sin editar el equipo existente
  // -------------------------------------------------------------------------
  const handleContinuarSinEditar = () => {
    if (equipoSeleccionado) {
      onGuardar(equipoSeleccionado);
    }
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: Selector de modo
  // -------------------------------------------------------------------------
  const renderSelectorModo = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => {
          setModo('existente');
          setEquipoSeleccionado(null);
          setErrores({});
          setHistorialTickets([]);
          setFormData({ tipo: '', marca: '', modelo: '', serial: '', contrasena: '' });
        }}
        className={`
          flex-1 py-4 px-6 rounded-xl border-2 text-center transition-all
          ${modo === 'existente' || modo === 'editar'
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }
        `}
      >
        <span className="text-2xl block mb-2">💻</span>
        <span className="font-semibold">Equipo Existente</span>
        <span className="block text-xs text-gray-500 mt-1">Seleccionar de los anteriores</span>
      </button>
      
      <button
        onClick={() => {
          setModo('nuevo');
          setEquipoSeleccionado(null);
          setErrores({});
          setHistorialTickets([]);
          setFormData({ tipo: '', marca: '', modelo: '', serial: '', contrasena: '' });
        }}
        className={`
          flex-1 py-4 px-6 rounded-xl border-2 text-center transition-all
          ${modo === 'nuevo'
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }
        `}
      >
        <span className="text-2xl block mb-2">➕</span>
        <span className="font-semibold">Equipo Nuevo</span>
        <span className="block text-xs text-gray-500 mt-1">Registrar por primera vez</span>
      </button>
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO: Lista de equipos del cliente
  // -------------------------------------------------------------------------
  const renderListaEquipos = () => {
    if (cargandoEquipos) {
      return <p className="text-gray-500 text-center py-8">Cargando equipos...</p>;
    }

    if (equiposCliente.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Este cliente no tiene equipos registrados.</p>
          <button
            onClick={() => setModo('nuevo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Registrar equipo nuevo
          </button>
        </div>
      );
    }

    // Filtrar por serial si hay término de búsqueda
    const equiposFiltrados = terminoSerial
      ? equiposCliente.filter(e => 
          e.serial?.toLowerCase().includes(terminoSerial.toLowerCase()) ||
          e.tipo?.toLowerCase().includes(terminoSerial.toLowerCase()) ||
          e.marca?.toLowerCase().includes(terminoSerial.toLowerCase()) ||
          e.modelo?.toLowerCase().includes(terminoSerial.toLowerCase())
        )
      : equiposCliente;

    return (
      <div>
        {/* Campo de búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            value={terminoSerial}
            onChange={(e) => setTerminoSerial(e.target.value)}
            placeholder="Buscar por serial, tipo, marca o modelo..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Lista de equipos */}
        <div className="space-y-2">
          {equiposFiltrados.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay equipos que coincidan.</p>
          )}
          
          {equiposFiltrados.map(equipo => (
            <button
              key={equipo.id}
              onClick={() => seleccionarEquipo(equipo)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {equipo.tipo} {equipo.marca} {equipo.modelo}
                  </p>
                  {equipo.serial && (
                    <p className="text-sm text-gray-500 mt-1">
                      Serial: {equipo.serial}
                    </p>
                  )}
                </div>
                <span className="text-blue-600 text-sm font-medium">
                  Seleccionar →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: Historial de ingresos del equipo
  // -------------------------------------------------------------------------
  const renderHistorial = () => {
    if (cargandoHistorial) {
      return <p className="text-sm text-gray-500 py-2">Cargando historial...</p>;
    }

    if (historialTickets.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <button
          onClick={() => setHistorialExpandido(!historialExpandido)}
          className="flex items-center text-sm font-medium text-amber-800 w-full"
        >
          <span className="mr-2">{historialExpandido ? '▼' : '▶'}</span>
          Este equipo ha ingresado {historialTickets.length} vez{historialTickets.length !== 1 ? 'es' : ''} anteriormente
        </button>

        {historialExpandido && (
          <div className="mt-3 space-y-2">
            {historialTickets.map(ticket => (
              <div key={ticket.id} className="text-sm bg-white p-3 rounded border border-amber-100">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Ticket #{ticket.id}</span>
                  <span className="text-gray-500">{ticket.fechaCreacion || 'Fecha no disponible'}</span>
                </div>
                <p className="text-gray-600 mt-1">
                  Estado: <span className="font-medium">{ticket.estadoActual}</span>
                </p>
                <p className="text-gray-500 mt-1 text-xs">
                  {ticket.caracteristicasIngreso || 'Sin características registradas'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: Formulario de equipo (nuevo o editar)
  // -------------------------------------------------------------------------
  const renderFormulario = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            placeholder="Laptop, Desktop, Consola..."
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.tipo ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.tipo && <p className="mt-1 text-sm text-red-600">{errores.tipo}</p>}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            placeholder="HP, Dell, Sony..."
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.marca ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.marca && <p className="mt-1 text-sm text-red-600">{errores.marca}</p>}
        </div>

        {/* Modelo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            placeholder="Pavilion 15, PlayStation 5..."
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.modelo ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.modelo && <p className="mt-1 text-sm text-red-600">{errores.modelo}</p>}
        </div>

        {/* Serial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serial <span className="text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            name="serial"
            value={formData.serial}
            onChange={handleChange}
            placeholder="SN123456789"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contraseña / Patrón */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña o Patrón <span className="text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            placeholder="1234 o patrón de desbloqueo"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error general */}
      {errores.general && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errores.general}</p>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO: Equipo seleccionado (modo editar)
  // -------------------------------------------------------------------------
  const renderEquipoSeleccionado = () => {
    if (!equipoSeleccionado) return null;
    
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-green-700 font-medium">
              ✓ Equipo seleccionado
            </p>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {equipoSeleccionado.tipo} {equipoSeleccionado.marca} {equipoSeleccionado.modelo}
            </p>
            {equipoSeleccionado.serial && (
              <p className="text-sm text-gray-500">Serial: {equipoSeleccionado.serial}</p>
            )}
          </div>
          <button
            onClick={handleContinuarSinEditar}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Continuar sin editar →
          </button>
        </div>
        
        {/* Historial de ingresos */}
        {renderHistorial()}
        
        <p className="text-xs text-gray-500 mt-2">
          Puedes editar los datos abajo si necesitas actualizar algo (ej: cambió la contraseña).
        </p>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // -------------------------------------------------------------------------
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        {modo === 'nuevo' ? 'Registrar Equipo Nuevo' : 'Seleccionar Equipo'}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {modo === 'nuevo' 
          ? 'Ingresa los datos del equipo. Tipo, marca y modelo son obligatorios.'
          : 'Busca entre los equipos previos del cliente o registra uno nuevo.'
        }
      </p>

      {/* Selector de modo */}
      {renderSelectorModo()}

      {/* Contenido según el modo */}
      {modo === 'existente' && !equipoSeleccionado && renderListaEquipos()}
      
      {modo === 'editar' && (
        <>
          {renderEquipoSeleccionado()}
          {renderFormulario()}
        </>
      )}
      
      {modo === 'nuevo' && renderFormulario()}

      {/* Botón de guardar / continuar */}
      {(modo === 'nuevo' || modo === 'editar') && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={modo === 'nuevo' ? handleGuardarNuevo : handleGuardarEditado}
            disabled={guardando}
            className={`
              px-8 py-3 rounded-lg font-medium text-white transition-colors
              ${guardando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {guardando 
              ? 'Guardando...' 
              : modo === 'nuevo' 
                ? 'Crear equipo y continuar →' 
                : 'Guardar cambios y continuar →'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default PasoEquipo;