// ============================================================================
// WIZARD-STEPS.JSX - Barra visual de progreso del Nuevo Ticket
// ============================================================================
// Muestra al recepcionista en qué paso está del flujo completo.
// Los pasos son:
//   1. Cliente     → Buscar o crear cliente
//   2. Equipo      → Buscar o registrar equipo
//   3. Ticket      → Ingresar falla, características y accesorios
//   4. Técnico     → Asignar técnico disponible
//   5. Comprobante → Generar número de ticket y mostrar resumen
// ============================================================================

const WizardSteps = ({ pasoActual, totalPasos = 5 }) => {
  
  // Nombres y descripciones de cada paso
  const pasos = [
    { numero: 1, nombre: 'Cliente', descripcion: 'Buscar o registrar' },
    { numero: 2, nombre: 'Equipo', descripcion: 'Seleccionar o crear' },
    { numero: 3, nombre: 'Ticket', descripcion: 'Falla y accesorios' },
    { numero: 4, nombre: 'Técnico', descripcion: 'Asignar reparador' },
    { numero: 5, nombre: 'Comprobante', descripcion: 'Generar orden' }
  ];

  return (
    <div className="w-full mb-8">
      {/* Contenedor de los pasos */}
      <div className="flex items-center justify-between relative">
        
        {/* Línea de progreso de fondo (gris) */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* Línea de progreso activa (azul) */}
        <div 
          className="absolute top-5 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((pasoActual - 1) / (totalPasos - 1)) * 100}%` }}
        />

        {/* Renderizar cada paso */}
        {pasos.map((paso) => {
          // Determinamos el estado visual de este paso
          const esCompletado = paso.numero < pasoActual;
          const esActual = paso.numero === pasoActual;
          const esPendiente = paso.numero > pasoActual;

          return (
            <div key={paso.numero} className="flex flex-col items-center">
              
              {/* Círculo del paso */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                border-2 transition-all duration-300
                ${esCompletado 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : esActual
                    ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}>
                {esCompletado ? '✓' : paso.numero}
              </div>

              {/* Nombre del paso */}
              <span className={`
                mt-2 text-xs font-medium text-center hidden sm:block
                ${esCompletado || esActual ? 'text-blue-700' : 'text-gray-400'}
              `}>
                {paso.nombre}
              </span>

              {/* Descripción del paso (solo en pantallas medianas+) */}
              <span className={`
                text-[10px] text-center hidden lg:block max-w-[100px]
                ${esCompletado || esActual ? 'text-gray-500' : 'text-gray-300'}
              `}>
                {paso.descripcion}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardSteps;