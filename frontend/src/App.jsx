import { useState, useEffect } from 'react';
import { CourseSelector } from './components/CourseSelector';
import ScheduleGrid from './components/ScheduleGrid';

function App() {
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar cursos desde la DB al iniciar
  useEffect(() => {
    fetch('http://localhost:3000/api/cursos') // Necesitaremos este endpoint simple
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
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #2196f3', marginBottom: '20px' }}>
        <h1 style={{ color: '#1565c0' }}>Planner UC - Sistema de Horarios</h1>
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
          <ScheduleGrid asignaciones={horario.genes || []} />
        </div>
      )}
    </div>
  );
}

export default App;
