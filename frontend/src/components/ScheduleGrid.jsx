import React from 'react';

// Regla de Negocio: Franjas de 90 min con 11 min de descanso
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const FRANJAS = [
  { id: 0, label: "07:00 AM - 08:30 AM" },
  { id: 1, label: "08:41 AM - 10:11 AM" },
  { id: 2, label: "10:22 AM - 11:52 AM" },
  { id: 3, label: "12:03 PM - 01:33 PM" },
  { id: 4, label: "01:44 PM - 03:14 PM" },
  { id: 5, label: "03:25 PM - 04:55 PM" },
  { id: 6, label: "05:06 PM - 06:36 PM" },
  { id: 7, label: "06:47 PM - 08:17 PM" },
  { id: 8, label: "08:28 PM - 09:58 PM" }
];

const ScheduleGrid = ({ asignaciones = [], isDark = true }) => {
  const styles = {
    container: { 
      overflowX: 'auto', 
      padding: '15px', 
      backgroundColor: isDark ? '#1e293b' : '#fff',
      borderRadius: '12px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '160px repeat(6, 1fr)',
      border: isDark ? '1px solid #334155' : '1px solid #ced4da',
      minWidth: '1100px',
      backgroundColor: isDark ? '#0f172a' : '#f8f9fa',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: isDark ? '#1e293b' : '#212529',
      color: isDark ? '#f8fafc' : '#fff',
      padding: '12px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      border: isDark ? '1px solid #334155' : '1px solid #343a40'
    },
    hourCell: {
      padding: '10px',
      fontSize: '0.75rem',
      backgroundColor: isDark ? '#1e293b' : '#e9ecef',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #dee2e6',
      borderRight: isDark ? '2px solid #334155' : '2px solid #adb5bd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      color: isDark ? '#cbd5e1' : '#495057'
    },
    courseCell: {
      borderBottom: isDark ? '1px solid #334155' : '1px solid #dee2e6',
      borderRight: isDark ? '1px solid #334155' : '1px solid #dee2e6',
      minHeight: '120px',
      padding: '6px',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      position: 'relative'
    },
    card: {
      borderRadius: '6px',
      padding: '10px',
      fontSize: '0.75rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    tag: {
      fontSize: '0.65rem',
      fontWeight: '900',
      color: isDark ? '#38bdf8' : '#0d47a1',
      marginBottom: '4px'
    },
    aula: {
      color: isDark ? '#f87171' : '#c62828',
      fontWeight: 'bold',
      marginTop: '4px',
      fontSize: '0.7rem'
    }
  };

  const getAsignacion = (diaIdx, franjaId) => {
    return asignaciones.find(a => a.dia === diaIdx && a.franja === franjaId);
  };

  return (
    <div style={styles.container} data-cy="schedule-grid">
      <div style={styles.grid}>
        {/* Cabecera de Días */}
        <div style={styles.header}>FRANJA HORARIA</div>
        {DIAS.map(dia => (
          <div key={dia} style={styles.header}>{dia.toUpperCase()}</div>
        ))}

        {/* Cuerpo del Calendario */}
        {FRANJAS.map((franja) => (
          <React.Fragment key={franja.id}>
            <div style={styles.hourCell}>{franja.label}</div>
            
            {DIAS.map((_, diaIdx) => {
              const curso = getAsignacion(diaIdx, franja.id);
              const cursoArriba = franja.id > 0 ? getAsignacion(diaIdx, franja.id - 1) : null;
              
              // Lógica de Fusión: ¿Es la continuación del mismo curso el mismo día?
              const esContinuacion = curso && cursoArriba && curso.codigo === cursoArriba.codigo;

              return (
                <div key={`${diaIdx}-${franja.id}`} style={{
                  ...styles.courseCell,
                  borderTop: esContinuacion ? 'none' : '1px solid #dee2e6',
                  paddingTop: esContinuacion ? '0px' : '6px'
                }}>
                  {curso && (
                    <div style={{
                      ...styles.card,
                      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#e3f2fd',
                      borderLeft: isDark ? '4px solid #38bdf8' : '4px solid #1976d2',
                      borderTopLeftRadius: esContinuacion ? '0' : '6px',
                      borderTopRightRadius: esContinuacion ? '0' : '6px',
                      boxShadow: esContinuacion ? 'none' : '0 2px 4px rgba(0,0,0,0.15)',
                      border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : 'none',
                      borderLeftWidth: '4px'
                    }}>
                      {!esContinuacion ? (
                        <>
                          <span style={styles.tag}>NRC: {curso.codigo}</span>
                          <div style={{ fontWeight: '800', color: isDark ? '#e2e8f0' : '#1565c0', lineHeight: '1.2' }}>
                            {curso.nombre.toUpperCase()}
                          </div>
                          <div style={styles.aula}>AULA: {curso.aula}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '6px', color: isDark ? '#94a3b8' : '#555', borderTop: isDark ? '1px solid rgba(56, 189, 248, 0.15)' : '1px solid #bbdefb', paddingTop: '4px' }}>
                            {curso.docente}
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={styles.tag}>NRC: {curso.codigo}</span>
                          <div style={{ fontWeight: '800', color: isDark ? '#e2e8f0' : '#1565c0', lineHeight: '1.2' }}>
                            {curso.nombre.toUpperCase()}
                          </div>
                          <div style={styles.aula}>AULA: {curso.aula}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '6px', color: isDark ? '#94a3b8' : '#555', borderTop: isDark ? '1px solid rgba(56, 189, 248, 0.15)' : '1px solid #bbdefb', paddingTop: '4px' }}>
                            {curso.docente}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
