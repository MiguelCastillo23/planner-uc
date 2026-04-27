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

const ScheduleGrid = ({ asignaciones = [] }) => {
  const styles = {
    container: { overflowX: 'auto', padding: '15px', backgroundColor: '#fff' },
    grid: {
      display: 'grid',
      gridTemplateColumns: '160px repeat(6, 1fr)',
      border: '1px solid #ced4da',
      minWidth: '1100px',
      backgroundColor: '#f8f9fa'
    },
    header: {
      backgroundColor: '#212529',
      color: '#fff',
      padding: '12px',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      border: '1px solid #343a40'
    },
    hourCell: {
      padding: '10px',
      fontSize: '0.75rem',
      backgroundColor: '#e9ecef',
      borderBottom: '1px solid #dee2e6',
      borderRight: '2px solid #adb5bd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      color: '#495057'
    },
    courseCell: {
      borderBottom: '1px solid #dee2e6',
      borderRight: '1px solid #dee2e6',
      minHeight: '120px',
      padding: '6px',
      backgroundColor: '#fff',
      position: 'relative'
    },
    card: {
      borderRadius: '4px',
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
      color: '#0d47a1',
      marginBottom: '4px'
    },
    aula: {
      color: '#c62828',
      fontWeight: 'bold',
      marginTop: '4px',
      fontSize: '0.7rem'
    }
  };

  const getAsignacion = (diaIdx, franjaId) => {
    return asignaciones.find(a => a.dia === diaIdx && a.franja === franjaId);
  };

  return (
    <div style={styles.container}>
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
                      backgroundColor: esContinuacion ? '#e3f2fd' : '#e3f2fd',
                      borderLeft: '4px solid #1976d2',
                      borderTopLeftRadius: esContinuacion ? '0' : '4px',
                      borderTopRightRadius: esContinuacion ? '0' : '4px',
                      boxShadow: esContinuacion ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {!esContinuacion ? (
                        <>
                          <span style={styles.tag}>NRC: {curso.codigo}</span>
                          <div style={{ fontWeight: '800', color: '#1565c0', lineHeight: '1.2' }}>
                            {curso.nombre.toUpperCase()}
                          </div>
                          <div style={styles.aula}>AULA: {curso.aula}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '6px', color: '#555', borderTop: '1px solid #bbdefb', paddingTop: '4px' }}>
                            {curso.docente}
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={styles.tag}>NRC: {curso.codigo}</span>
                          <div style={{ fontWeight: '800', color: '#1565c0', lineHeight: '1.2' }}>
                            {curso.nombre.toUpperCase()}
                          </div>
                          <div style={styles.aula}>AULA: {curso.aula}</div>
                          <div style={{ fontSize: '0.65rem', marginTop: '6px', color: '#555', borderTop: '1px solid #bbdefb', paddingTop: '4px' }}>
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
