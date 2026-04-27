import React from 'react';

export const CourseSelector = ({ cursosDisponibles, seleccionados, onToggle, onGenerar, loading }) => {
  const totalCreditos = seleccionados.reduce((acc, curr) => acc + curr.creditos, 0);
  const esValido = totalCreditos >= 20 && totalCreditos <= 22;

  const styles = {
    container: { 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '12px', 
      border: '1px solid #dee2e6',
      marginBottom: '30px'
    },
    chipContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0' },
    chip: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 15px',
      background: '#fff',
      border: '1px solid #ced4da',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: '0.2s'
    },
    btn: {
      padding: '12px 24px',
      backgroundColor: '#2196f3',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '1rem'
    },
    contador: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: esValido ? '#2e7d32' : '#d32f2f'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Selección de Asignaturas</h3>
        <span style={styles.contador}>Créditos: {totalCreditos} / 22</span>
      </div>
      
      <div style={styles.chipContainer}>
        {cursosDisponibles.map(curso => (
          <label key={curso.codigo} style={{
            ...styles.chip,
            backgroundColor: seleccionados.some(s => s.codigo === curso.codigo) ? '#e3f2fd' : '#fff',
            borderColor: seleccionados.some(s => s.codigo === curso.codigo) ? '#2196f3' : '#ced4da'
          }}>
            <input 
              type="checkbox" 
              onChange={() => onToggle(curso)}
              checked={seleccionados.some(s => s.codigo === curso.codigo)}
            />
            {curso.nombre} ({curso.creditos})
          </label>
        ))}
      </div>

      <button 
        onClick={onGenerar}
        disabled={!esValido || loading}
        style={{ ...styles.btn, opacity: (esValido && !loading) ? 1 : 0.5 }}
      >
        {loading ? 'Procesando Algoritmo...' : 'Generar Horario Óptimo'}
      </button>
      
      {!esValido && (
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
          * Selecciona entre 20 y 22 créditos para activar la generación.
        </p>
      )}
    </div>
  );
};
