import { useState, useEffect, lazy, Suspense } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPortal } from './components/LoginPortal';

const ScheduleGrid = lazy(() => import('./components/ScheduleGrid'));

function App() {
  // Ruteador Nativo
  const [rutaActual, setRutaActual] = useState(window.location.pathname);
  const [rolActivo, setRolActivo] = useState(null); // 'administrador' | 'docente' | 'estudiante' | null
  
  const [estudiantesSimulados, setEstudiantesSimulados] = useState([]);
  const [estudianteActivo, setEstudianteActivo] = useState(null);
  const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);
  const [asistenciaHibrida, setAsistenciaHibrida] = useState({});
  const [semanaSimulada, setSemanaSimulada] = useState(1);
  const [tipoPeriodo, setTipoPeriodo] = useState('Regular');
  const [justificacionCargaMinima, setJustificacionCargaMinima] = useState(false);
  
  const [docenteActivoId, setDocenteActivoId] = useState('');
  const [docenteActivoNombre, setDocenteActivoNombre] = useState('');
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  
  const [matriculaActiva, setMatriculaActiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAsistente, setLoadingAsistente] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Sincronizar cambios en la barra de navegación del navegador (Popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      setRutaActual(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Función auxiliar de navegación
  const navegarA = (path) => {
    window.history.pushState({}, '', path);
    setRutaActual(path);
  };

  // Cargar datos iniciales del backend y restaurar sesión
  const cargarDatosYRestaurarSesion = async () => {
    try {
      const resEst = await fetch('http://localhost:3000/api/estudiantes');
      const dataEst = await resEst.json();
      setEstudiantesSimulados(dataEst);

      const resSec = await fetch('http://localhost:3000/api/secciones');
      const dataSec = await resSec.json();
      setSeccionesDisponibles(dataSec);

      // Agrupar docentes únicos
      const docentesMap = {};
      dataSec.forEach(s => {
        if (s.docente) {
          docentesMap[s.docente._id] = s.docente.nombre;
        }
      });
      const docentesList = Object.keys(docentesMap).map(id => ({ _id: id, nombre: docentesMap[id] }));
      setDocentesDisponibles(docentesList);

      // Restaurar sesión persistida en localStorage
      const sesionRol = localStorage.getItem('sesionRol');
      const sesionUsr = localStorage.getItem('sesionUsuario');

      if (sesionRol) {
        setRolActivo(sesionRol);
        if (sesionUsr) {
          const usuarioObj = JSON.parse(sesionUsr);
          if (sesionRol === 'estudiante') {
            // Sincronizar estudiante con la última data fresca del backend
            const estudianteFresco = dataEst.find(e => e._id === usuarioObj._id);
            setEstudianteActivo(estudianteFresco || usuarioObj);
          } else if (sesionRol === 'docente') {
            setDocenteActivoId(usuarioObj._id);
            setDocenteActivoNombre(usuarioObj.nombre);
          }
        }
        
        // Redirigir a la ruta adecuada si está en la raíz o login
        const path = window.location.pathname;
        if (path === '/' || path === '/login') {
          navegarA(`/${sesionRol}`);
        }
      } else {
        // Sin sesión -> Forzar redirect a /login
        navegarA('/login');
      }
    } catch (err) {
      console.error("Error al cargar datos y restaurar sesión:", err);
    }
  };

  useEffect(() => {
    cargarDatosYRestaurarSesion();
  }, []);

  // Manejo del Login por Rol
  const handleLogin = (rol, usuario) => {
    localStorage.setItem('sesionRol', rol);
    setRolActivo(rol);

    if (usuario) {
      localStorage.setItem('sesionUsuario', JSON.stringify(usuario));
      if (rol === 'estudiante') {
        setEstudianteActivo(usuario);
        navegarA('/estudiante');
      } else if (rol === 'docente') {
        setDocenteActivoId(usuario._id);
        setDocenteActivoNombre(usuario.nombre);
        navegarA('/docente');
      }
    } else {
      // Admin
      localStorage.removeItem('sesionUsuario');
      navegarA('/admin');
    }
    setAlerta(null);
  };

  // Manejo del Logout / Cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('sesionRol');
    localStorage.removeItem('sesionUsuario');
    setRolActivo(null);
    setEstudianteActivo(null);
    setDocenteActivoId('');
    setDocenteActivoNombre('');
    setSeccionesSeleccionadas([]);
    setAsistenciaHibrida({});
    setMatriculaActiva(null);
    setAlerta(null);
    navegarA('/login');
  };

  // Simular aprobación de pagos en el backend
  const handleActualizarPagosAdmin = async (estudianteId, campo, valor) => {
    try {
      const res = await fetch('http://localhost:3000/api/admin/actualizar-pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId, [campo]: valor })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: `Estado financiero actualizado para ${data.estudiante.nombre}` });
        
        // Actualizar localmente la lista de estudiantes
        const actualizados = estudiantesSimulados.map(e => e._id === estudianteId ? data.estudiante : e);
        setEstudiantesSimulados(actualizados);
        
        // Si el estudiante activo es el modificado, actualizarlo
        if (estudianteActivo && estudianteActivo._id === estudianteId) {
          setEstudianteActivo(data.estudiante);
        }
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Error al actualizar pagos de estudiantes" });
    }
  };

  // Generar horario global (Admin)
  const handleGenerarGlobalAdmin = async () => {
    setLoading(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/admin/generar-horarios-globales', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: `Programación académica global publicada con éxito! Fitness: ${data.fitness?.toFixed(5)}` });
        
        // Recargar secciones actualizadas
        const resSec = await fetch('http://localhost:3000/api/secciones');
        const dataSec = await resSec.json();
        setSeccionesDisponibles(dataSec);
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Fallo de comunicación al generar horario global." });
    } finally {
      setLoading(false);
    }
  };

  // Matricularse (Manual)
  const handleMatricularse = async () => {
    setLoading(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudianteId: estudianteActivo._id,
          seccionIds: seccionesSeleccionadas,
          asistenciaHibrida,
          semana: semanaSimulada,
          tipoPeriodo,
          justificacionCargaMinima
        })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: `¡Matrícula formalizada con éxito! Estado: ${data.estudiante.estadoMatricula}` });
        setMatriculaActiva(data.matricula);
        
        // Recargar información
        const resEst = await fetch('http://localhost:3000/api/estudiantes');
        const dataEst = await resEst.json();
        setEstudiantesSimulados(dataEst);
        const actualizado = dataEst.find(e => e._id === estudianteActivo._id);
        if (actualizado) setEstudianteActivo(actualizado);

        const resSec = await fetch('http://localhost:3000/api/secciones');
        const dataSec = await resSec.json();
        setSeccionesDisponibles(dataSec);
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Error al matricular." });
    } finally {
      setLoading(false);
    }
  };

  // Asistente Genético Alumno (Auto-Matrícula)
  const handleAutoMatriculaAsistente = async () => {
    if (seccionesSeleccionadas.length === 0) {
      setAlerta({ tipo: 'warning', txt: "Por favor, selecciona primero algunos cursos para buscar sus secciones." });
      return;
    }
    
    const cursoIds = [...new Set(seccionesSeleccionadas.map(id => {
      const sec = seccionesDisponibles.find(s => s._id === id);
      return sec?.curso?._id || sec?.curso;
    }).filter(Boolean))];

    setLoadingAsistente(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId: estudianteActivo._id, cursoIds })
      });
      const data = await res.json();
      if (data.success) {
        const sugeridas = data.seccionesSugeridas.map(s => s._id);
        setSeccionesSeleccionadas(sugeridas);
        setAlerta({ tipo: 'success', txt: `¡Asistente completado! Se seleccionó la combinación de secciones sin cruces de horarios (Fitness: ${data.fitness?.toFixed(3)}).` });
        
        const hibridas = {};
        data.seccionesSugeridas.forEach(s => {
          if (s.curso?.modalidad === 'Híbrido' || s.curso?.modalidad === 'Hibrido') {
            hibridas[s._id] = 'Física';
          }
        });
        setAsistenciaHibrida(prev => ({ ...prev, ...hibridas }));
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Fallo de comunicación con el asistente genético." });
    } finally {
      setLoadingAsistente(false);
    }
  };

  // Solicitar Asignatura Dirigida
  const handleSolicitarDirigida = async (cursoId) => {
    setLoading(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula/dirigida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId: estudianteActivo._id, cursoId })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: data.mensaje });
        
        // Recargar estudiante
        const resEst = await fetch('http://localhost:3000/api/estudiantes');
        const dataEst = await resEst.json();
        setEstudiantesSimulados(dataEst);
        const actualizado = dataEst.find(e => e._id === estudianteActivo._id);
        if (actualizado) setEstudianteActivo(actualizado);
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Error al solicitar dirigida." });
    } finally {
      setLoading(false);
    }
  };

  // Reservar Matrícula Completa
  const handleReservarMatricula = async () => {
    setLoading(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula/reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId: estudianteActivo._id, semanaSimulada })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: data.mensaje });
        
        // Recargar datos
        const resEst = await fetch('http://localhost:3000/api/estudiantes');
        const dataEst = await resEst.json();
        setEstudiantesSimulados(dataEst);
        const actualizado = dataEst.find(e => e._id === estudianteActivo._id);
        if (actualizado) setEstudianteActivo(actualizado);
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Error al reservar." });
    } finally {
      setLoading(false);
    }
  };

  // Retirar una asignatura
  const handleRetirarAsignatura = async (seccionId) => {
    if (!matriculaActiva) return;
    setLoading(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula/retiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matriculaId: matriculaActiva._id, seccionId, semanaSimulada })
      });
      const data = await res.json();
      if (data.success) {
        setAlerta({ tipo: 'success', txt: data.mensaje });
        setSeccionesSeleccionadas(prev => prev.filter(id => id !== seccionId));
        setMatriculaActiva(prev => ({
          ...prev,
          secciones: prev.secciones.filter(s => s._id !== seccionId)
        }));

        // Recargar secciones y estudiante
        const resEst = await fetch('http://localhost:3000/api/estudiantes');
        const dataEst = await resEst.json();
        setEstudiantesSimulados(dataEst);
        const actualizado = dataEst.find(e => e._id === estudianteActivo._id);
        if (actualizado) setEstudianteActivo(actualizado);

        const resSec = await fetch('http://localhost:3000/api/secciones');
        const dataSec = await resSec.json();
        setSeccionesDisponibles(dataSec);
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Error al retirar curso." });
    } finally {
      setLoading(false);
    }
  };

  // Toggle matrícula de secciones
  const handleToggleSeccion = (seccionId) => {
    setSeccionesSeleccionadas(prev => {
      const isSelected = prev.includes(seccionId);
      if (isSelected) {
        const filtered = prev.filter(id => id !== seccionId);
        const cleanHibrida = { ...asistenciaHibrida };
        delete cleanHibrida[seccionId];
        setAsistenciaHibrida(cleanHibrida);
        return filtered;
      } else {
        const sec = seccionesDisponibles.find(s => s._id === seccionId);
        if (sec?.curso?.modalidad === 'Híbrido' || sec?.curso?.modalidad === 'Hibrido') {
          setAsistenciaHibrida(prevAh => ({ ...prevAh, [seccionId]: 'Física' }));
        }
        return [...prev, seccionId];
      }
    });
  };

  // Computar créditos
  const totalCreditosSeleccionados = seccionesSeleccionadas.reduce((acc, id) => {
    const sec = seccionesDisponibles.find(s => s._id === id);
    return acc + (sec?.curso?.creditos || 0);
  }, 0);

  // Filtrar asignaciones del docente seleccionado
  const asignacionesDocenteActivo = seccionesDisponibles
    .filter(s => s.docente?._id === docenteActivoId || s.docente === docenteActivoId)
    .flatMap(s => s.horario.map(h => ({
      codigo: s.codigo,
      nombre: s.curso?.nombre || 'Curso',
      aula: s.aula?.nombre || 'Virtual',
      docente: s.docente?.nombre || 'Docente',
      dia: h.dia,
      franja: h.franja
    })));

  // Filtrar asignaciones del estudiante matriculado
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

  // ==========================================
  // SEGURIDAD Y RUTEADOR CONDICIONAL
  // ==========================================
  
  // Si está en /login y ya hay una sesión, redirigir
  if (rutaActual === '/login' && rolActivo) {
    navegarA(`/${rolActivo}`);
    return null;
  }

  // Redirigir a login si intenta ingresar a una ruta protegida sin sesión
  if (['/admin', '/docente', '/estudiante'].includes(rutaActual) && !rolActivo) {
    setTimeout(() => navegarA('/login'), 50);
    return null;
  }

  return (
    <div style={{ padding: '20px 40px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", backgroundColor: '#0f172a', color: '#cbd5e1', minHeight: '100vh' }}>
      
      {/* HEADER DE SESIÓN (SOLO SI ESTÁ LOGUEADO) */}
      {rolActivo && (
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #334155', 
          paddingBottom: '20px',
          marginBottom: '20px' 
        }}>
          <div>
            <h1 style={{ color: '#f8fafc', margin: 0, fontSize: '2rem', letterSpacing: '-0.05em', fontWeight: '800' }}>
              Universidad <span style={{ color: '#38bdf8' }}>Planner-UC</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
              <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Sesión: {rolActivo}
              </span>
              {rolActivo === 'estudiante' && estudianteActivo && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  — {estudianteActivo.nombre} ({estudianteActivo.codigo})
                </span>
              )}
              {rolActivo === 'docente' && docenteActivoNombre && (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  — {docenteActivoNombre}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            data-cy="logout-button"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              transition: '0.2s'
            }}
          >
            🚪 Cerrar Sesión
          </button>
        </header>
      )}

      {/* ALERTAS GLOBALES */}
      {alerta && (
        <div 
          data-cy="alert-message"
          style={{
          padding: '16px 24px',
          borderRadius: '12px',
          marginBottom: '25px',
          fontWeight: '500',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '5px solid',
          backgroundColor: 
            alerta.tipo === 'success' ? 'rgba(16, 185, 129, 0.15)' : 
            alerta.tipo === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          borderColor: 
            alerta.tipo === 'success' ? '#10b981' : 
            alerta.tipo === 'error' ? '#ef4444' : '#f59e0b',
          color: 
            alerta.tipo === 'success' ? '#a7f3d0' : 
            alerta.tipo === 'error' ? '#fca5a5' : '#fde68a',
        }}>
          <span>{alerta.tipo === 'success' ? '✅' : alerta.tipo === 'error' ? '❌' : '⚠️'}</span>
          <span>{alerta.txt}</span>
        </div>
      )}

      {/* ========================================================
          ENRUTADOR CONDICIONAL DE VISTAS
          ======================================================== */}

      {/* 1. PORTAL DE LOGIN */}
      {(rutaActual === '/login' || rutaActual === '/' || !rolActivo) && (
        <LoginPortal 
          estudiantesSimulados={estudiantesSimulados}
          docentesDisponibles={docentesDisponibles}
          onLogin={handleLogin}
        />
      )}

      {/* 2. VISTA ADMINISTRADOR */}
      {rutaActual === '/admin' && rolActivo === 'administrador' && (
        <AdminDashboard 
          estudiantesSimulados={estudiantesSimulados}
          seccionesDisponibles={seccionesDisponibles}
          onActualizarPago={handleActualizarPagosAdmin}
          onGenerarGlobal={handleGenerarGlobalAdmin}
          loading={loading}
        />
      )}

      {/* 3. VISTA DOCENTE */}
      {rutaActual === '/docente' && rolActivo === 'docente' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155', alignSelf: 'start' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '1.2rem' }}>Profesor Conectado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#38bdf8' }}>{docenteActivoNombre}</span>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                Vista exclusiva de docente. Aquí puede visualizar la distribución semanal de las clases de las secciones asignadas por el administrador en su agenda.
              </p>
            </div>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '1.2rem' }}>Horario Docente Personalizado</h3>
            <Suspense fallback={<div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Cargando calendario...</div>}>
              <ScheduleGrid asignaciones={asignacionesDocenteActivo} />
            </Suspense>
          </div>
        </div>
      )}

      {/* 4. VISTA ESTUDIANTE */}
      {rutaActual === '/estudiante' && rolActivo === 'estudiante' && estudianteActivo && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' }}>
          
          {/* EXPEDIENTE Y ESTADOS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '1.1rem' }}>🎓 Expediente Alumno</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Código:</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{estudianteActivo.codigo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Plan:</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: estudianteActivo.planVigente ? '#34d399' : '#f87171'
                  }}>{estudianteActivo.planEstudios} {!estudianteActivo.planVigente && '(Inactivo)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Semestre Sugerido:</span>
                  <span style={{ fontWeight: 'bold' }}>{estudianteActivo.semestre}° ciclo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Cursos aprobados:</span>
                  <span style={{ fontWeight: 'bold' }}>{estudianteActivo.cursosAprobados?.length || 0} asignaturas</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Asig. Dirigidas:</span>
                  <span style={{ fontWeight: 'bold' }}>{estudianteActivo.cantidadDirigidos || 0} / 3</span>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '5px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#94a3b8' }}>Estado de Trámites:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor: estudianteActivo.tieneDeudas ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: estudianteActivo.tieneDeudas ? '#fca5a5' : '#a7f3d0'
                    }}>
                      {estudianteActivo.tieneDeudas ? 'DEUDAS PENDIENTES' : 'SIN DEUDAS'}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor: estudianteActivo.tasaPagada ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: estudianteActivo.tasaPagada ? '#a7f3d0' : '#fca5a5'
                    }}>
                      {estudianteActivo.tasaPagada ? 'TASA COMPLETA' : 'TASA PENDIENTE'}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor: estudianteActivo.seguroVigente ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: estudianteActivo.seguroVigente ? '#a7f3d0' : '#fca5a5'
                    }}>
                      {estudianteActivo.seguroVigente ? 'SEGURO ACTIVO' : 'SEGURO VENCIDO'}
                    </span>
                  </div>
                </div>

                {estudianteActivo.estadoMatricula !== 'Ninguno' && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    backgroundColor: estudianteActivo.estadoMatricula === 'Matriculado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: estudianteActivo.estadoMatricula === 'Matriculado' ? '#10b981' : '#f59e0b'
                  }}>
                    <strong style={{ 
                      fontSize: '0.85rem',
                      color: estudianteActivo.estadoMatricula === 'Matriculado' ? '#34d399' : '#fde68a'
                    }}>
                      ESTADO: {estudianteActivo.estadoMatricula.toUpperCase()}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ESPACIO DE TRABAJO MATRÍCULA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* CONFIGURACIÓN SIMULADA */}
            <div style={{ display: 'flex', gap: '20px', background: '#1e293b', padding: '16px 24px', borderRadius: '16px', border: '1px solid #334155', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Periodo Académico</span>
                <select 
                  value={tipoPeriodo} 
                  onChange={(e) => setTipoPeriodo(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                >
                  <option value="Regular">Ciclo Regular (Marzo-Diciembre)</option>
                  <option value="Verano">Ciclo de Verano (Enero-Feb)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Semana del Ciclo Simulada:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#38bdf8' }}>Semana {semanaSimulada}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="16" 
                  value={semanaSimulada} 
                  onChange={(e) => setSemanaSimulada(parseInt(e.target.value))}
                  style={{ width: '220px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <input 
                  type="checkbox" 
                  id="excCarga" 
                  checked={justificacionCargaMinima}
                  onChange={(e) => setJustificacionCargaMinima(e.target.checked)}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                <label htmlFor="excCarga" style={{ fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                  Justificar carga inferior a 12 créditos (Egresante)
                </label>
              </div>
            </div>

            {/* SELECCIÓN CURSOS */}
            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.25rem' }}>Selección de Asignaturas</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Selecciona las secciones de tu semestre. Puedes usar el Asistente Genético para compactar el horario.
                  </p>
                </div>
                
                <span 
                  data-cy="credits-counter"
                  style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  backgroundColor: totalCreditosSeleccionados >= 12 && totalCreditosSeleccionados <= 25 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: totalCreditosSeleccionados >= 12 && totalCreditosSeleccionados <= 25 ? '#34d399' : '#f87171',
                  border: '1px solid',
                  borderColor: totalCreditosSeleccionados >= 12 && totalCreditosSeleccionados <= 25 ? '#10b981' : '#ef4444'
                }}>
                  Créditos Seleccionados: {totalCreditosSeleccionados}
                </span>
              </div>

              {/* LISTA DE CURSOS Y SECCIONES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '5px', marginBottom: '25px' }}>
                {seccionesDisponibles
                  .filter(s => s.curso?.semestre === estudianteActivo.semestre)
                  .map(sec => {
                    const isSelected = seccionesSeleccionadas.includes(sec._id);
                    const esHibrido = sec.curso?.modalidad === 'Híbrido' || sec.curso?.modalidad === 'Hibrido';
                    
                    return (
                      <div key={sec._id} style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: '1px solid',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.05)' : '#0f172a',
                        borderColor: isSelected ? '#38bdf8' : '#334155',
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
                              onChange={() => handleToggleSeccion(sec._id)}
                              disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                              data-cy={`section-checkbox-${sec.codigo}`}
                              style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                            />
                            <div>
                              <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{sec.curso?.nombre} ({sec.curso?.creditos} CR)</strong>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '10px', marginTop: '3px' }}>
                                <span>Código: <code style={{ fontSize: '0.7rem' }}>{sec.codigo}</code></span>
                                <span>Aula: {sec.aula?.nombre}</span>
                                <span>Docente: {sec.docente?.nombre}</span>
                                <span style={{ color: sec.vacantesDisponibles > 5 ? '#34d399' : '#f87171', fontWeight: 'bold' }}>
                                  Vacantes: {sec.vacantesDisponibles} / {sec.vacantesTotales}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #334155' }}>
                              Ciclo {sec.curso?.semestre}
                            </span>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: esHibrido ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: esHibrido ? '#c084fc' : '#38bdf8' }}>
                              {sec.curso?.modalidad}
                            </span>
                          </div>
                        </div>

                        {esHibrido && isSelected && (
                          <div style={{ marginLeft: '28px', padding: '8px 12px', borderRadius: '6px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #334155' }}>
                            <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '500' }}>Asistencia:</span>
                            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`asistencia-${sec._id}`}
                                value="Física"
                                checked={asistenciaHibrida[sec._id] === 'Física'}
                                onChange={() => setAsistenciaHibrida(prev => ({ ...prev, [sec._id]: 'Física' }))}
                                disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                              />
                              🏛️ Física
                            </label>
                            <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`asistencia-${sec._id}`}
                                value="Remota"
                                checked={asistenciaHibrida[sec._id] === 'Remota'}
                                onChange={() => setAsistenciaHibrida(prev => ({ ...prev, [sec._id]: 'Remota' }))}
                                disabled={estudianteActivo.estadoMatricula === 'Matriculado'}
                              />
                              💻 Remota
                            </label>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={handleMatricularse}
                  disabled={loading || estudianteActivo.estadoMatricula === 'Matriculado'}
                  data-cy="confirm-matricula-button"
                  style={{
                    flexGrow: 1,
                    padding: '14px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 'bold',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: (loading || estudianteActivo.estadoMatricula === 'Matriculado') ? 0.5 : 1,
                    fontSize: '0.95rem'
                  }}
                >
                  {loading ? 'Procesando...' : 'Confirmar Matrícula'}
                </button>

                <button 
                  onClick={handleAutoMatriculaAsistente}
                  disabled={loadingAsistente || estudianteActivo.estadoMatricula === 'Matriculado'}
                  data-cy="genetic-assistant-button"
                  style={{
                    padding: '14px 24px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    fontWeight: 'bold',
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    opacity: (loadingAsistente || estudianteActivo.estadoMatricula === 'Matriculado') ? 0.5 : 1,
                    fontSize: '0.95rem'
                  }}
                >
                  {loadingAsistente ? 'Procesando...' : '✨ Asistente Genético'}
                </button>
              </div>
            </div>

            {/* TRÁMITES ACADÉMICOS COMPLEMENTARIOS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              
              {/* CURSO DIRIGIDO */}
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem' }}>📝 Asignaturas Dirigidas</h3>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '15px' }}>
                  Solicita llevar una asignatura de forma dirigida. Máximo 3 en tu permanencia.
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    id="dirigidaSelect"
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      color: '#cbd5e1',
                      border: '1px solid #334155',
                      fontSize: '0.85rem'
                    }}
                  >
                    {seccionesDisponibles
                      .filter(s => s.curso?.semestre === estudianteActivo.semestre)
                      .filter((val, idx, arr) => arr.findIndex(t => t.curso?._id === val.curso?._id) === idx)
                      .map(sec => (
                        <option key={sec._id} value={sec.curso?._id}>{sec.curso?.nombre}</option>
                      ))}
                  </select>
                  <button 
                    onClick={() => {
                      const sel = document.getElementById('dirigidaSelect');
                      if (sel) handleSolicitarDirigida(sel.value);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#8b5cf6',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Solicitar
                  </button>
                </div>
              </div>

              {/* RESERVA Y RETIRO */}
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem' }}>📅 Reserva de Matrícula</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '15px' }}>
                    Permitido reservar la matrícula del ciclo completo hasta la **Semana 2**.
                  </p>
                </div>
                <button 
                  onClick={handleReservarMatricula}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Solicitar Reserva
                </button>
              </div>

            </div>

            {/* SECCIÓN RETIROS */}
            {estudianteActivo.estadoMatricula === 'Matriculado' && (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.1rem' }}>🗑️ Retiro de Asignaturas</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' }}>
                  Retirar asignaturas está permitido hasta la **Semana 14** (presencial) y **Semana 7** (semipresencial/distancia).
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {seccionesDisponibles
                    .filter(s => seccionesSeleccionadas.includes(s._id))
                    .map(sec => (
                      <div key={sec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155' }}>
                        <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: '500' }}>{sec.curso?.nombre} ({sec.curso?.modalidad})</span>
                        <button
                          onClick={() => handleRetirarAsignatura(sec._id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#7f1d1d',
                            color: '#f87171',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Retirar
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* HORARIO GENERADO */}
            {seccionesSeleccionadas.length > 0 && (
              <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#f8fafc', fontSize: '1.2rem' }}>🕒 Vista del Horario Académico</h3>
                <Suspense fallback={<div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Cargando grilla de horarios...</div>}>
                  <ScheduleGrid asignaciones={asignacionesEstudiante} />
                </Suspense>
              </div>
            )}

          </div>

        </div>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '50px', borderTop: '1px solid #334155', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <p>Planner-UC. Optimización del software y eficiencia de recursos académicos - 2026</p>
      </footer>

    </div>
  );
}

export default App;
