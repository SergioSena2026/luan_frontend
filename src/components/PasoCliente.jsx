// ============================================================================
// PASO-CLIENTE.JSX - Paso 1 del wizard: Buscar o crear cliente
// ============================================================================
// Este componente maneja TODO el flujo del cliente en el Nuevo Ticket:
// 
//   OPCIÓN A: Cliente Existente
//     - Campo de búsqueda por nombre, apellido, teléfono, WhatsApp, cédula
//     - Búsqueda parcial e insensible a mayúsculas
//     - Lista de resultados, seleccionar carga datos
//     - Permite editar datos del cliente antes de continuar
// 
//   OPCIÓN B: Cliente Nuevo
//     - Formulario con campos obligatorios: nombre, apellido, teléfono, WhatsApp
//     - Campos opcionales: cédula, correo, dirección
//     - Validaciones:
//       * WhatsApp único: si existe, bloquea con mensaje y botón "Usar este cliente"
//       * Cédula única: mismo bloqueo y botón
//       * Teléfono: advertencia si existe en otros clientes, no bloquea
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import clienteService from '../services/clienteService';

const PasoCliente = ({ datos, onGuardar }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  
  // 'buscar' = pantalla de búsqueda de existente
  // 'nuevo'  = formulario de cliente nuevo
  // 'editar' = editando un cliente existente seleccionado
  const [modo, setModo] = useState('buscar');
  
  // Término de búsqueda y resultados
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  
  // Cliente seleccionado de la búsqueda
  const [clienteSeleccionado, setClienteSeleccionado] = useState(datos || null);
  
  // Formulario para nuevo o editar
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    whatsApp: '',
    cedula: '',
    correo: '',
    direccion: ''
  });
  
  // Estados de validación y errores
  const [errores, setErrores] = useState({});
  const [advertencias, setAdvertencias] = useState({});
  const [whatsappExistente, setWhatsappExistente] = useState(null);
  const [cedulaExistente, setCedulaExistente] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // -------------------------------------------------------------------------
  // EFECTO: Si recibimos datos del padre (volver atrás), cargarlos
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (datos) {
      setClienteSeleccionado(datos);
      setFormData({
        nombre: datos.nombre || '',
        apellido: datos.apellido || '',
        telefono: datos.telefono || '',
        whatsApp: datos.whatsApp || '',
        cedula: datos.cedula || '',
        correo: datos.correo || '',
        direccion: datos.direccion || ''
      });
    }
  }, [datos]);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Buscar clientes existentes
  // -------------------------------------------------------------------------
  const handleBuscar = async () => {
    if (!terminoBusqueda.trim()) return;
    
    setBuscando(true);
    setErrores({});
    
    try {
      const data = await clienteService.buscarClientes(terminoBusqueda);
      setResultados(data);
      
      if (data.length === 0) {
        setErrores({ busqueda: 'No se encontraron clientes con ese criterio.' });
      }
    } catch (err) {
      console.error('Error al buscar clientes:', err);
      setErrores({ busqueda: 'Error al conectar con el servidor.' });
    } finally {
      setBuscando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Seleccionar un cliente de los resultados
  // -------------------------------------------------------------------------
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      telefono: cliente.telefono || '',
      whatsApp: cliente.whatsApp || '',
      cedula: cliente.cedula || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || ''
    });
    setModo('editar');
    setResultados([]);
    setTerminoBusqueda('');
    setErrores({});
    setAdvertencias({});
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Validar WhatsApp en tiempo real (al salir del campo)
  // -------------------------------------------------------------------------
  const validarWhatsApp = async (whatsapp) => {
    if (!whatsapp.trim()) {
      setWhatsappExistente(null);
      return;
    }
    
    // Si estamos editando un cliente existente y el WhatsApp no cambió, no validamos
    if (clienteSeleccionado && clienteSeleccionado.whatsApp === whatsapp) {
      setWhatsappExistente(null);
      return;
    }
    
    try {
      const cliente = await clienteService.buscarClientePorWhatsApp(whatsapp);
      // Si llegamos aquí, el WhatsApp existe en otro cliente
      setWhatsappExistente(cliente);
      setErrores(prev => ({ ...prev, whatsApp: 'Este WhatsApp ya está registrado.' }));
    } catch (err) {
      // Si devuelve 404 o error, el WhatsApp NO existe (está disponible)
      setWhatsappExistente(null);
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors.whatsApp;
        return newErrors;
      });
    }
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
  // FUNCIÓN: Validar formulario antes de enviar
  // -------------------------------------------------------------------------
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio.';
    if (!formData.telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio.';
    if (!formData.whatsApp.trim()) nuevosErrores.whatsApp = 'El WhatsApp es obligatorio.';
    
    // Si hay un WhatsApp duplicado bloqueante, no dejamos continuar
    if (whatsappExistente) {
      nuevosErrores.whatsApp = 'Este WhatsApp ya está registrado.';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar cliente (crear nuevo o actualizar existente)
  // -------------------------------------------------------------------------
  const handleGuardar = async () => {
    if (!validarFormulario()) return;
    
    setGuardando(true);
    
    try {
      let clienteGuardado;
      
      if (modo === 'editar' && clienteSeleccionado) {
        // Actualizar cliente existente
        clienteGuardado = await clienteService.actualizarCliente(
          clienteSeleccionado.id,
          formData
        );
      } else {
        // Crear cliente nuevo
        clienteGuardado = await clienteService.crearCliente(formData);
      }
      
      // Entregamos los datos al componente padre (NuevoTicket) y avanzamos
      onGuardar(clienteGuardado);
      
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      
      // Manejar errores específicos del backend (409 = conflicto/ya existe)
      if (err.response?.status === 409) {
        setErrores({ general: err.response.data?.message || 'El cliente ya existe.' });
      } else {
        setErrores({ general: 'Error al guardar el cliente. Intenta de nuevo.' });
      }
    } finally {
      setGuardando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Continuar con cliente existente sin editar
  // -------------------------------------------------------------------------
  const handleContinuarSinEditar = () => {
    if (clienteSeleccionado) {
      onGuardar(clienteSeleccionado);
    }
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: Selector de modo (Buscar vs Nuevo)
  // -------------------------------------------------------------------------
  const renderSelectorModo = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => {
          setModo('buscar');
          setClienteSeleccionado(null);
          setErrores({});
          setAdvertencias({});
        }}
        className={`
          flex-1 py-4 px-6 rounded-xl border-2 text-center transition-all
          ${modo === 'buscar' || modo === 'editar'
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }
        `}
      >
        <span className="text-2xl block mb-2">🔍</span>
        <span className="font-semibold">Cliente Existente</span>
        <span className="block text-xs text-gray-500 mt-1">Buscar en base de datos</span>
      </button>
      
      <button
        onClick={() => {
          setModo('nuevo');
          setClienteSeleccionado(null);
          setFormData({
            nombre: '', apellido: '', telefono: '',
            whatsApp: '', cedula: '', correo: '', direccion: ''
          });
          setErrores({});
          setAdvertencias({});
          setWhatsappExistente(null);
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
        <span className="font-semibold">Cliente Nuevo</span>
        <span className="block text-xs text-gray-500 mt-1">Registrar por primera vez</span>
      </button>
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO: Búsqueda de cliente existente
  // -------------------------------------------------------------------------
  const renderBusqueda = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Buscar cliente por nombre, apellido, teléfono, WhatsApp o cédula
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          placeholder="Ej: Juan Pérez, 3001234567, 12345678..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleBuscar}
          disabled={buscando || !terminoBusqueda.trim()}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {buscando ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {errores.busqueda && (
        <p className="mt-2 text-sm text-red-600">{errores.busqueda}</p>
      )}
      
      {/* Resultados de búsqueda */}
      {resultados.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500 mb-2">
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}:
          </p>
          {resultados.map(cliente => (
            <button
              key={cliente.id}
              onClick={() => seleccionarCliente(cliente)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {cliente.nombre} {cliente.apellido}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📱 WhatsApp: {cliente.whatsApp}
                  </p>
                  {cliente.cedula && (
                    <p className="text-sm text-gray-400">
                      🪪 Cédula: {cliente.cedula}
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
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO: Formulario de cliente (nuevo o editar)
  // -------------------------------------------------------------------------
  const renderFormulario = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.nombre && <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>}
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.apellido ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.apellido && <p className="mt-1 text-sm text-red-600">{errores.apellido}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="3001234567"
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.telefono ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.telefono && <p className="mt-1 text-sm text-red-600">{errores.telefono}</p>}
          {advertencias.telefono && (
            <p className="mt-1 text-sm text-yellow-600">⚠️ {advertencias.telefono}</p>
          )}
        </div>

        {/* WhatsApp - Identificador más fuerte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 font-normal ml-1">(identificador principal)</span>
          </label>
          <input
            type="tel"
            name="whatsApp"
            value={formData.whatsApp}
            onChange={handleChange}
            onBlur={(e) => validarWhatsApp(e.target.value)}
            placeholder="3001234567"
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.whatsApp ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          
          {/* Error de WhatsApp duplicado */}
          {errores.whatsApp && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errores.whatsApp}</p>
              {whatsappExistente && (
                <button
                  onClick={() => seleccionarCliente(whatsappExistente)}
                  className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                >
                  → Usar este cliente: {whatsappExistente.nombre} {whatsappExistente.apellido}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cédula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cédula <span className="text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            placeholder="12345678"
            className={`w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.cedula ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.cedula && <p className="mt-1 text-sm text-red-600">{errores.cedula}</p>}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo <span className="text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="cliente@email.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dirección - Ocupa las 2 columnas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección <span className="text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle 123 #45-67, Ciudad"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Error general del backend */}
      {errores.general && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errores.general}</p>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDERIZADO: Cliente seleccionado (modo editar)
  // -------------------------------------------------------------------------
  const renderClienteSeleccionado = () => {
    if (!clienteSeleccionado) return null;
    
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-green-700 font-medium">
              ✓ Cliente seleccionado
            </p>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </p>
            <p className="text-sm text-gray-500">
              WhatsApp: {clienteSeleccionado.whatsApp}
            </p>
          </div>
          <button
            onClick={handleContinuarSinEditar}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Continuar sin editar →
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Puedes editar los datos abajo si necesitas actualizar algo antes de continuar.
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
        {modo === 'nuevo' ? 'Registrar Cliente Nuevo' : 'Buscar Cliente'}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        {modo === 'nuevo' 
          ? 'Ingresa los datos del cliente. El WhatsApp es obligatorio y único.'
          : 'Busca al cliente en la base de datos o registra uno nuevo.'
        }
      </p>

      {/* Selector de modo */}
      {renderSelectorModo()}

      {/* Contenido según el modo */}
      {modo === 'buscar' && !clienteSeleccionado && renderBusqueda()}
      
      {modo === 'editar' && (
        <>
          {renderClienteSeleccionado()}
          {renderFormulario()}
        </>
      )}
      
      {modo === 'nuevo' && renderFormulario()}

      {/* Botón de guardar / continuar */}
      {(modo === 'nuevo' || modo === 'editar') && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGuardar}
            disabled={guardando || whatsappExistente}
            className={`
              px-8 py-3 rounded-lg font-medium text-white transition-colors
              ${guardando || whatsappExistente
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {guardando 
              ? 'Guardando...' 
              : modo === 'editar' 
                ? 'Guardar cambios y continuar →' 
                : 'Crear cliente y continuar →'
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default PasoCliente;