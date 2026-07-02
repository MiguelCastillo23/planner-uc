import React, { useState, useEffect, lazy, Suspense } from 'react';
const ScheduleGrid = lazy(() => import('./ScheduleGrid'));

export const StudentDashboard = ({ 
  estudianteActivo, 
  seccionesDisponibles = [],
  seccionesSeleccionadas = [],
  asistenciaHibrida = {},
  semanaSimulada = 1,
  tipoPeriodo = 'Regular',
  justificacionCargaMinima = false,
  loading = false,
  loadingAsistente = false,
  onToggleSeccion,
  onMatricularse,
  onAutoMatriculaAsistente,
  onSolicitarDirigida,
  onReservarMatricula,
  onRetirarAsignatura,
  onSetAsistenciaHibrida,
  onSetTipoPeriodo,
  onSetSemanaSimulada,
  onSetJustificacionCargaMinima
}) => {
  const [seccionActiva, setSeccionActiva] = useState('matricula'); // 'matricula' | 'expediente' | 'tramites'
  const [selectedDirigidaId, setSelectedDirigidaId] = useState('');
  
  // Computar créditos seleccionados
  const totalCreditos = seccionesSeleccionadas.reduce((acc, id) => {
    const sec = seccionesDisponibles.find(s => s._id === id);
    return acc + (sec?.curso?.creditos || 0);
  }, 0);

  // Mapear asignaciones del estudiante para la grilla
  const asignacionesEstudiante = seccionesDisponibles
    .filter(s => seccionesSeleccionadas.includes(s._id))
    .flatMap(s => s.horario.map(h => ({
      codigo: s.codigo,
      nombre: s.curso?.nombre || 'Curso',
      aula: s.aula?.nombre || 'Virtual',
      docente: s.docente?.nombre || 'Docente',
      dia: h.dia,
      franja: h.franja
    })));

  // Analizar desaprobaciones para alertas
  const desaprobacionesList = [];
  let tieneSegundaDesaprobacion = false;
  let tieneTerceraDesaprobacion = false;
  let tieneCuartaDesaprobacion = false;
  let cursoTerceraCodigo = "";

  if (estudianteActivo.historialDesaprobados) {
    // Si es un objeto de JS común o un Map
    const entries = estudianteActivo.historialDesaprobados instanceof Map 
      ? Array.from(estudianteActivo.historialDesaprobados.entries())
      : Object.entries(estudianteActivo.historialDesaprobados);

    entries.forEach(([codigo, fails]) => {
      if (fails > 0) {
        desaprobacionesList.push({ codigo, fails });
        if (fails >= 4) tieneCuartaDesaprobacion = true;
        if (fails === 3) {
          tieneTerceraDesaprobacion = true;
          cursoTerceraCodigo = codigo;
        }
        if (fails === 2) tieneSegundaDesaprobacion = true;
      }
    });
  }

  // Filtrar secciones para la matrícula (ciclo del alumno)
  const seccionesDelCiclo = seccionesDisponibles.filter(
    s => s.curso?.semestre === estudianteActivo.semestre
  );

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', minHeight: '600px', width: '100%' }}>
      
      {/* SIDEBAR EXPEDIENTE & NAVEGACIÓN */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Panel de Perfil de Alumno */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px auto',
              fontSize: '1.4rem',
              color: '#000',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
            }}>
              {estudianteActivo.nombre ? estudianteActivo.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AL'}
            </div>
            <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '0.95rem', fontWeight: '800' }}>{estudianteActivo.nombre}</h4>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>Código: {estudianteActivo.codigo}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Estudios:</span>
              <span style={{ fontWeight: '600', color: estudianteActivo.planVigente ? '#34d399' : '#f87171' }}>
                {estudianteActivo.planEstudios} {!estudianteActivo.planVigente && '(Inactivo)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Ciclo Actual:</span>
              <span style={{ fontWeight: '600', color: '#38bdf8' }}>{estudianteActivo.semestre}° Ciclo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Aprobados:</span>
              <span style={{ fontWeight: '600' }}>{estudianteActivo.cursosAprobados?.length || 0} cursos</span>
            </div>
            
            {/* Estado de Trámites Financieros */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', fontWeight: 'bold' }}>ESTADO ACADÉMICO-ADMINISTRATIVO:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{
                  padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center',
                  backgroundColor: estudianteActivo.tieneDeudas ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: estudianteActivo.tieneDeudas ? '#fca5a5' : '#a7f3d0'
                }}>
                  {estudianteActivo.tieneDeudas ? '🔴 CON DEUDAS PENDIENTES' : '🟢 DEUDAS SOLVENTADAS'}
                </span>
                <span style={{
                  padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center',
                  backgroundColor: estudianteActivo.tasaPagada ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: estudianteActivo.tasaPagada ? '#a7f3d0' : '#fca5a5'
                }}>
                  {estudianteActivo.tasaPagada ? '🟢 TASA EDUCATIVA PAGADA' : '🔴 TASA IMPAGA'}
                </span>
                <span style={{
                  padding: '3px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textAlign: 'center',
                  backgroundColor: estudianteActivo.seguroVigente ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: estudianteActivo.seguroVigente ? '#a7f3d0' : '#fca5a5'
                }}>
                  {estudianteActivo.seguroVigente ? '🟢 SEGURO ACTIVO' : '🔴 SEGURO EXPIRADO'}
                </span>
              </div>
            </div>

            {/* Estado matrícula actual */}
            {estudianteActivo.estadoMatricula !== 'Ninguno' && (
              <div style={{
                marginTop: '10px',
                padding: '8px',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid',
                backgroundColor: estudianteActivo.estadoMatricula === 'Matriculado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                borderColor: estudianteActivo.estadoMatricula === 'Matriculado' ? '#10b981' : '#f59e0b',
                color: estudianteActivo.estadoMatricula === 'Matriculado' ? '#34d399' : '#fde68a',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}>
                MATRÍCULA: {estudianteActivo.estadoMatricula.toUpperCase()}
              </div>
            )}

          </div>
        </div>

        {/* Menú de Botones de Pestañas */}
        <div className="glass-panel" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={() => setSeccionActiva('matricula')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'left',
              backgroundColor: seccionActiva === 'matricula' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: seccionActiva === 'matricula' ? '#10b981' : '#cbd5e1',
              borderLeft: seccionActiva === 'matricula' ? '3px solid #10b981' : '3px solid transparent',
              paddingLeft: seccionActiva === 'matricula' ? '13px' : '16px'
            }}
          >
            <span>📝</span>
            <span>Matrícula de Ciclo</span>
          </button>

          <button
            onClick={() => setSeccionActiva('expediente')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'left',
              backgroundColor: seccionActiva === 'expediente' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: seccionActiva === 'expediente' ? '#10b981' : '#cbd5e1',
              borderLeft: seccionActiva === 'expediente' ? '3px solid #10b981' : '3px solid transparent',
              paddingLeft: seccionActiva === 'expediente' ? '13px' : '16px'
            }}
          >
            <span>🎓</span>
            <span>Expediente Alumno</span>
          </button>

          <button
            onClick={() => setSeccionActiva('tramites')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              textAlign: 'left',
              backgroundColor: seccionActiva === 'tramites' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: seccionActiva === 'tramites' ? '#10b981' : '#cbd5e1',
              borderLeft: seccionActiva === 'tramites' ? '3px solid #10b981' : '3px solid transparent',
              paddingLeft: seccionActiva === 'tramites' ? '13px' : '16px'
            }}
          >
            <span>💼</span>
            <span>Trámites Académicos</span>
          </button>
        </div>

      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Banner de Ayuda / Info */}
        <div className="glass-panel-cyan animate-fade-in" style={{
          padding: '15px 20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.04) 100%)',
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '2rem' }}>🎓</span>
          <div>
            <h4 style={{ margin: '0 0 3px 0', color: '#34d399', fontSize: '0.95rem', fontWeight: '800' }}>
              {seccionActiva === 'matricula' && 'Matrícula Asistida y Simulación'}
              {seccionActiva === 'expediente' && 'Expediente e Historial Académico'}
              {seccionActiva === 'tramites' && 'Trámites de Reserva, Dirigida y Retiros'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
              {seccionActiva === 'matricula' && 'Seleccione las secciones que correspondan a su ciclo. Puede usar el Asistente Genético Inteligente para autoseleccionar una combinación de secciones compacta y sin ningún cruce de horario.'}
              {seccionActiva === 'expediente' && 'Visualice su avance curricular en Planner-UC. Verifique las asignaturas aprobadas de ciclos anteriores y los límites en cursos repetidos para evitar bloqueos del sistema.'}
              {seccionActiva === 'tramites' && 'Gestione sus trámites de matrícula. Recuerde que el reglamento estipula fechas estrictas para la Reserva del ciclo (Semana 2) y para el Retiro de asignaturas (Semana 7 o 14).'}
            </p>
          </div>
        </div>

        {/* 1. SECCIÓN MATRÍCULA */}
        {seccionActiva === 'matricula' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Controles de Configuración de la Simulación */}
            <div className="glass-panel" style={{ display: 'flex', gap: '20px', padding: '16px 20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Periodo Académico</span>
                <select 
                  value={tipoPeriodo} 
                  onChange={(e) => onSetTipoPeriodo(e.target.value)}
                  disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Regular">Ciclo Regular (Marzo-Diciembre)</option>
                  <option value="Verano">Ciclo de Verano (Enero-Feb)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Semana del Ciclo Simulada:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#38bdf8' }}>Semana {semanaSimulada}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="16" 
                  value={semanaSimulada} 
                  onChange={(e) => onSetSemanaSimulada(parseInt(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="excCarga" 
                  checked={justificacionCargaMinima}
                  onChange={(e) => onSetJustificacionCargaMinima(e.target.checked)}
                  disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: '#10b981' }}
                />
                <label htmlFor="excCarga" style={{ fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  Justificar carga inferior a 12 créditos (Egresante)
                </label>
              </div>
            </div>

            {/* Listado de Asignaturas Disponibles */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.2rem', fontWeight: '800' }}>Selección de Cursos de Semestre</h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Solo se muestran los cursos correspondientes a su nivel ({estudianteActivo.semestre}° Ciclo).
                  </p>
                </div>

                <span 
                  data-cy="credits-counter"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    border: '1px solid',
                    backgroundColor: totalCreditos >= 12 && totalCreditos <= 25 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    borderColor: totalCreditos >= 12 && totalCreditos <= 25 ? '#10b981' : '#f43f5e',
                    color: totalCreditos >= 12 && totalCreditos <= 25 ? '#34d399' : '#f87171'
                  }}
                >
                  Créditos Seleccionados: {totalCreditos}
                </span>
              </div>

              {/* Alertas preventivas en el panel de carga de créditos */}
              {tieneSegundaDesaprobacion && totalCreditos > 16 && (
                <div style={{ padding: '10px 15px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', color: '#fde68a', fontSize: '0.75rem', marginBottom: '15px' }}>
                  ⚠️ <strong>Restricción Activa:</strong> Tiene un curso repetido por segunda vez. Su límite máximo está bloqueado a 16 créditos. Reduzca sus cursos.
                </div>
              )}
              {tieneTerceraDesaprobacion && (
                <div style={{ padding: '10px 15px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.12)', border: '1px solid #f43f5e', color: '#fca5a5', fontSize: '0.75rem', marginBottom: '15px' }}>
                  🚫 <strong>Separación Temporal (3ra Repetición):</strong> Solo puede matricularse en el curso desaprobado: <strong>{cursoTerceraCodigo}</strong>. No seleccione otras asignaturas.
                </div>
              )}

              {/* Tabla/Lista de Secciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
                {seccionesDelCiclo.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    No hay asignaturas abiertas del ciclo {estudianteActivo.semestre} en el sistema del administrador.
                  </div>
                ) : (
                  seccionesDelCiclo.map(sec => {
                    const isSelected = seccionesSeleccionadas.includes(sec._id);
                    const esHibrido = sec.curso?.modalidad === 'Híbrido' || sec.curso?.modalidad === 'Hibrido';
                    
                    return (
                      <div key={sec._id} style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1px solid',
                        background: isSelected ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0, 0, 0, 0.2)',
                        borderColor: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: '0.2s'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleSeccion(sec._id)}
                              disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                              data-cy={`section-checkbox-${sec.codigo}`}
                              style={{ transform: 'scale(1.25)', cursor: 'pointer', accentColor: '#10b981' }}
                            />
                            <div>
                              <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>
                                {sec.curso?.nombre} ({sec.curso?.creditos} Créditos)
                              </strong>
                              
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span>NRC: <code style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{sec.codigo}</code></span>
                                <span>Aula: {sec.aula?.nombre}</span>
                                <span>Docente: {sec.docente?.nombre}</span>
                                <span style={{
                                  fontWeight: 'bold',
                                  color: sec.vacantesDisponibles > 5 ? '#34d399' : '#f43f5e'
                                }}>
                                  Vacantes: {sec.vacantesDisponibles} / {sec.vacantesTotales}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                              Ciclo {sec.curso?.semestre}
                            </span>
                            <span style={{
                              fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
                              backgroundColor: esHibrido ? 'rgba(139, 92, 246, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: esHibrido ? '#c084fc' : '#38bdf8'
                            }}>
                              {sec.curso?.modalidad}
                            </span>
                          </div>

                        </div>

                        {/* Selección de Asistencia para Híbridos */}
                        {esHibrido && isSelected && (
                          <div style={{ 
                            marginLeft: '26px', 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(0, 0, 0, 0.25)', 
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                          }}>
                            <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 'bold' }}>Preferencia Asistencia Híbrida:</span>
                            <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`asistencia-${sec._id}`} 
                                value="Física"
                                checked={asistenciaHibrida[sec._id] === 'Física'}
                                onChange={() => onSetAsistenciaHibrida(prev => ({ ...prev, [sec._id]: 'Física' }))}
                                disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                                style={{ accentColor: '#c084fc' }}
                              />
                              🏛️ Presencial (Física)
                            </label>
                            <label style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`asistencia-${sec._id}`} 
                                value="Remota"
                                checked={asistenciaHibrida[sec._id] === 'Remota'}
                                onChange={() => onSetAsistenciaHibrida(prev => ({ ...prev, [sec._id]: 'Remota' }))}
                                disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                                style={{ accentColor: '#c084fc' }}
                              />
                              💻 Remota (Virtual)
                            </label>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

              {/* Botonera de Acción de Matrícula */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={onMatricularse}
                  disabled={loading || estudianteActivo.estadoMatricula === 'Matriculado'}
                  data-cy="confirm-matricula-button"
                  className="btn-cyber-primary"
                  style={{
                    flexGrow: 1,
                    padding: '14px 24px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: (loading || estudianteActivo.estadoMatricula === 'Matriculado') ? 0.5 : 1
                  }}
                >
                  {loading ? 'Formalizando Matrícula...' : 'Confirmar Matrícula Oficial'}
                </button>

                <button
                  onClick={onAutoMatriculaAsistente}
                  disabled={loadingAsistente || estudianteActivo.estadoMatricula === 'Matriculado'}
                  data-cy="genetic-assistant-button"
                  style={{
                    padding: '14px 24px',
                    borderRadius: '10px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    background: 'rgba(56, 189, 248, 0.05)',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    opacity: (loadingAsistente || estudianteActivo.estadoMatricula === 'Matriculado') ? 0.5 : 1
                  }}
                >
                  {loadingAsistente ? 'Analizando Cruces...' : '✨ Asistente Genético de Horario'}
                </button>
              </div>

            </div>

            {/* Vista del Horario Académico */}
            {seccionesSeleccionadas.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: '800' }}>Grilla Semanal de Horario Generado</h3>
                <div style={{ overflowX: 'auto' }}>
                  <Suspense fallback={<div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Cargando grilla...</div>}>
                    <ScheduleGrid asignaciones={asignacionesEstudiante} isDark={true} />
                  </Suspense>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 2. SECCIÓN EXPEDIENTE */}
        {seccionActiva === 'expediente' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Avance curricular de créditos */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Avance Académico Estimado</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>
                  {((estudianteActivo.cursosAprobados?.length || 0) * 3)} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>de 220 créditos obligatorios</span>
                </span>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold' }}>
                  {(((estudianteActivo.cursosAprobados?.length || 0) * 3 / 220) * 100).toFixed(1)}% completado
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                <div style={{
                  width: `${(((estudianteActivo.cursosAprobados?.length || 0) * 3 / 220) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Cursos Aprobados */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '0.95rem', fontWeight: '800' }}>📚 Asignaturas Aprobadas ({estudianteActivo.cursosAprobados?.length || 0})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {estudianteActivo.cursosAprobados?.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', padding: '20px' }}>Ningún curso aprobado registrado.</div>
                  ) : (
                    estudianteActivo.cursosAprobados?.map(codigo => (
                      <div key={codigo} style={{
                        padding: '10px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#cbd5e1' }}>{codigo}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 'bold' }}>
                          APROBADO
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cursos Repetidos/Desaprobados */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '0.95rem', fontWeight: '800' }}>⚠️ Historial de Desaprobaciones</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {desaprobacionesList.length === 0 ? (
                    <div style={{ color: '#34d399', fontSize: '0.75rem', textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px' }}>
                      🎉 Excelente. No cuenta con asignaturas desaprobadas registradas.
                    </div>
                  ) : (
                    desaprobacionesList.map(item => {
                      let color = '#34d399';
                      let bg = 'rgba(16, 185, 129, 0.15)';
                      let msg = 'Intento 2';
                      
                      if (item.fails === 2) {
                        color = '#fde68a';
                        bg = 'rgba(245, 158, 11, 0.15)';
                        msg = 'Límite 16 Créditos (Intento 3)';
                      } else if (item.fails >= 3) {
                        color = '#fca5a5';
                        bg = 'rgba(244, 63, 94, 0.15)';
                        msg = 'Separación en Curso (Intento 4)';
                      }

                      return (
                        <div key={item.codigo} style={{
                          padding: '10px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#cbd5e1' }}>{item.codigo}</span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Desaprobado: {item.fails} {item.fails === 1 ? 'vez' : 'veces'}</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: bg, color, fontWeight: 'bold' }}>
                            {msg}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. SECCIÓN TRÁMITES */}
        {seccionActiva === 'tramites' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* TRÁMITE RESERVA */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1rem', fontWeight: '800' }}>📅 Reserva de Matrícula Completa</h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '15px' }}>
                    Permite congelar el ciclo académico conservando sus vacantes. El reglamento estipula que solo se permite procesar reservas hasta la **Semana 2**.
                  </p>
                  
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.15)', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '15px' }}>
                    <span>Semana de Simulación: <strong>Semana {semanaSimulada}</strong></span>
                    <br />
                    <span>Estado para Reserva: 
                      {semanaSimulada <= 2 
                        ? <strong style={{ color: '#34d399' }}> ✔️ DENTRO DEL PLAZO</strong> 
                        : <strong style={{ color: '#f43f5e' }}> ✖️ PLAZO EXPIRADO</strong>
                      }
                    </span>
                  </div>
                </div>

                <button
                  onClick={onReservarMatricula}
                  disabled={semanaSimulada > 2 || estudianteActivo.estadoMatricula === 'Reservado'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    color: '#f59e0b',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity: (semanaSimulada > 2 || estudianteActivo.estadoMatricula === 'Reservado') ? 0.45 : 1
                  }}
                >
                  {estudianteActivo.estadoMatricula === 'Reservado' ? 'Ciclo ya Reservado' : 'Formalizar Reserva de Ciclo'}
                </button>
              </div>

              {/* TRÁMITE ASIGNATURA DIRIGIDA */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1rem', fontWeight: '800' }}>📝 Solicitud de Curso Dirigido</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '12px' }}>
                  Lleve una asignatura de forma individual y autodidacta con tutorías. Límite de **3 asignaturas dirigidas** en su vida estudiantil.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Dirigidas cursadas:</span>
                    <strong>{estudianteActivo.cantidadDirigidos || 0} / 3</strong>
                  </div>
                  {estudianteActivo.cantidadDirigidos >= 3 && (
                    <span style={{ color: '#fca5a5', fontSize: '0.7rem' }}>🚫 Ha alcanzado el límite máximo de cursos dirigidos.</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={selectedDirigidaId}
                    onChange={(e) => setSelectedDirigidaId(e.target.value)}
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Seleccione curso...</option>
                    {seccionesDelCiclo
                      .filter((val, idx, arr) => arr.findIndex(t => t.curso?._id === val.curso?._id) === idx)
                      .map(sec => (
                        <option key={sec._id} value={sec.curso?._id}>{sec.curso?.nombre}</option>
                      ))}
                  </select>
                  
                  <button
                    onClick={() => {
                      if (selectedDirigidaId) {
                        onSolicitarDirigida(selectedDirigidaId);
                        setSelectedDirigidaId('');
                      }
                    }}
                    disabled={!selectedDirigidaId || estudianteActivo.cantidadDirigidos >= 3}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#8b5cf6',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      opacity: (!selectedDirigidaId || estudianteActivo.cantidadDirigidos >= 3) ? 0.5 : 1
                    }}
                  >
                    Solicitar
                  </button>
                </div>
              </div>

            </div>

            {/* SECCIÓN RETIROS DE ASIGNATURAS INDIVIDUALES */}
            {estudianteActivo.estadoMatricula === 'Matriculado' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: '800' }}>🗑️ Retiro de Asignaturas Matriculadas</h3>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '15px' }}>
                  El retiro de asignaturas individuales está regulado por la modalidad: presenciales/híbridos hasta la **Semana 14** y cursos virtuales/distancia hasta la **Semana 7**.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {seccionesDisponibles
                    .filter(s => seccionesSeleccionadas.includes(s._id))
                    .map(sec => {
                      const modalidad = sec.curso?.modalidad;
                      const limiteSem = (modalidad === 'Semipresencial' || modalidad === 'Distancia') ? 7 : 14;
                      const estaVencido = semanaSimulada > limiteSem;

                      return (
                        <div key={sec._id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(0, 0, 0, 0.2)',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '600' }}>{sec.curso?.nombre}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              Modalidad: {modalidad} (Plazo Máx: Semana {limiteSem})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {estaVencido ? (
                              <span style={{ fontSize: '0.7rem', color: '#f43f5e', fontWeight: 'bold' }}>PLAZO VENCIDO</span>
                            ) : (
                              <button
                                onClick={() => onRetirarAsignatura(sec._id)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                                  border: '1px solid #f43f5e',
                                  color: '#fca5a5',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Retirar Curso
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
};
