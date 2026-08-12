// ============================================================================
// DASHBOARD-TECNICO.JSX - Pantalla principal del técnico
// ============================================================================
// El técnico ve aquí sus tickets asignados, puede entrar al detalle de cada
// uno, revisar la información del cliente/equipo, ver la bitácora, y cambiar
// el estado del ticket siguiendo el flujo permitido.
// 
// Estados que puede manejar un técnico:
//   ASIGNADO → EN_DIAGNOSTICO
//   EN_DIAGNOSTICO → DIAGNOSTICO_COMPLETADO
//   DIAGNOSTICO_COMPLETADO → PENDIENTE_PRESUPUESTO o EN_REPARACION
//   PRESUPUESTO_APROBADO → EN_REPARACION
//   EN_REPARACION → EN_PRUEBAS
//   EN_PRUEBAS → LISTO_PARA_RECOGER (éxito) o EN_REPARACION (falla)
// 
// NO puede:
//   - Pasar a ENTREGADO (solo recepcionista)
//   - Saltar estados
//   - Reasignar tickets (solo supervisor)
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import bitacoraService from '../services/bitacoraService';

const DashboardTecnico = () => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  
  // Vista: 'lista' muestra todos los tickets, 'detalle' muestra uno solo
  const [vista, setVista] = useState('lista');
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [bitacora, setBitacora] = useState([]);
  const [cargandoBitacora, setCargandoBitacora] = useState(false);
  
  // Estado para el formulario de cambio de estado
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [tipoComentario, setTipoComentario] = useState('PUBLICO');
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorCambio, setErrorCambio] = useState(null);

  // -------------------------------------------------------------------------
  // DATOS DEL USUARIO LOGUEADO (técnico)
  // -------------------------------------------------------------------------
  const { user } = useAuth();
  const tecnicoId = user?.id;

  // -------------------------------------------------------------------------
  // EFECTO: Cargar tickets del técnico al montar
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (tecnicoId) {
      cargarTickets();
    }
  }, [tecnicoId]);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Cargar tickets asignados al técnico
  // -------------------------------------------------------------------------
  const cargarTickets = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const data = await ticketService.listarTicketsPorTecnico(tecnicoId);
      setTickets(data);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setError('Error al cargar los tickets. Intenta recargar la página.');
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Ver detalle de un ticket
  // -------------------------------------------------------------------------
  const verDetalle = async (ticket) => {
    setTicketSeleccionado(ticket);
    setVista('detalle');
    setNuevoEstado('');
    setComentario('');
    setTipoComentario('PUBLICO');
    setErrorCambio(null);
    
    // Cargar bitácora del ticket
    setCargandoBitacora(true);
    try {
      const data = await bitacoraService.listarBitacoraPorTicket(ticket.id);
      setBitacora(data);
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
      setBitacora([]);
    } finally {
      setCargandoBitacora(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Volver a la lista
  // -------------------------------------------------------------------------
  const volverALista = () => {
    setVista('lista');
    setTicketSeleccionado(null);
    setBitacora([]);
    setNuevoEstado('');
    setComentario('');
    setErrorCambio(null);
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Determinar estados siguientes válidos según el estado actual
  // -------------------------------------------------------------------------
  const obtenerEstadosSiguientes = (estadoActual) => {
    const transiciones = {
      'ASIGNADO': ['EN_DIAGNOSTICO'],
      'EN_DIAGNOSTICO': ['DIAGNOSTICO_COMPLETADO'],
      'DIAGNOSTICO_COMPLETADO': ['PENDIENTE_PRESUPUESTO', 'EN_REPARACION'],
      'PENDIENTE_PRESUPUESTO': [], // El cliente aprueba/rechaza, el técnico espera
      'PRESUPUESTO_APROBADO': ['EN_REPARACION'],
      'PRESUPUESTO_RECHAZADO': [], // El supervisor decide, técnico espera
      'EN_REPARACION': ['EN_PRUEBAS'],
      'EN_PRUEBAS': ['LISTO_PARA_RECOGER', 'EN_REPARACION'],
      'LISTO_PARA_RECOGER': [], // Solo recepcionista puede entregar
      'ENTREGADO': [], // Estado final
      'CANCELADO': []  // Estado final
    };
    
    return transiciones[estadoActual] || [];
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Cambiar estado del ticket
  // -------------------------------------------------------------------------
  const handleCambiarEstado = async () => {
    if (!nuevoEstado) {
      setErrorCambio('Selecciona un nuevo estado.');
      return;
    }
    if (!comentario.trim()) {
      setErrorCambio('El comentario es obligatorio.');
      return;
    }
    
    setCambiandoEstado(true);
    setErrorCambio(null);
    
    try {
      await ticketService.cambiarEstado(
        ticketSeleccionado.id,
        nuevoEstado,
        tecnicoId,
        comentario,
        tipoComentario
      );
      
      // Recargar el ticket y la bitácora
      const ticketActualizado = await ticketService.buscarTicketPorId(ticketSeleccionado.id);
      setTicketSeleccionado(ticketActualizado);
      
      const bitacoraActualizada = await bitacoraService.listarBitacoraPorTicket(ticketSeleccionado.id);
      setBitacora(bitacoraActualizada);
      
      // Limpiar formulario
      setNuevoEstado('');
      setComentario('');
      setTipoComentario('PUBLICO');
      
      // Recargar la lista en segundo plano
      cargarTickets();
      
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setErrorCambio(err.response?.data?.message || 'Error al cambiar el estado. Intenta de nuevo.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Formatear fecha
  // -------------------------------------------------------------------------
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Calcular tiempo transcurrido
  // -------------------------------------------------------------------------
  const tiempoTranscurrido = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora - fecha;
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffDias > 0) return `hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    if (diffHoras > 0) return `hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    return 'hace menos de 1 hora';
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: VISTA DE LISTA
  // -------------------------------------------------------------------------
  if (vista === 'lista') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Tickets Asignados</h2>
          <p className="text-gray-500 mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} en total
          </p>
        </div>

        {cargando && (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando tickets...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!cargando && tickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-4xl mb-4">🔧</p>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No tienes tickets asignados</h3>
            <p className="text-gray-500 text-sm">
              Cuando el supervisor o recepcionista te asigne un ticket, aparecerá aquí.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {tickets.map(ticket => {
            const estadosSiguientes = obtenerEstadosSiguientes(ticket.estadoActual);
            const puedeAvanzar = estadosSiguientes.length > 0;
            
            return (
              <button
                key={ticket.id}
                onClick={() => verDetalle(ticket)}
                className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-blue-600">#{ticket.id}</span>
                      <span className={`
                        text-xs font-medium px-2.5 py-1 rounded-full
                        ${ticket.estadoActual === 'ENTREGADO' || ticket.estadoActual === 'CANCELADO'
                          ? 'bg-gray-100 text-gray-600'
                          : ticket.estadoActual === 'LISTO_PARA_RECOGER'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }
                      `}>
                        {ticket.estadoActual.replace(/_/g, ' ')}
                      </span>
                      {!puedeAvanzar && ticket.estadoActual !== 'ENTREGADO' && ticket.estadoActual !== 'CANCELADO' && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          ⏳ Esperando
                        </span>
                      )}
                    </div>
                    
                    <p className="font-medium text-gray-800 mb-1">
                      {ticket.equipo?.tipo} {ticket.equipo?.marca} {ticket.equipo?.modelo}
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Cliente: {ticket.cliente?.nombre} {ticket.cliente?.apellido}
                    </p>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ticket.fallaReportada}
                    </p>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-400 mb-1">
                      {tiempoTranscurrido(ticket.fechaCreacion)}
                    </p>
                    <span className="text-blue-600 text-sm font-medium">
                      Ver detalle →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO: VISTA DE DETALLE
  // -------------------------------------------------------------------------
  if (!ticketSeleccionado) return null;

  const estadosPermitidos = obtenerEstadosSiguientes(ticketSeleccionado.estadoActual);
  const puedeCambiarEstado = estadosPermitidos.length > 0;

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={volverALista}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Volver a la lista
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ticket #{ticketSeleccionado.id}</h2>
          <span className={`
            inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full
            ${ticketSeleccionado.estadoActual === 'ENTREGADO' || ticketSeleccionado.estadoActual === 'CANCELADO'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-blue-100 text-blue-700'
            }
          `}>
            {ticketSeleccionado.estadoActual.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda: Datos del ticket */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Datos del cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">👤 Cliente</h3>
            <p className="font-medium text-gray-800">
              {ticketSeleccionado.cliente?.nombre} {ticketSeleccionado.cliente?.apellido}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              📱 {ticketSeleccionado.cliente?.whatsApp || ticketSeleccionado.cliente?.telefono}
            </p>
            {ticketSeleccionado.cliente?.correo && (
              <p className="text-sm text-gray-500">✉️ {ticketSeleccionado.cliente.correo}</p>
            )}
          </div>

          {/* Datos del equipo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">💻 Equipo</h3>
            <p className="font-medium text-gray-800">
              {ticketSeleccionado.equipo?.tipo} {ticketSeleccionado.equipo?.marca} {ticketSeleccionado.equipo?.modelo}
            </p>
            {ticketSeleccionado.equipo?.serial && (
              <p className="text-sm text-gray-500 mt-1">Serial: {ticketSeleccionado.equipo.serial}</p>
            )}
            {ticketSeleccionado.equipo?.contrasena && (
              <p className="text-sm text-gray-500">Contraseña: {ticketSeleccionado.equipo.contrasena}</p>
            )}
          </div>

          {/* Información del ticket (solo lectura) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">📝 Información del Ingreso</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Falla Reportada</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{ticketSeleccionado.fallaReportada}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Características de Ingreso</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{ticketSeleccionado.caracteristicasIngreso}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Accesorios Entregados</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{ticketSeleccionado.accesoriosEntregados}</p>
              </div>
            </div>
          </div>

          {/* Cambio de estado */}
          {puedeCambiarEstado && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">🔄 Cambiar Estado</h3>
              
              {errorCambio && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{errorCambio}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Selector de nuevo estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuevo Estado
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Selecciona el siguiente estado...</option>
                    {estadosPermitidos.map(estado => (
                      <option key={estado} value={estado}>
                        {estado.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentario <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    placeholder="Describe qué se hizo o por qué cambia el estado..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Tipo de comentario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Comentario
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoComentario"
                        value="PUBLICO"
                        checked={tipoComentario === 'PUBLICO'}
                        onChange={(e) => setTipoComentario(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">🌐 Público (el cliente lo ve)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoComentario"
                        value="INTERNO"
                        checked={tipoComentario === 'INTERNO'}
                        onChange={(e) => setTipoComentario(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">🔒 Interno (solo staff)</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleCambiarEstado}
                  disabled={cambiandoEstado}
                  className={`
                    w-full py-2.5 rounded-lg font-medium text-white transition-colors
                    ${cambiandoEstado ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                  `}
                >
                  {cambiandoEstado ? 'Guardando cambio...' : 'Guardar Cambio de Estado'}
                </button>
              </div>
            </div>
          )}

          {!puedeCambiarEstado && ticketSeleccionado.estadoActual !== 'ENTREGADO' && ticketSeleccionado.estadoActual !== 'CANCELADO' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <p className="text-sm text-yellow-700">
                ⏳ Este ticket está esperando una acción externa (cliente o supervisor).
                No puedes cambiar el estado en este momento.
              </p>
            </div>
          )}
        </div>

        {/* Columna derecha: Bitácora */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">📋 Historial de Estados</h3>
            
            {cargandoBitacora ? (
              <p className="text-sm text-gray-500">Cargando historial...</p>
            ) : bitacora.length === 0 ? (
              <p className="text-sm text-gray-500">No hay registros en la bitácora.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bitacora.map((registro, index) => (
                  <div key={registro.id || index} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-blue-400 rounded-full" />
                    
                    <p className="text-xs text-gray-400 mb-1">
                      {formatearFecha(registro.fechaHora)}
                    </p>
                    
                    <p className="text-sm font-medium text-gray-800">
                      {registro.estadoAnterior 
                        ? `${registro.estadoAnterior.replace(/_/g, ' ')} → ${registro.estadoNuevo.replace(/_/g, ' ')}`
                        : `Inicio: ${registro.estadoNuevo.replace(/_/g, ' ')}`
                      }
                    </p>
                    
                    {registro.comentario && (
                      <div className={`
                        mt-2 p-2 rounded text-sm
                        ${registro.tipoComentario === 'PUBLICO' 
                          ? 'bg-blue-50 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}>
                        <span className="text-xs font-medium opacity-70 block mb-1">
                          {registro.tipoComentario === 'PUBLICO' ? '🌐 Público' : '🔒 Interno'}
                        </span>
                        {registro.comentario}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      Por: {registro.usuario?.nombre || 'Sistema'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardTecnico;