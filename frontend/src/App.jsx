import { useState, useEffect, lazy, Suspense } from 'react';
import { CourseSelector } from './components/CourseSelector';

// Carga perezosa del componente ScheduleGrid para ahorrar ancho de banda inicial
const ScheduleGrid = lazy(() => import('./components/ScheduleGrid'));

function App() {
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar cursos desde la DB al iniciar
  useEffect(() => {
    fetch('http://localhost:3000/api/cursos')
      .then(res => res.json())
      .then(data => setCursosDisponibles(data));
  }, []);

  const handleToggleCurso = (curso) => {
    setSeleccionados(prev => 
      prev.find(c => c.codigo === curso.codigo)
        ? prev.filter(c => c.codigo !== curso.codigo)
        : [...prev, curso]
    );
  };

  const generar = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/horarios/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursos: seleccionados })
      });
      const data = await response.json();
      setHorario(data);
    } catch (err) {
      console.error("Error al generar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '2px solid #10b981', 
        paddingBottom: '15px',
        marginBottom: '25px' 
      }}>
        <div>
          <h1 style={{ color: '#0f172a', margin: 0, fontSize: '1.8rem' }}>Planner UC - Sistema de Horarios</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Planificación académica eficiente</p>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          backgroundColor: '#ecfdf5', 
          border: '1px solid #a7f3d0', 
          padding: '8px 16px', 
          borderRadius: '20px',
          color: '#065f46',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          <span style={{ fontSize: '1.1rem' }}>🌱</span>
          <span>Aplicación Optimizada (Green MERN)</span>
        </div>
      </header>

      <CourseSelector 
        cursosDisponibles={cursosDisponibles}
        seleccionados={seleccionados}
        onToggle={handleToggleCurso}
        onGenerar={generar}
        loading={loading}
      />

      {horario && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#444' }}>
            Mejor Horario Generado (Fitness: {horario.fitness?.toFixed(4) || "0.0000"})
          </h2>
          <Suspense fallback={<div style={{ color: '#666', padding: '20px', textAlign: 'center' }}>Cargando vista del horario...</div>}>
            <ScheduleGrid asignaciones={horario.genes || []} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;
