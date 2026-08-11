// ============================================================================
// PASO-TECNICO.JSX - Paso 4 del wizard: Asignar técnico al ticket
// ============================================================================
// Este componente permite al recepcionista seleccionar qué técnico reparará
// el equipo. Según la especificación:
// 
//   - La asignación es obligatoria en condiciones normales.
//   - Se muestran solo técnicos con estado laboral DISPONIBLE.
//   - Se puede filtrar por especialidad (Microsoldadura, Software, Hardware, etc.)
//   - Si no hay técnicos disponibles, el ticket quedaría en RECIBIDO (alerta para supervisor).
//   - Al seleccionar un técnico, el ticket pasará a estado ASIGNADO.
// 
// NOTA: Usamos usuarioService.listarTecnicosDisponibles() que filtra en el frontend.
// Si el backend agrega un endpoint específico en el futuro, se puede optimizar.
// ============================================================================

import { useState, useEffect } from 'react';
import usuarioService from '../services/usuarioService';

const PasoTecnico = ({ datos, onGuardar, onVolver }) => {
  
  // -------------------------------------------------------------------------
  // ESTADOS
  // -------------------------------------------------------------------------
  const [tecnicos, setTecnicos] = useState([]);           // Lista completa de técnicos
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]); // Lista después del filtro
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(datos || null);
  const [especialidadFiltro, setEspecialidadFiltro] = useState(''); // Filtro por especialidad
  const [especialidades, setEspecialidades] = useState([]); // Lista única de especialidades
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});

  // -------------------------------------------------------------------------
  // EFECTO: Cargar técnicos disponibles al montar el componente
  // -------------------------------------------------------------------------
  useEffect(() => {
    cargarTecnicos();
  }, []);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Cargar técnicos desde el backend
  // -------------------------------------------------------------------------
  const cargarTecnicos = async () => {
    setCargando(true);
    setErrores({});
    
    try {
      // listarTecnicosDisponibles filtra: rol TECNICO + estado DISPONIBLE + no eliminado
      const data = await usuarioService.listarTecnicosDisponibles();
      setTecnicos(data);
      setTecnicosFiltrados(data);
      
      // Extraemos las especialidades únicas para el filtro desplegable
      const especs = [...new Set(data.map(t => t.especialidad).filter(Boolean))];
      setEspecialidades(especs);
      
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
      setErrores({ general: 'Error al cargar la lista de técnicos. Intenta de nuevo.' });
    } finally {
      setCargando(false);
    }
  };

  // -------------------------------------------------------------------------
  // EFECTO: Filtrar técnicos cuando cambia el filtro de especialidad
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!especialidadFiltro) {
      setTecnicosFiltrados(tecnicos);
    } else {
      setTecnicosFiltrados(
        tecnicos.filter(t => t.especialidad === especialidadFiltro)
      );
    }
  }, [especialidadFiltro, tecnicos]);

  // -------------------------------------------------------------------------
  // FUNCIÓN: Seleccionar un técnico
  // -------------------------------------------------------------------------
  const seleccionarTecnico = (tecnico) => {
    setTecnicoSeleccionado(tecnico);
    // Limpiar error si existía
    if (errores.tecnico) {
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors.tecnico;
        return newErrors;
      });
    }
  };

  // -------------------------------------------------------------------------
  // FUNCIÓN: Guardar y continuar
  // -------------------------------------------------------------------------
  const handleGuardar = () => {
    if (!tecnicoSeleccionado) {
      setErrores({ tecnico: 'Debes seleccionar un técnico para continuar.' });
      return;
    }
    
    // Entregamos el técnico completo al componente padre (NuevoTicket)
    onGuardar(tecnicoSeleccionado);
  };

  // -------------------------------------------------------------------------
  // RENDERIZADO: Estado de carga
  // -------------------------------------------------------------------------
  if (cargando) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando técnicos disponibles...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDERIZADO PRINCIPAL
  // -------------------------------------------------------------------------
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Asignar Técnico
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Selecciona el técnico que se encargará de la reparación.
      </p>

      {/* Error general */}
      {errores.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{errores.general}</p>
        </div>
      )}

      {/* Filtro por especialidad */}
      {especialidades.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por especialidad
          </label>
          <select
            value={especialidadFiltro}
            onChange={(e) => setEspecialidadFiltro(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de técnicos */}
      {tecnicosFiltrados.length === 0 ? (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-700 font-medium mb-2">
            ⚠️ No hay técnicos disponibles
          </p>
          <p className="text-sm text-yellow-600 mb-4">
            No se encontraron técnicos con estado "Disponible".
            Si continúas sin asignar técnico, el ticket quedará en estado RECIBIDO
            y generará una alerta para el supervisor.
          </p>
          <button
            onClick={() => onGuardar(null)} // null = sin técnico asignado
            className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Continuar sin técnico →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tecnicosFiltrados.map(tecnico => {
            const seleccionado = tecnicoSeleccionado?.id === tecnico.id;
            
            return (
              <button
                key={tecnico.id}
                onClick={() => seleccionarTecnico(tecnico)}
                className={`
                  text-left p-5 rounded-xl border-2 transition-all
                  ${seleccionado
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Indicador de selección */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">🔧</span>
                  {seleccionado && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      ✓ SELECCIONADO
                    </span>
                  )}
                </div>

                {/* Nombre del técnico */}
                <h4 className="font-semibold text-gray-800">
                  {tecnico.nombre} {tecnico.apellido}
                </h4>

                {/* Especialidad */}
                {tecnico.especialidad && (
                  <span className={`
                    inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full
                    ${seleccionado ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tecnico.especialidad}
                  </span>
                )}

                {/* Teléfono */}
                <p className="text-xs text-gray-400 mt-3">
                  📱 {tecnico.telefono || 'Sin teléfono'}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Error de validación */}
      {errores.tecnico && (
        <p className="mt-4 text-sm text-red-600 text-center">{errores.tecnico}</p>
      )}

      {/* Técnico seleccionado (resumen) */}
      {tecnicoSeleccionado && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ Técnico asignado: {tecnicoSeleccionado.nombre} {tecnicoSeleccionado.apellido}
            {tecnicoSeleccionado.especialidad && ` (${tecnicoSeleccionado.especialidad})`}
          </p>
        </div>
      )}

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
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {tecnicoSeleccionado ? 'Continuar →' : 'Continuar sin técnico →'}
        </button>
      </div>
    </div>
  );
};

export default PasoTecnico;