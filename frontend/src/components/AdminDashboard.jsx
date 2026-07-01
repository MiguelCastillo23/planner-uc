import React, { useState, useEffect, lazy, Suspense } from 'react';
const ScheduleGrid = lazy(() => import('./ScheduleGrid'));

export const useDashboardMetrics = (estudiantesSimulados = [], seccionesDisponibles = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalAlumnos: 0,
    matriculados: 0,
    porcentajeMatriculados: 0,
    totalVacantesOfrecidas: 0,
    vacantesDisponibles: 0,
    vacantesOcupadas: 0,
    porcentajeOcupacionAulas: 0
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      if (!active) return;
      try {
        const totalAlumnos = estudiantesSimulados.length;
        const matriculados = estudiantesSimulados.filter(e => e.estadoMatricula === 'Matriculado').length;
        const porcentajeMatriculados = totalAlumnos > 0 ? Math.round((matriculados / totalAlumnos) * 100) : 0;

        let totalVacantesOfrecidas = 0;
        let vacantesDisponibles = 0;
        seccionesDisponibles.forEach(sec => {
          totalVacantesOfrecidas += (sec.vacantesTotales || 0);
          vacantesDisponibles += (sec.vacantesDisponibles || 0);
        });
        const vacantesOcupadas = totalVacantesOfrecidas - vacantesDisponibles;
        const porcentajeOcupacionAulas = totalVacantesOfrecidas > 0 ? Math.round((vacantesOcupadas / totalVacantesOfrecidas) * 100) : 0;

        setMetrics({
          totalAlumnos,
          matriculados,
          porcentajeMatriculados,
          totalVacantesOfrecidas,
          vacantesDisponibles,
          vacantesOcupadas,
          porcentajeOcupacionAulas
        });
      } catch (err) {
        setError(err.message || 'Error calculando métricas');
      } finally {
        setLoading(false);
      }
    }, 50);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [estudiantesSimulados, seccionesDisponibles]);

  return { ...metrics, loading, error };
};

export const AdminDashboard = ({ 
  estudiantesSimulados = [], 
  seccionesDisponibles = [], 
  onActualizarPago, 
  onGenerarGlobal, 
  loading 
}) => {
  const {
    totalAlumnos,
    matriculados,
    porcentajeMatriculados,
    totalVacantesOfrecidas,
    vacantesDisponibles,
    vacantesOcupadas,
    porcentajeOcupacionAulas,
    loading: metricsLoading,
    error: metricsError
  } = useDashboardMetrics(estudiantesSimulados, seccionesDisponibles);

  const [seccionActiva, setSeccionActiva] = useState('kpis'); // 'kpis' | 'programacion' | 'alumnos' | 'mantenimiento' | 'ecologia'
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [ecoMetrics, setEcoMetrics] = useState({ totalRequests: 0, co2Total: 0, bytesTotal: 0 });
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [subVistaProgramacion, setSubVistaProgramacion] = useState('general'); // 'general' | 'curso' | 'docente' | 'aula'
  const [selectedCursoId, setSelectedCursoId] = useState('');
  const [selectedDocenteId, setSelectedDocenteId] = useState('');
  const [selectedAulaId, setSelectedAulaId] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Mantenimiento CRUD state
  const [subMantenimiento, setSubMantenimiento] = useState('carreras'); // 'carreras' | 'cursos' | 'docentes' | 'aulas'
  const [carreraEditando, setCarreraEditando] = useState(null);
  const [carreraForm, setCarreraForm] = useState({ nombre: '', codigo: '' });

  const [cursoEditando, setCursoEditando] = useState(null);
  const [cursoForm, setCursoForm] = useState({ nombre: '', codigo: '', creditos: 3, semestre: 1, prerrequisitos: '', modalidad: 'Presencial', carrera: '' });

  const [docenteEditando, setDocenteEditando] = useState(null);
  const [docenteForm, setDocenteForm] = useState({ nombre: '', especialidad: '' });

  const [aulaEditando, setAulaEditando] = useState(null);
  const [aulaForm, setAulaForm] = useState({ nombre: '', capacidad: 30, tipo: 'Teoría' });

  const fetchInfraestructura = async () => {
    setConnectionError(false);
    try {
      const [resCur, resDoc, resAul, resCar] = await Promise.all([
        fetch('http://localhost:3000/api/cursos'),
        fetch('http://localhost:3000/api/docentes'),
        fetch('http://localhost:3000/api/aulas'),
        fetch('http://localhost:3000/api/carreras')
      ]);
      const dataCur = await resCur.json();
      const dataDoc = await resDoc.json();
      const dataAul = await resAul.json();
      const dataCar = await resCar.json();
      setCursos(Array.isArray(dataCur) ? dataCur : []);
      setDocentes(Array.isArray(dataDoc) ? dataDoc : []);
      setAulas(Array.isArray(dataAul) ? dataAul : []);
      setCarreras(Array.isArray(dataCar) ? dataCar : []);
      setConnectionError(false);
    } catch (error) {
      console.error("Error al cargar infraestructura:", error);
      setConnectionError(true);
    }
  };

  useEffect(() => {
    fetchInfraestructura();
  }, [seccionesDisponibles]);

  // CRUD Carreras
  const handleEditCarrera = (carrera) => {
    setCarreraEditando(carrera._id);
    setCarreraForm({ nombre: carrera.nombre, codigo: carrera.codigo });
  };

  const handleSaveCarrera = async (e) => {
    e.preventDefault();
    try {
      const method = carreraEditando ? 'PUT' : 'POST';
      const url = carreraEditando 
        ? `http://localhost:3000/api/admin/carreras/${carreraEditando}` 
        : 'http://localhost:3000/api/admin/carreras';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carreraForm)
      });
      const data = await res.json();
      if (data.success || data.carrera) {
        fetchInfraestructura();
        setCarreraForm({ nombre: '', codigo: '' });
        setCarreraEditando(null);
      }
    } catch (err) {
      console.error("Error al guardar carrera:", err);
    }
  };

  const handleDeleteCarrera = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta carrera?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/carreras/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchInfraestructura();
      }
    } catch (err) {
      console.error("Error al eliminar carrera:", err);
    }
  };

  // CRUD Cursos
  const handleEditCurso = (curso) => {
    setCursoEditando(curso._id);
    setCursoForm({
      nombre: curso.nombre,
      codigo: curso.codigo,
      creditos: curso.creditos,
      semestre: curso.semestre,
      prerrequisitos: (curso.prerrequisitos || []).join(', '),
      modalidad: curso.modalidad || 'Presencial',
      carrera: curso.carrera?._id || curso.carrera || ''
    });
  };

  const handleSaveCurso = async (e) => {
    e.preventDefault();
    try {
      const method = cursoEditando ? 'PUT' : 'POST';
      const url = cursoEditando 
        ? `http://localhost:3000/api/admin/cursos/${cursoEditando}` 
        : 'http://localhost:3000/api/admin/cursos';

      const body = {
        ...cursoForm,
        prerrequisitos: cursoForm.prerrequisitos.split(',').map(s => s.trim()).filter(Boolean),
        carrera: cursoForm.carrera || null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success || data.curso) {
        fetchInfraestructura();
        setCursoForm({ nombre: '', codigo: '', creditos: 3, semestre: 1, prerrequisitos: '', modalidad: 'Presencial', carrera: '' });
        setCursoEditando(null);
      }
    } catch (err) {
      console.error("Error al guardar curso:", err);
    }
  };

  const handleDeleteCurso = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este curso?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/cursos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchInfraestructura();
      }
    } catch (err) {
      console.error("Error al eliminar curso:", err);
    }
  };

  // CRUD Docentes
  const handleEditDocente = (docente) => {
    setDocenteEditando(docente._id);
    setDocenteForm({
      nombre: docente.nombre,
      especialidad: (docente.especialidad || []).join(', ')
    });
  };

  const handleSaveDocente = async (e) => {
    e.preventDefault();
    try {
      const method = docenteEditando ? 'PUT' : 'POST';
      const url = docenteEditando 
        ? `http://localhost:3000/api/admin/docentes/${docenteEditando}` 
        : 'http://localhost:3000/api/admin/docentes';

      const body = {
        nombre: docenteForm.nombre,
        especialidad: docenteForm.especialidad.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success || data.docente) {
        fetchInfraestructura();
        setDocenteForm({ nombre: '', especialidad: '' });
        setDocenteEditando(null);
      }
    } catch (err) {
      console.error("Error al guardar docente:", err);
    }
  };

  const handleDeleteDocente = async (id) => {
    if (!window.confirm("¿Seguro de eliminar este docente?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/docentes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchInfraestructura();
      }
    } catch (err) {
      console.error("Error al eliminar docente:", err);
    }
  };

  // CRUD Aulas
  const handleEditAula = (aula) => {
    setAulaEditando(aula._id);
    setAulaForm({
      nombre: aula.nombre,
      capacidad: aula.capacidad || 30,
      tipo: aula.tipo || 'Teoría'
    });
  };

  const handleSaveAula = async (e) => {
    e.preventDefault();
    try {
      const method = aulaEditando ? 'PUT' : 'POST';
      const url = aulaEditando 
        ? `http://localhost:3000/api/admin/aulas/${aulaEditando}` 
        : 'http://localhost:3000/api/admin/aulas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aulaForm)
      });
      const data = await res.json();
      if (data.success || data.aula) {
        fetchInfraestructura();
        setAulaForm({ nombre: '', capacidad: 30, tipo: 'Teoría' });
        setAulaEditando(null);
      }
    } catch (err) {
      console.error("Error al guardar aula:", err);
    }
  };

  const handleDeleteAula = async (id) => {
    if (!window.confirm("¿Seguro de eliminar esta aula?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/aulas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchInfraestructura();
      }
    } catch (err) {
      console.error("Error al eliminar aula:", err);
    }
  };

  // Cargar métricas de impacto ambiental desde el backend
  const fetchEcoMetrics = async () => {
    try {
      const res = await fetch('http://localhost:3000/environmental-impact');
      const text = await res.text();
      const matchRequests = text.match(/Total solicitudes procesadas:.*?(\d+)/i);
      const matchCo2 = text.match(/CO2 Total generado:.*?([\d.]+)\s*gramos/i);
      const matchBytes = text.match(/Solicitud promedio.*?(\d+)\s*Bytes/i);

      const requests = matchRequests ? parseInt(matchRequests[1], 10) : 0;
      const co2 = matchCo2 ? parseFloat(matchCo2[1]) : 0;
      const bytes = matchBytes ? parseInt(matchBytes[1], 10) * requests : 0;

      setEcoMetrics({
        totalRequests: requests,
        co2Total: co2,
        bytesTotal: bytes
      });
    } catch (err) {
      console.error("Fallo al obtener métricas eco:", err);
    }
  };

  useEffect(() => {
    fetchEcoMetrics();
    const interval = setInterval(fetchEcoMetrics, 10000); // Actualizar cada 10s
    return () => clearInterval(interval);
  }, []);

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantesSimulados.filter(est => 
    est.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase()) ||
    est.codigo.toLowerCase().includes(busquedaAlumno.toLowerCase())
  );

  const menuItems = [
    { id: 'kpis', label: '📊 KPIs y Analíticas', icon: '📈' },
    { id: 'programacion', label: '🗓️ Programación Horaria', icon: '📅' },
    { id: 'alumnos', label: '💳 Control de Estudiantes', icon: '👤' },
    { id: 'mantenimiento', label: '🛠️ Mantenimiento Académico', icon: '⚙️' },
    { id: 'ecologia', label: '🌱 Impacto Green Software', icon: '⚡' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', minHeight: '600px' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="glass-panel" style={{ 
        padding: '20px', 
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignSelf: 'start'
      }}>
        {/* Profile Admin Badge */}
        <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '15px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            fontSize: '1.3rem',
            color: '#000',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.25)'
          }}>
            AD
          </div>
          <h4 style={{ margin: '0 0 2px 0', color: '#f8fafc', fontSize: '0.9rem', fontWeight: '700' }}>Administrador</h4>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 'bold' }}>
            CONTROL ACADÉMICO
          </span>
        </div>

        <h4 style={{ margin: '0 0 10px 10px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menú Admin</h4>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSeccionActiva(item.id)}
            data-cy={`tab-${item.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              textAlign: 'left',
              transition: '0.2s',
              backgroundColor: seccionActiva === item.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: seccionActiva === item.id ? '#38bdf8' : '#cbd5e1',
              borderLeft: seccionActiva === item.id ? '3px solid #38bdf8' : '3px solid transparent',
              paddingLeft: seccionActiva === item.id ? '13px' : '16px'
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      {/* DASHBOARD CONTENT WORKSPACE */}
      <main className="glass-panel" style={{ 
        padding: '24px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
      }}>

        {/* Error de conexión con el servidor (Global para el dashboard) */}
        {connectionError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#fca5a5',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <strong style={{ display: 'block', color: '#fca5a5', fontSize: '0.95rem' }}>Error de Conexión con el Servidor</strong>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  No se pudo establecer comunicación con el backend (http://localhost:3000). Asegúrate de que el servidor Express esté encendido.
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                setRetrying(true);
                await fetchInfraestructura();
                setRetrying(false);
              }}
              disabled={retrying}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                cursor: 'pointer',
                opacity: retrying ? 0.6 : 1,
                transition: '0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{retrying ? '🔄' : '🔁'}</span>
              <span>{retrying ? 'Reintentando...' : 'Reintentar Conexión'}</span>
            </button>
          </div>
        )}

        {/* 1. SECCIÓN KPIs */}
        {seccionActiva === 'kpis' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>Panel de KPIs y Estado de la Universidad</h3>
            
            {metricsLoading && (
              <div role="status" aria-label="loading-metrics" style={{ color: '#38bdf8', padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                Cargando métricas del dashboard...
              </div>
            )}

            {metricsError && (
              <div role="alert" aria-label="error-metrics" style={{ color: '#ef4444', padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                Error al cargar métricas: {metricsError}
              </div>
            )}

            {!metricsLoading && !metricsError && (
              <>
                {/* GRID DE CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tasa de Matrícula</span>
                    <h2 style={{ margin: '10px 0 5px 0', color: '#38bdf8', fontSize: '2rem', fontWeight: 'bold' }}>{porcentajeMatriculados}%</h2>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{matriculados} de {totalAlumnos} alumnos matriculados</p>
                  </div>
                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Ocupación de Aulas</span>
                    <h2 style={{ margin: '10px 0 5px 0', color: '#10b981', fontSize: '2rem', fontWeight: 'bold' }}>{porcentajeOcupacionAulas}%</h2>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{vacantesOcupadas} vacantes ocupadas físicas</p>
                  </div>
                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Oferta Académica</span>
                    <h2 style={{ margin: '10px 0 5px 0', color: '#c084fc', fontSize: '2rem', fontWeight: 'bold' }}>{seccionesDisponibles.length}</h2>
                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Secciones programadas en 10 ciclos</p>
                  </div>
                </div>

                {/* DETALLES DE CAPACIDAD Y ESTADO */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#f8fafc', fontSize: '0.95rem' }}>Aforo y Vacantes por Sección</h4>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Vacantes Ofertadas:</span>
                        <span style={{ fontWeight: 'bold' }}>{totalVacantesOfrecidas}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Vacantes Disponibles:</span>
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>{vacantesDisponibles}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Inscritos:</span>
                        <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{vacantesOcupadas}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#f8fafc', fontSize: '0.95rem' }}>Rendimiento del Plan Académico</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '10px' }}>
                      La distribución actual de horarios minimiza los cruces. Las secciones están preestablecidas para evitar traslapes del profesorado y aulas físicas.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>🏆</span>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600' }}>Algoritmo Genético optimizado</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. SECCIÓN PROGRAMACIÓN HORARIA */}
        {seccionActiva === 'programacion' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>Oferta Académica y Programación</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Visualiza la infraestructura académica y gestiona la generación algorítmica de horarios.</p>
              </div>
              <button 
                onClick={onGenerarGlobal}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1,
                  fontSize: '0.9rem',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                }}
              >
                {loading ? 'Generando...' : '🛠️ Generar Horarios Globales'}
              </button>
            </div>

            {/* KPI Cards de Infraestructura */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' }}>
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>📚</span>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Cursos Registrados</span>
                  <h3 style={{ margin: '5px 0 0 0', color: '#38bdf8', fontSize: '1.5rem', fontWeight: 'bold' }}>{cursos.length}</h3>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>👨‍🏫</span>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Docentes Activos</span>
                  <h3 style={{ margin: '5px 0 0 0', color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{docentes.length}</h3>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '2rem' }}>🏫</span>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Aulas y Labs</span>
                  <h3 style={{ margin: '5px 0 0 0', color: '#c084fc', fontSize: '1.5rem', fontWeight: 'bold' }}>{aulas.length}</h3>
                </div>
              </div>
            </div>

            {/* Sub-navegación por Filtros de Horario */}
            <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '6px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #334155', width: 'fit-content' }}>
              <button 
                onClick={() => setSubVistaProgramacion('general')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: subVistaProgramacion === 'general' ? '#38bdf8' : 'transparent',
                  color: subVistaProgramacion === 'general' ? '#0f172a' : '#94a3b8',
                  boxShadow: subVistaProgramacion === 'general' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                📋 Vista General
              </button>
              <button 
                onClick={() => setSubVistaProgramacion('curso')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: subVistaProgramacion === 'curso' ? '#38bdf8' : 'transparent',
                  color: subVistaProgramacion === 'curso' ? '#0f172a' : '#94a3b8',
                  boxShadow: subVistaProgramacion === 'curso' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                📚 Por Curso
              </button>
              <button 
                onClick={() => setSubVistaProgramacion('docente')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: subVistaProgramacion === 'docente' ? '#38bdf8' : 'transparent',
                  color: subVistaProgramacion === 'docente' ? '#0f172a' : '#94a3b8',
                  boxShadow: subVistaProgramacion === 'docente' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                👨‍🏫 Por Docente
              </button>
              <button 
                onClick={() => setSubVistaProgramacion('aula')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: subVistaProgramacion === 'aula' ? '#38bdf8' : 'transparent',
                  color: subVistaProgramacion === 'aula' ? '#0f172a' : '#94a3b8',
                  boxShadow: subVistaProgramacion === 'aula' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                🏫 Por Aula
              </button>
            </div>

            {/* Filtros dinámicos según sub-vista */}
            {subVistaProgramacion === 'curso' && (
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>Seleccionar Curso:</span>
                <select
                  value={selectedCursoId}
                  onChange={(e) => setSelectedCursoId(e.target.value)}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '250px'
                  }}
                >
                  <option value="">-- Elige un Curso --</option>
                  {cursos.map(c => (
                    <option key={c._id} value={c._id}>[{c.codigo}] {c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {subVistaProgramacion === 'docente' && (
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>Seleccionar Docente:</span>
                <select
                  value={selectedDocenteId}
                  onChange={(e) => setSelectedDocenteId(e.target.value)}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '250px'
                  }}
                >
                  <option value="">-- Elige un Docente --</option>
                  {docentes.map(d => (
                    <option key={d._id} value={d._id}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {subVistaProgramacion === 'aula' && (
              <div style={{ background: '#0f172a', padding: '16px 20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600' }}>Seleccionar Aula / Lab:</span>
                <select
                  value={selectedAulaId}
                  onChange={(e) => setSelectedAulaId(e.target.value)}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    minWidth: '250px'
                  }}
                >
                  <option value="">-- Elige un Aula --</option>
                  {aulas.map(a => (
                    <option key={a._id} value={a._id}>{a.nombre} ({a.capacidad} vac.) - {a.tipo}</option>
                  ))}
                </select>
              </div>
            )}

            {/* RENDERIZADO DE LAS VISTAS */}
            {subVistaProgramacion === 'general' ? (
              <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '10px', background: '#0f172a' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '12px' }}>Sección</th>
                      <th style={{ padding: '12px' }}>Curso</th>
                      <th style={{ padding: '12px' }}>Docente</th>
                      <th style={{ padding: '12px' }}>Aula</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Vacantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seccionesDisponibles.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                          No hay secciones programadas actualmente. Use el botón "Generar Horarios Globales" para crearlas.
                        </td>
                      </tr>
                    ) : (
                      seccionesDisponibles.map(sec => (
                        <tr key={sec._id} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8' }}>{sec.codigo}</td>
                          <td style={{ padding: '12px', color: '#f8fafc' }}>{sec.curso?.nombre}</td>
                          <td style={{ padding: '12px', color: '#cbd5e1' }}>{sec.docente?.nombre}</td>
                          <td style={{ padding: '12px', color: '#cbd5e1' }}>{sec.aula?.nombre}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{sec.vacantesDisponibles} / {sec.vacantesTotales}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                {(() => {
                  let filterId = '';
                  let matchingSections = [];
                  let itemLabel = '';

                  if (subVistaProgramacion === 'curso') {
                    filterId = selectedCursoId;
                    matchingSections = seccionesDisponibles.filter(s => s.curso?._id === filterId || s.curso === filterId);
                    const courseObj = cursos.find(c => c._id === filterId);
                    itemLabel = courseObj ? `${courseObj.codigo} - ${courseObj.nombre}` : 'Curso';
                  } else if (subVistaProgramacion === 'docente') {
                    filterId = selectedDocenteId;
                    matchingSections = seccionesDisponibles.filter(s => s.docente?._id === filterId || s.docente === filterId);
                    const docObj = docentes.find(d => d._id === filterId);
                    itemLabel = docObj ? docObj.nombre : 'Docente';
                  } else if (subVistaProgramacion === 'aula') {
                    filterId = selectedAulaId;
                    matchingSections = seccionesDisponibles.filter(s => s.aula?._id === filterId || s.aula === filterId);
                    const aulaObj = aulas.find(a => a._id === filterId);
                    itemLabel = aulaObj ? aulaObj.nombre : 'Aula';
                  }

                  if (!filterId) {
                    return (
                      <div style={{ background: '#0f172a', border: '1px dashed #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        Por favor, selecciona un elemento del menú desplegable superior para cargar su grilla horaria.
                      </div>
                    );
                  }

                  const mappedAsignaciones = matchingSections.flatMap(s => 
                    (s.horario || []).map(h => ({
                      codigo: s.codigo,
                      nombre: s.curso?.nombre || 'Curso',
                      aula: s.aula?.nombre || 'Virtual',
                      docente: s.docente?.nombre || 'Docente',
                      dia: h.dia,
                      franja: h.franja
                    }))
                  );

                  return (
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 'bold' }}>
                          Calendario para: <span style={{ color: '#38bdf8' }}>{itemLabel}</span>
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#1e293b', padding: '4px 8px', borderRadius: '6px' }}>
                          {mappedAsignaciones.length} Bloques Asignados
                        </span>
                      </div>
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #334155' }}>
                        <Suspense fallback={<div style={{ padding: '20px', color: '#cbd5e1', textAlign: 'center' }}>Cargando Grilla Horaria...</div>}>
                          <ScheduleGrid asignaciones={mappedAsignaciones} />
                        </Suspense>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* 3. SECCIÓN CONTROL DE ESTUDIANTES */}
        {seccionActiva === 'alumnos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>Control Financiero de Alumnos</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Habilite pagos y apruebe deudas de estudiantes.</p>
              </div>
              <input 
                type="text" 
                placeholder="🔍 Buscar por nombre o código..." 
                value={busquedaAlumno}
                onChange={(e) => setBusquedaAlumno(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  border: '1px solid #334155',
                  width: '250px',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* TABLA ALUMNOS */}
            <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: '10px', background: '#0f172a' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Alumno</th>
                    <th style={{ padding: '12px' }}>Código</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Deuda</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Tasa Matrícula</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Seguro Univ.</th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesFiltrados.map(est => (
                    <tr key={est._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#f8fafc' }}>{est.nombre}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{est.codigo}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={est.tieneDeudas} 
                          onChange={(e) => onActualizarPago(est._id, 'tieneDeudas', e.target.checked)}
                          style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => onActualizarPago(est._id, 'tasaPagada', !est.tasaPagada)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: est.tasaPagada ? '#065f46' : '#7f1d1d',
                            color: est.tasaPagada ? '#34d399' : '#f87171'
                          }}
                        >
                          {est.tasaPagada ? 'PAGADO' : 'PENDIENTE'}
                        </button>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => onActualizarPago(est._id, 'seguroVigente', !est.seguroVigente)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: est.seguroVigente ? '#065f46' : '#7f1d1d',
                            color: est.seguroVigente ? '#34d399' : '#f87171'
                          }}
                        >
                          {est.seguroVigente ? 'VIGENTE' : 'VENCIDO'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* 3.5 SECCIÓN MANTENIMIENTO ACADÉMICO */}
        {seccionActiva === 'mantenimiento' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>Gestión y Mantenimiento Académico</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Administra la malla curricular, carreras, profesores y aulas de la universidad.</p>
            </div>

            {/* Sub-navegación de Mantenimiento */}
            <div style={{ display: 'flex', gap: '8px', background: '#0f172a', padding: '6px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #334155', width: 'fit-content' }}>
              <button 
                onClick={() => setSubMantenimiento('carreras')}
                data-cy="subtab-carreras"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backgroundColor: subMantenimiento === 'carreras' ? '#38bdf8' : 'transparent',
                  color: subMantenimiento === 'carreras' ? '#0f172a' : '#94a3b8',
                  boxShadow: subMantenimiento === 'carreras' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                🎓 Carreras
              </button>
              <button 
                onClick={() => setSubMantenimiento('cursos')}
                data-cy="subtab-cursos"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backgroundColor: subMantenimiento === 'cursos' ? '#38bdf8' : 'transparent',
                  color: subMantenimiento === 'cursos' ? '#0f172a' : '#94a3b8',
                  boxShadow: subMantenimiento === 'cursos' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                📚 Cursos
              </button>
              <button 
                onClick={() => setSubMantenimiento('docentes')}
                data-cy="subtab-docentes"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backgroundColor: subMantenimiento === 'docentes' ? '#38bdf8' : 'transparent',
                  color: subMantenimiento === 'docentes' ? '#0f172a' : '#94a3b8',
                  boxShadow: subMantenimiento === 'docentes' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                👨‍🏫 Docentes
              </button>
              <button 
                onClick={() => setSubMantenimiento('aulas')}
                data-cy="subtab-aulas"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backgroundColor: subMantenimiento === 'aulas' ? '#38bdf8' : 'transparent',
                  color: subMantenimiento === 'aulas' ? '#0f172a' : '#94a3b8',
                  boxShadow: subMantenimiento === 'aulas' ? '0 4px 12px rgba(56, 189, 248, 0.2)' : 'none'
                }}
              >
                🏫 Salones y Aulas
              </button>
            </div>

            {/* Split Screen Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              
              {/* COLUMNA IZQUIERDA: LISTADOS */}
              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
                
                {/* 1. Tabla Carreras */}
                {subMantenimiento === 'carreras' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '12px' }}>Código</th>
                        <th style={{ padding: '12px' }}>Nombre de Carrera</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carreras.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay carreras registradas.</td>
                        </tr>
                      ) : (
                        carreras.map(car => (
                          <tr key={car._id} style={{ borderBottom: '1px solid #334155', transition: '0.2s' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{car.codigo}</td>
                            <td style={{ padding: '12px', color: '#f8fafc' }}>{car.nombre}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleEditCarrera(car)} style={{ marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Editar">✏️</button>
                              <button onClick={() => handleDeleteCarrera(car._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar">🗑️</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 2. Tabla Cursos */}
                {subMantenimiento === 'cursos' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '12px' }}>Código</th>
                        <th style={{ padding: '12px' }}>Nombre</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Créditos</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Ciclo</th>
                        <th style={{ padding: '12px' }}>Modalidad</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursos.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay cursos registrados.</td>
                        </tr>
                      ) : (
                        cursos.map(cur => (
                          <tr key={cur._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 'bold', color: '#38bdf8' }}>{cur.codigo}</td>
                            <td style={{ padding: '12px', color: '#f8fafc' }}>{cur.nombre}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#cbd5e1' }}>{cur.creditos}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#c084fc', fontWeight: 'bold' }}>{cur.semestre}º</td>
                            <td style={{ padding: '12px', color: '#cbd5e1' }}>{cur.modalidad}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleEditCurso(cur)} style={{ marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Editar">✏️</button>
                              <button onClick={() => handleDeleteCurso(cur._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar">🗑️</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 3. Tabla Docentes */}
                {subMantenimiento === 'docentes' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '12px' }}>Docente</th>
                        <th style={{ padding: '12px' }}>Especialidad / Cursos</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docentes.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay docentes registrados.</td>
                        </tr>
                      ) : (
                        docentes.map(doc => (
                          <tr key={doc._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '12px', fontWeight: '500', color: '#f8fafc' }}>{doc.nombre}</td>
                            <td style={{ padding: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                              {(doc.especialidad || []).join(', ') || 'Sin asignar'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleEditDocente(doc)} style={{ marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Editar">✏️</button>
                              <button onClick={() => handleDeleteDocente(doc._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar">🗑️</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 4. Tabla Aulas */}
                {subMantenimiento === 'aulas' && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '2px solid #334155' }}>
                        <th style={{ padding: '12px' }}>Salón / Aula</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Capacidad</th>
                        <th style={{ padding: '12px' }}>Tipo</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aulas.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No hay aulas registradas.</td>
                        </tr>
                      ) : (
                        aulas.map(aul => (
                          <tr key={aul._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '12px', fontWeight: '500', color: '#f8fafc' }}>{aul.nombre}</td>
                            <td style={{ padding: '12px', textAlign: 'center', color: '#cbd5e1' }}>{aul.capacidad} vacantes</td>
                            <td style={{ padding: '12px', color: '#c084fc' }}>{aul.tipo}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => handleEditAula(aul)} style={{ marginRight: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Editar">✏️</button>
                              <button onClick={() => handleDeleteAula(aul._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }} title="Eliminar">🗑️</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

              </div>

              {/* COLUMNA DERECHA: FORMULARIOS */}
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #334155', alignSelf: 'start' }}>
                
                {/* A. Formulario Carreras */}
                {subMantenimiento === 'carreras' && (
                  <form onSubmit={handleSaveCarrera} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                      {carreraEditando ? '✏️ Editar Carrera' : '🎓 Registrar Carrera'}
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Código de Carrera</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. ING-SIS" 
                        value={carreraForm.codigo}
                        onChange={(e) => setCarreraForm({ ...carreraForm, codigo: e.target.value })}
                        data-cy="carrera-codigo-input"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Ingeniería de Sistemas e Informática" 
                        value={carreraForm.nombre}
                        onChange={(e) => setCarreraForm({ ...carreraForm, nombre: e.target.value })}
                        data-cy="carrera-nombre-input"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" data-cy="carrera-save-button" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {carreraEditando ? 'Actualizar' : 'Guardar'}
                      </button>
                      {carreraEditando && (
                        <button type="button" onClick={() => { setCarreraEditando(null); setCarreraForm({ nombre: '', codigo: '' }); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#fca5a5', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* B. Formulario Cursos */}
                {subMantenimiento === 'cursos' && (
                  <form onSubmit={handleSaveCurso} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                      {cursoEditando ? '✏️ Editar Curso' : '📚 Registrar Curso'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Código (NRC)</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej. ASUCO0316" 
                          value={cursoForm.codigo}
                          onChange={(e) => setCursoForm({ ...cursoForm, codigo: e.target.value })}
                          data-cy="curso-codigo-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Créditos</label>
                        <input 
                          type="number" 
                          required
                          min="1" max="6"
                          value={cursoForm.creditos}
                          onChange={(e) => setCursoForm({ ...cursoForm, creditos: parseInt(e.target.value, 10) })}
                          data-cy="curso-creditos-input"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nombre del Curso</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Inteligencia Artificial" 
                        value={cursoForm.nombre}
                        onChange={(e) => setCursoForm({ ...cursoForm, nombre: e.target.value })}
                        data-cy="curso-nombre-input"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Ciclo (Semestre)</label>
                        <select
                          value={cursoForm.semestre}
                          onChange={(e) => setCursoForm({ ...cursoForm, semestre: parseInt(e.target.value, 10) })}
                          data-cy="curso-semestre-select"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}º Semestre</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Modalidad</label>
                        <select
                          value={cursoForm.modalidad}
                          onChange={(e) => setCursoForm({ ...cursoForm, modalidad: e.target.value })}
                          data-cy="curso-modalidad-select"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="Presencial">Presencial</option>
                          <option value="Semipresencial">Semipresencial</option>
                          <option value="Distancia">Distancia</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Carrera de Pertenencia</label>
                      <select
                        value={cursoForm.carrera}
                        onChange={(e) => setCursoForm({ ...cursoForm, carrera: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="">-- Seleccionar Carrera (Opcional) --</option>
                        {carreras.map(car => (
                          <option key={car._id} value={car._id}>{car.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Prerrequisitos (Separar por comas)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. ASUCO0316, ASUCO1312" 
                        value={cursoForm.prerrequisitos}
                        onChange={(e) => setCursoForm({ ...cursoForm, prerrequisitos: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" data-cy="curso-save-button" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {cursoEditando ? 'Actualizar' : 'Guardar'}
                      </button>
                      {cursoEditando && (
                        <button type="button" onClick={() => { setCursoEditando(null); setCursoForm({ nombre: '', codigo: '', creditos: 3, semestre: 1, prerrequisitos: '', modalidad: 'Presencial', carrera: '' }); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#fca5a5', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* C. Formulario Docentes */}
                {subMantenimiento === 'docentes' && (
                  <form onSubmit={handleSaveDocente} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                      {docenteEditando ? '✏️ Editar Docente' : '👨‍🏫 Registrar Docente'}
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Ing. Alan Turing" 
                        value={docenteForm.nombre}
                        onChange={(e) => setDocenteForm({ ...docenteForm, nombre: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Cursos Aptos (Códigos separados por comas)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. ASUCO0316, ASUCO1312" 
                        value={docenteForm.especialidad}
                        onChange={(e) => setDocenteForm({ ...docenteForm, especialidad: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                      <small style={{ color: '#64748b', fontSize: '0.7rem', display: 'block', marginTop: '4px' }}>
                        Especifica los códigos de cursos que este docente está calificado para dictar.
                      </small>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {docenteEditando ? 'Actualizar' : 'Guardar'}
                      </button>
                      {docenteEditando && (
                        <button type="button" onClick={() => { setDocenteEditando(null); setDocenteForm({ nombre: '', especialidad: '' }); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#fca5a5', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* D. Formulario Aulas */}
                {subMantenimiento === 'aulas' && (
                  <form onSubmit={handleSaveAula} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                      {aulaEditando ? '✏️ Editar Aula' : '🏫 Registrar Aula'}
                    </h4>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Nombre del Salón / Laboratorio</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Lab K302 o Aula A101" 
                        value={aulaForm.nombre}
                        onChange={(e) => setAulaForm({ ...aulaForm, nombre: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Capacidad</label>
                        <input 
                          type="number" 
                          required
                          min="5" max="200"
                          value={aulaForm.capacidad}
                          onChange={(e) => setAulaForm({ ...aulaForm, capacidad: parseInt(e.target.value, 10) })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Tipo de Espacio</label>
                        <select
                          value={aulaForm.tipo}
                          onChange={(e) => setAulaForm({ ...aulaForm, tipo: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                        >
                          <option value="Teoría">Teoría (Salón regular)</option>
                          <option value="Laboratorio">Laboratorio (Espacio de computo)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {aulaEditando ? 'Actualizar' : 'Guardar'}
                      </button>
                      {aulaEditando && (
                        <button type="button" onClick={() => { setAulaEditando(null); setAulaForm({ nombre: '', capacidad: 30, tipo: 'Teoría' }); }} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#fca5a5', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}

              </div>

            </div>
          </div>
        )}

        {/* 4. SECCIÓN ECOLOGÍA (SOSTENIBILIDAD) */}
        {seccionActiva === 'ecologia' && (
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.4rem', fontWeight: '800' }}>🌱 Monitoreo Ambiental (Green Software)</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '25px' }}>
              Métricas reales estimadas con **CO2.js (Sustainable Web Design Model)** de la transferencia de datos y carga de red del servidor MERN.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              
              {/* TOTAL EMISIONES */}
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Emisiones de Carbono Totales</span>
                <h2 style={{ margin: '15px 0 5px 0', color: '#10b981', fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {ecoMetrics.co2Total.toFixed(6)} g
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '10px' }}>
                  Gramo de CO2 emitido por solicitudes de red procesadas
                </p>
              </div>

              {/* CONSUMO RED */}
              <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tránsito de Datos Estimado</span>
                <h2 style={{ margin: '15px 0 5px 0', color: '#38bdf8', fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {(ecoMetrics.bytesTotal / 1024).toFixed(2)} KB
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '10px' }}>
                  Basado en {ecoMetrics.totalRequests} solicitudes de red capturadas
                </p>
              </div>

            </div>

            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '0.95rem' }}>Estrategia Ecológica del Sistema</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
                El sistema ahorra consumo energético de CPU en el servidor MongoDB limitando la resolución del Algoritmo Genético a un máximo de 300 generaciones. Además, se aplican cabeceras HTTP de caché y compresión Gzip para reducir la modulación de energía en fibra óptica en hasta un **94.7%**.
              </p>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
