// ============================================================================
// PASO-COMPROBANTE.JSX - Paso 5 del wizard: Generar el ticket en el backend
// ============================================================================
// Este es el paso FINAL del wizard. Aquí es donde realmente se crea el ticket
// en la base de datos de Spring Boot. Juntamos todos los datos acumulados
// en los 4 pasos anteriores y los enviamos de una sola vez.
// 
// Flujo:
//   1. Muestra un resumen visual de todo (cliente, equipo, falla, técnico).
//   2. El recepcionista revisa y hace clic en "Generar Ticket".
//   3. Se envía POST /api/tickets al backend.
//   4. Si es exitoso, se muestra el número de ticket generado.
//   5. Se muestran las credenciales para consulta pública (ticket + teléfono).
//   6. El recepcionista puede imprimir o copiar el comprobante.
// ============================================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';

const PasoComprobante = ({ formData, onFinalizar, onVolver }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  const [cargando, setCargando] = useState(false);
  const [ticketCreado, setTicketCreado] = useState(null); // Datos del ticket del backend
  const [error, setError] = useState(null);
  const [copiado, setCopiado] = useState(false); // Para el botón de copiar

  // -------------------------------------------------------------------------
  // DATOS DEL USUARIO LOGUEADO (recepcionista que crea el ticket)
  // -------------------------------------------------------------------------
  // Necesitamos el ID del usuario logueado para enviarlo como 'usuarioId'
  // al backend (quién creó el ticket).
  const { user } = useAuth();

  // -------------------------------------------------------------------------
  // FUNCIÓN: Crear el ticket en el backend
  // -------------------------------------------------------------------------
  const handleCrearTicket = async () => {
    setCargando(true);
    setError(null);
    
    try {
      // ---------------------------------------------------------------------
      // PREPARAR LOS DATOS
      // ---------------------------------------------------------------------
      const clienteId = formData.cliente?.id;
      const equipoId = formData.equipo?.id;
      const usuarioId = user?.id; // ID del recepcionista logueado
      const tecnicoId = formData.tecnico?.id || null; // Puede ser null
      
      // El body del POST
      const ticketData = {
        fallaReportada: formData.ticket?.fallaReportada,
        caracteristicasIngreso: formData.ticket?.caracteristicasIngreso,
        accesoriosEntregados: formData.ticket?.accesoriosEntregados
      };
      
      // Validación de seguridad: verificar que tenemos todo lo necesario
      if (!clienteId || !equipoId || !usuarioId) {
        throw new Error('Faltan datos obligatorios. Vuelve a los pasos anteriores.');
      }
      
      // ---------------------------------------------------------------------
      // LLAMADA AL BACKEND
      // ---------------------------------------------------------------------
      const respuesta = await ticketService.crearTicket(
        clienteId,
        equipoId,
        usuarioId,
        ticketData,
        tecnicoId
      );
      
      // Guardamos la respuesta para mostrar el comprobante
      setTicketCreado(respuesta);
      
    } catch (err) {
      console.error('Error al crear ticket:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al crear el ticket. Intenta de nuevo o contacta al administrador.');
      }
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Copiar número de ticket al portapapeles
  // -------------------------------------------------------------------------
  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Imprimir comprobante
  // -------------------------------------------------------------------------
  const imprimirComprobante = () => {
    window.print();
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: PANTALLA DE ÉXITO (ticket ya creado)
  // -------------------------------------------------------------------------
  if (ticketCreado) {
    const numeroTicket = ticketCreado.id; // El ID ES el número visible
    const telefonoCliente = formData.cliente?.whatsApp || formData.cliente?.telefono;
    
    return (
      <div className="text-center">
        {/* Icono de éxito */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Ticket creado exitosamente!
        </h3>
        <p className="text-gray-500 mb-8">
          La orden de reparación ha sido registrada en el sistema.
        </p>

        {/* Tarjeta del comprobante */}
        <div className="bg-white border-2 border-blue-100 rounded-xl p-8 max-w-md mx-auto mb-8 text-left shadow-sm print:shadow-none">
          
          {/* Encabezado del comprobante */}
          <div className="text-center border-b border-gray-200 pb-4 mb-4">
            <h4 className="text-xl font-bold text-blue-600">🔧 Luan</h4>
            <p className="text-sm text-gray-500">Comprobante de Recepción</p>
          </div>

          {/* Número de ticket (destacado) */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">NÚMERO DE TICKET</p>
            <p className="text-3xl font-bold text-blue-800">#{numeroTicket}</p>
          </div>

          {/* Datos del comprobante */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-800">
                {formData.cliente?.nombre} {formData.cliente?.apellido}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Equipo:</span>
              <span className="font-medium text-gray-800">
                {formData.equipo?.tipo} {formData.equipo?.marca} {formData.equipo?.modelo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Falla:</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {formData.ticket?.fallaReportada}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Técnico:</span>
              <span className="font-medium text-gray-800">
                {formData.tecnico 
                  ? `${formData.tecnico.nombre} ${formData.tecnico.apellido}`
                  : 'Por asignar (alerta a supervisor)'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span className="font-medium text-gray-800">
                {new Date().toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-dashed border-gray-300 my-6 pt-4">
            <p className="text-xs text-gray-500 text-center mb-2">
              CREDENCIALES PARA CONSULTA PÚBLICA
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-700">
                Ticket: <span className="font-bold text-blue-700">#{numeroTicket}</span>
              </p>
              <p className="text-sm font-medium text-gray-700">
                Teléfono: <span className="font-bold text-blue-700">{telefonoCliente}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                El cliente puede consultar el estado en la página pública
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => copiarAlPortapapeles(`Ticket: #${numeroTicket} - Tel: ${telefonoCliente}`)}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {copiado ? '¡Copiado!' : '📋 Copiar credenciales'}
          </button>
          
          <button
            onClick={imprimirComprobante}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            🖨️ Imprimir comprobante
          </button>
          
          <button
            onClick={onFinalizar}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            ✓ Finalizar y crear otro
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO: PANTALLA DE RESUMEN (antes de crear)
  // -------------------------------------------------------------------------
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Resumen y Comprobante
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Revisa los datos antes de generar el ticket. Una vez creado, no podrás modificarlos aquí.
      </p>

      {/* Error al crear */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error al crear el ticket:</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Tarjeta de resumen */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
        
        {/* Cliente */}
        <div className="flex items-start gap-3">
          <span className="text-xl">👤</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">Cliente</p>
            <p className="font-semibold text-gray-800">
              {formData.cliente?.nombre} {formData.cliente?.apellido}
            </p>
            <p className="text-sm text-gray-500">
              📱 {formData.cliente?.whatsApp || formData.cliente?.telefono}
            </p>
            {formData.cliente?.cedula && (
              <p className="text-sm text-gray-400">🪪 {formData.cliente.cedula}</p>
            )}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200" />

        {/* Equipo */}
        <div className="flex items-start gap-3">
          <span className="text-xl">💻</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">Equipo</p>
            <p className="font-semibold text-gray-800">
              {formData.equipo?.tipo} {formData.equipo?.marca} {formData.equipo?.modelo}
            </p>
            {formData.equipo?.serial && (
              <p className="text-sm text-gray-500">Serial: {formData.equipo.serial}</p>
            )}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200" />

        {/* Falla */}
        <div className="flex items-start gap-3">
          <span className="text-xl">🔧</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">Falla Reportada</p>
            <p className="text-sm text-gray-800">{formData.ticket?.fallaReportada}</p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200" />

        {/* Técnico */}
        <div className="flex items-start gap-3">
          <span className="text-xl">👨‍🔧</span>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">Técnico Asignado</p>
            <p className="font-semibold text-gray-800">
              {formData.tecnico 
                ? `${formData.tecnico.nombre} ${formData.tecnico.apellido} (${formData.tecnico.especialidad})`
                : <span className="text-yellow-600">Sin asignar — Generará alerta para supervisor</span>
              }
            </p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200" />

        {/* Características y accesorios (colapsados por defecto para no saturar) */}
        <div className="text-sm">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Características de Ingreso</p>
          <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
            {formData.ticket?.caracteristicasIngreso}
          </p>
        </div>
        
        <div className="text-sm">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Accesorios Entregados</p>
          <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
            {formData.ticket?.accesoriosEntregados}
          </p>
        </div>

      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={onVolver}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Anterior
        </button>

        <button
          onClick={handleCrearTicket}
          disabled={cargando}
          className={`
            px-8 py-2.5 rounded-lg font-medium text-white transition-colors
            ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {cargando ? 'Generando ticket...' : '✓ Generar Ticket'}
        </button>
      </div>
    </div>
  );
};

export default PasoComprobante;