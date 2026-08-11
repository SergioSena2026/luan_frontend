// ============================================================================
// PASO-TICKET.JSX - Paso 3 del wizard: Ingresar datos de la orden de reparación
// ============================================================================
// Este componente captura la información del ticket antes de asignar técnico.
// 
// Campos obligatorios según la especificación:
//   - caracteristicasIngreso: Descripción física del equipo al recibirlo
//     (rayones, golpes, estado de pantalla, condición general, etc.)
//   - accesoriosEntregados: Lista de lo que el cliente dejó (cargador, mouse, funda, etc.)
//   - fallaReportada: Lo que el cliente dice que le pasa al equipo
// 
// Campo opcional:
//   - ticketGarantiaId: Número de ticket anterior si es una garantía
// 
// NOTA: En este paso NO se crea el ticket en el backend todavía.
// Los datos se acumulan en el formData del wizard y se envían al backend
// junto con el técnico asignado en el paso 4 o 5.
// ============================================================================

import { useState, useEffect } from 'react';

const PasoTicket = ({ datos, onGuardar, onVolver }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    caracteristicasIngreso: '',
    accesoriosEntregados: '',
    fallaReportada: '',
    ticketGarantiaId: ''
  });
  
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // -------------------------------------------------------------------------
  // EFECTO: Cargar datos si venimos de volver atrás
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (datos) {
      setFormData({
        caracteristicasIngreso: datos.caracteristicasIngreso || '',
        accesoriosEntregados: datos.accesoriosEntregados || '',
        fallaReportada: datos.fallaReportada || '',
        ticketGarantiaId: datos.ticketGarantiaId || ''
      });
    }
  }, [datos]);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Manejar cambios en los campos
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
    
    if (!formData.caracteristicasIngreso.trim()) {
      nuevosErrores.caracteristicasIngreso = 'Las características de ingreso son obligatorias.';
    }
    
    if (!formData.accesoriosEntregados.trim()) {
      nuevosErrores.accesoriosEntregados = 'Los accesorios entregados son obligatorios.';
    }
    
    if (!formData.fallaReportada.trim()) {
      nuevosErrores.fallaReportada = 'La falla reportada es obligatoria.';
    }
    
    // Validación opcional: si ingresan ticket de garantía, debe ser un número válido
    if (formData.ticketGarantiaId.trim()) {
      const num = parseInt(formData.ticketGarantiaId, 10);
      if (isNaN(num) || num <= 0) {
        nuevosErrores.ticketGarantiaId = 'Ingresa un número de ticket válido.';
      }
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar y continuar
  // -------------------------------------------------------------------------
  const handleGuardar = () => {
    if (!validarFormulario()) return;
    
    setGuardando(true);
    
    // Simulamos un pequeño delay para que el usuario sienta que se procesó
    setTimeout(() => {
      // Si hay ticket de garantía, lo convertimos a número
      const datosFinales = {
        ...formData,
        ticketGarantiaId: formData.ticketGarantiaId.trim() 
          ? parseInt(formData.ticketGarantiaId, 10) 
          : null
      };
      
      onGuardar(datosFinales);
      setGuardando(false);
    }, 300);
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO
  // -------------------------------------------------------------------------
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Datos del Ticket
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Describe el estado del equipo, los accesorios y la falla reportada por el cliente.
      </p>

      <div className="space-y-5">
        
        {/* Características de Ingreso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Características de Ingreso <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 font-normal ml-1">
              (estado físico al recibir: rayones, golpes, pantalla, etc.)
            </span>
          </label>
          <textarea
            name="caracteristicasIngreso"
            value={formData.caracteristicasIngreso}
            onChange={handleChange}
            rows={4}
            placeholder="Ej: Equipo con rayón en tapa superior, pantalla sin daños visibles, teclado completo, bisagras en buen estado..."
            className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errores.caracteristicasIngreso ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.caracteristicasIngreso && (
            <p className="mt-1 text-sm text-red-600">{errores.caracteristicasIngreso}</p>
          )}
        </div>

        {/* Accesorios Entregados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accesorios Entregados <span className="text-red-500">*</span>
            <span className="text-xs text-gray-400 font-normal ml-1">
              (cargador, mouse, funda, etc. Escribe "Ninguno" si no aplica)
            </span>
          </label>
          <textarea
            name="accesoriosEntregados"
            value={formData.accesoriosEntregados}
            onChange={handleChange}
            rows={3}
            placeholder="Ej: Cargador original, mouse USB, funda negra..."
            className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errores.accesoriosEntregados ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.accesoriosEntregados && (
            <p className="mt-1 text-sm text-red-600">{errores.accesoriosEntregados}</p>
          )}
        </div>

        {/* Falla Reportada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Falla Reportada por el Cliente <span className="text-red-500">*</span>
          </label>
          <textarea
            name="fallaReportada"
            value={formData.fallaReportada}
            onChange={handleChange}
            rows={3}
            placeholder="Ej: No enciende, se apaga solo, pantalla parpadea, no carga..."
            className={`w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errores.fallaReportada ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.fallaReportada && (
            <p className="mt-1 text-sm text-red-600">{errores.fallaReportada}</p>
          )}
        </div>

        {/* Ticket de Garantía (opcional) */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket de Garantía <span className="text-xs text-gray-400 font-normal">(opcional)</span>
            <span className="text-xs text-gray-400 font-normal ml-1">
              (número de ticket anterior si es garantía)
            </span>
          </label>
          <input
            type="text"
            name="ticketGarantiaId"
            value={formData.ticketGarantiaId}
            onChange={handleChange}
            placeholder="Ej: 15 (solo el número, sin LUAN-)"
            className={`w-full md:w-1/3 px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
              errores.ticketGarantiaId ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errores.ticketGarantiaId && (
            <p className="mt-1 text-sm text-red-600">{errores.ticketGarantiaId}</p>
          )}
        </div>

      </div>

      {/* Botones de navegación */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onVolver}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ← Anterior
        </button>

        <button
          onClick={handleGuardar}
          disabled={guardando}
          className={`
            px-8 py-2.5 rounded-lg font-medium text-white transition-colors
            ${guardando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          {guardando ? 'Guardando...' : 'Continuar →'}
        </button>
      </div>
    </div>
  );
};

export default PasoTicket;