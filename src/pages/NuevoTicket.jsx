// ============================================================================
// NUEVO-TICKET.JSX - Página contenedora del flujo de 5 pasos
// ============================================================================
// Esta página maneja el estado global del formulario y la navegación
// entre pasos. Acumula los datos de cada etapa para enviarlos al backend
// al final del flujo.
// 
// Estructura del formData:
// {
//   cliente: { id, nombre, apellido, telefono, whatsApp, cedula, correo, direccion },
//   equipo: { id, tipo, marca, modelo, serial, contrasena },
//   ticket: { fallaReportada, caracteristicasIngreso, accesoriosEntregados },
//   tecnico: { id, nombre, apellido, especialidad }
// }
// ============================================================================

import { useState } from 'react';
import WizardSteps from '../components/WizardSteps';
import PasoCliente from '../components/PasoCliente';
import PasoEquipo from '../components/PasoEquipo';

const NuevoTicket = () => {
  
  // -------------------------------------------------------------------------
  // ESTADO: Paso actual del wizard (1 a 5)
  // -------------------------------------------------------------------------
  const [pasoActual, setPasoActual] = useState(1);

  // -------------------------------------------------------------------------
  // ESTADO: Datos acumulados del formulario
  // -------------------------------------------------------------------------
  // Este objeto crece paso a paso. Cada etapa guarda sus datos aquí.
  const [formData, setFormData] = useState({
    cliente: null,   // Datos del cliente seleccionado o creado
    equipo: null,    // Datos del equipo seleccionado o creado
    ticket: null,    // Datos del ticket (falla, accesorios, etc.)
    tecnico: null    // Técnico asignado
  });

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar datos de un paso específico
  // -------------------------------------------------------------------------
  // Cada sub-componente de paso llama esta función para entregar sus datos.
  const guardarDatosPaso = (paso, datos) => {
    setFormData(prev => ({
      ...prev,
      [paso]: datos
    }));
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Avanzar al siguiente paso
  // -------------------------------------------------------------------------
  const siguientePaso = () => {
    if (pasoActual < 5) {
      setPasoActual(pasoActual + 1);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Retroceder al paso anterior
  // -------------------------------------------------------------------------
  const anteriorPaso = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Ir a un paso específico (solo si ya fue completado)
  // -------------------------------------------------------------------------
  // Esto permite que el usuario haga clic en un paso completado para corregir.
  const irAPaso = (numeroPaso) => {
    if (numeroPaso < pasoActual) {
      setPasoActual(numeroPaso);
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Finalizar y enviar todo al backend
  // -------------------------------------------------------------------------
  const finalizarTicket = async () => {
    // TODO: En una sesión futura conectaremos esto con ticketService.crearTicket()
    // Por ahora solo mostramos los datos en consola para verificar.
    console.log('Datos completos del ticket:', formData);
    alert('¡Ticket creado exitosamente! (Demo - conectar con backend en siguiente sesión)');
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO DE CADA PASO
  // -------------------------------------------------------------------------
  // Por ahora los pasos 2-5 son placeholders simples.
  // El paso 1 (Cliente) lo desarrollamos a continuación en un componente aparte.
  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <PasoCliente 
            datos={formData.cliente}
            onGuardar={(datos) => {
              guardarDatosPaso('cliente', datos);
              siguientePaso();
            }}
          />
        );
      
      case 2:
        return (
          <PasoEquipo 
            datos={formData.equipo}
            clienteId={formData.cliente?.id}
            onGuardar={(datos) => {
              guardarDatosPaso('equipo', datos);
              siguientePaso();
            }}
            onVolver={anteriorPaso}
          />
        );
      
      case 3:
        return (
          <PasoTicket 
            datos={formData.ticket}
            onGuardar={(datos) => {
              guardarDatosPaso('ticket', datos);
              siguientePaso();
            }}
            onVolver={anteriorPaso}
          />
        );
      
      case 4:
        return (
          <PasoTecnico 
            datos={formData.tecnico}
            onGuardar={(datos) => {
              guardarDatosPaso('tecnico', datos);
              siguientePaso();
            }}
            onVolver={anteriorPaso}
          />
        );
      
      case 5:
        return (
          <PasoComprobante 
            formData={formData}
            onFinalizar={finalizarTicket}
            onVolver={anteriorPaso}
          />
        );
      
      default:
        return null;
    }
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-5xl mx-auto">
      {/* Cabecera de la página */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nuevo Ticket de Reparación</h2>
        <p className="text-gray-500 text-sm mt-1">
          Sigue los pasos para registrar la orden de reparación
        </p>
      </div>

      {/* Barra de progreso del wizard */}
      <WizardSteps pasoActual={pasoActual} />

      {/* Área del paso actual */}
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-[400px]">
        {renderPaso()}
      </div>

      {/* Botones de navegación (solo si no es el paso final, que tiene sus propios botones) */}
      {pasoActual < 5 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={anteriorPaso}
            disabled={pasoActual === 1}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${pasoActual === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            ← Anterior
          </button>

          <button
            onClick={siguientePaso}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPONENTES PLACEHOLDER DE CADA PASO
// =============================================================================
// Estos componentes se reemplazarán por versiones completas en esta y 
// siguientes sesiones. Por ahora permiten navegar el wizard sin errores.
// =============================================================================


const PasoTicket = ({ datos, onGuardar, onVolver }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 3: Datos del Ticket</h3>
    <p className="text-gray-500">Falla reportada, características de ingreso, accesorios.</p>
    <button
      onClick={() => onGuardar({ fallaReportada: 'No enciende' })}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      Simular datos del ticket
    </button>
  </div>
);

const PasoTecnico = ({ datos, onGuardar, onVolver }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 4: Asignar Técnico</h3>
    <p className="text-gray-500">Lista de técnicos disponibles filtrados por especialidad.</p>
    <button
      onClick={() => onGuardar({ id: 1, nombre: 'Técnico Demo' })}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
    >
      Simular técnico asignado
    </button>
  </div>
);

const PasoComprobante = ({ formData, onFinalizar, onVolver }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 5: Comprobante</h3>
    <p className="text-gray-500 mb-4">Resumen del ticket y generación del comprobante.</p>
    
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <pre className="text-xs text-gray-600 overflow-auto">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onVolver}
        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        ← Anterior
      </button>
      <button
        onClick={onFinalizar}
        className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
      >
        ✓ Generar Ticket
      </button>
    </div>
  </div>
);

export default NuevoTicket;