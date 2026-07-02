import { useState, useEffect, lazy, Suspense } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPortal } from './components/LoginPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';

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

  // NUEVOS ESTADOS ASISTENTE ADAPTATIVO CON ENCUESTA
  const [showEncuestaModal, setShowEncuestaModal] = useState(false);
  const [encuestaTrabaja, setEncuestaTrabaja] = useState(false);
  const [encuestaDias, setEncuestaDias] = useState([]);
  const [encuestaFranjaInicio, setEncuestaFranjaInicio] = useState(0);
  const [encuestaFranjaFin, setEncuestaFranjaFin] = useState(8);
  const [encuestaTraslado, setEncuestaTraslado] = useState(30);
  const [encuestaPreferencia, setEncuestaPreferencia] = useState('Ninguno');
  
  const [showCruceConfirm, setShowCruceConfirm] = useState(false);
  const [cruceCursosList, setCruceCursosList] = useState([]);
  const [tempSugeridas, setTempSugeridas] = useState([]);
  const [tempFitness, setTempFitness] = useState(0);
  const [satisfaccionAsistente, setSatisfaccionAsistente] = useState(null);
  const [avisosAsistente, setAvisosAsistente] = useState([]);
  const [tempSatisfaccion, setTempSatisfaccion] = useState(null);
  const [tempAvisos, setTempAvisos] = useState([]);

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
  const handleAutoMatriculaAsistente = () => {
    setAlerta(null);
    setSatisfaccionAsistente(null);
    setAvisosAsistente([]);
    setTempSatisfaccion(null);
    setTempAvisos([]);
    setShowEncuestaModal(true); // Abrir modal de encuesta directamente
  };

  // Asistente Genético Alumno - Ejecución final tras completar encuesta
  const ejecutarAsistenteConEncuesta = async () => {
    setShowEncuestaModal(false);
    
    let cursoIds = [];
    if (seccionesSeleccionadas.length > 0) {
      cursoIds = [...new Set(seccionesSeleccionadas.map(id => {
        const sec = seccionesDisponibles.find(s => s._id === id);
        return sec?.curso?._id || sec?.curso;
      }).filter(Boolean))];
    } else {
      // Si el alumno no pre-seleccionó asignaturas en la grilla, optimizar todas las de su semestre
      const sectionsOfSemester = seccionesDisponibles.filter(s => s.curso?.semestre === estudianteActivo.semestre);
      cursoIds = [...new Set(sectionsOfSemester.map(s => s.curso?._id || s.curso).filter(Boolean))];
    }

    if (cursoIds.length === 0) {
      setAlerta({ tipo: 'warning', txt: "No se encontraron asignaturas disponibles para tu semestre actual." });
      return;
    }

    setLoadingAsistente(true);
    setAlerta(null);
    try {
      const res = await fetch('http://localhost:3000/api/matricula/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estudianteId: estudianteActivo._id, 
          cursoIds,
          trabaja: encuestaTrabaja,
          diasLaborales: encuestaDias,
          franjaLaboralInicio: encuestaFranjaInicio,
          franjaLaboralFin: encuestaFranjaFin,
          tiempoTraslado: encuestaTraslado,
          preferenciaTurno: encuestaPreferencia
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.cruceLaboral) {
          // Si hay cruce laboral, guardar datos y abrir confirmación
          setTempSugeridas(data.seccionesSugeridas);
          setTempFitness(data.fitness);
          setTempSatisfaccion(data.satisfaccion);
          setTempAvisos(data.avisos);
          setCruceCursosList(data.crucesLaborales);
          setShowCruceConfirm(true);
        } else {
          // Aplicar directamente
          aplicarSugeridas(data.seccionesSugeridas, data.fitness, data.satisfaccion, data.avisos);
        }
      } else {
        setAlerta({ tipo: 'error', txt: data.error });
      }
    } catch (err) {
      setAlerta({ tipo: 'error', txt: "Fallo de comunicación con el asistente genético." });
    } finally {
      setLoadingAsistente(false);
    }
  };

  const aplicarSugeridas = (seccionesSugeridas, fitness, satisfaccion, avisos) => {
    const sugeridasIds = seccionesSugeridas.map(s => s._id);
    setSeccionesSeleccionadas(sugeridasIds);
    const scoreVal = (satisfaccion !== undefined && satisfaccion !== null) ? satisfaccion : 100;
    setSatisfaccionAsistente(scoreVal);
    setAvisosAsistente(avisos || []);
    setAlerta({ 
      tipo: 'success', 
      txt: `¡Asistente completado! Se seleccionó la mejor combinación de secciones según tus preferencias (Fitness: ${fitness?.toFixed(3)}) (${scoreVal}% de satisfacción).` 
    });
    
    const hibridas = {};
    seccionesSugeridas.forEach(s => {
      if (s.curso?.modalidad === 'Híbrido' || s.curso?.modalidad === 'Hibrido') {
        hibridas[s._id] = 'Física';
      }
    });
    setAsistenciaHibrida(prev => ({ ...prev, ...hibridas }));
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
  
  // 1. Redirecciones si no hay sesión activa y se intenta entrar a un dashboard protegido
  if (rutaActual === '/admin' && rolActivo !== 'administrador') {
    setTimeout(() => navegarA('/login/admin'), 50);
    return null;
  }
  if (rutaActual === '/docente' && rolActivo !== 'docente') {
    setTimeout(() => navegarA('/login/docente'), 50);
    return null;
  }
  if (rutaActual === '/estudiante' && rolActivo !== 'estudiante') {
    setTimeout(() => navegarA('/login/estudiante'), 50);
    return null;
  }

  // 2. Redirecciones si ya hay una sesión activa y está en rutas de acceso público/login
  if (rolActivo) {
    if (['/login', '/login/admin', '/login/docente', '/login/estudiante', '/'].includes(rutaActual)) {
      navegarA(`/${rolActivo}`);
      return null;
    }
  } else {
    // Redirigir a /login si accede a la raíz sin sesión
    if (rutaActual === '/') {
      setTimeout(() => navegarA('/login'), 50);
      return null;
    }
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
      {['/login', '/login/admin', '/login/docente', '/login/estudiante', '/'].includes(rutaActual) && !rolActivo && (
        <LoginPortal 
          estudiantesSimulados={estudiantesSimulados}
          docentesDisponibles={docentesDisponibles}
          onLogin={handleLogin}
          rutaActual={rutaActual}
          onNavegar={navegarA}
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
        <TeacherDashboard 
          docenteId={docenteActivoId}
          docenteNombre={docenteActivoNombre}
          seccionesDisponibles={seccionesDisponibles}
          onLogout={handleLogout}
        />
      )}

      {/* 4. VISTA ESTUDIANTE */}
      {rutaActual === '/estudiante' && rolActivo === 'estudiante' && estudianteActivo && (
        <StudentDashboard 
          estudianteActivo={estudianteActivo}
          seccionesDisponibles={seccionesDisponibles}
          seccionesSeleccionadas={seccionesSeleccionadas}
          asistenciaHibrida={asistenciaHibrida}
          semanaSimulada={semanaSimulada}
          tipoPeriodo={tipoPeriodo}
          justificacionCargaMinima={justificacionCargaMinima}
          loading={loading}
          loadingAsistente={loadingAsistente}
          onToggleSeccion={handleToggleSeccion}
          onMatricularse={handleMatricularse}
          onAutoMatriculaAsistente={handleAutoMatriculaAsistente}
          onSolicitarDirigida={handleSolicitarDirigida}
          onReservarMatricula={handleReservarMatricula}
          onRetirarAsignatura={handleRetirarAsignatura}
          onSetAsistenciaHibrida={setAsistenciaHibrida}
          onSetTipoPeriodo={setTipoPeriodo}
          onSetSemanaSimulada={setSemanaSimulada}
          onSetJustificacionCargaMinima={setJustificacionCargaMinima}
        />
      )}

      {/* MODAL DE ENCUESTA */}
      {showEncuestaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20000
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '95%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
            textAlign: 'left'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#f8fafc', fontSize: '1.4rem', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              ✨ Asistente Adaptativo
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Pregunta Trabajo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                  ¿Trabajas actualmente?
                </label>
                <select
                  value={encuestaTrabaja ? 'si' : 'no'}
                  onChange={(e) => setEncuestaTrabaja(e.target.value === 'si')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="no">No trabajo</option>
                  <option value="si">Sí trabajo</option>
                </select>
              </div>

              {/* Sección Trabajo Config */}
              {encuestaTrabaja && (
                <div style={{ padding: '15px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                      Días laborales:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dia, idx) => (
                        <label key={dia} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={encuestaDias.includes(idx)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEncuestaDias([...encuestaDias, idx]);
                              } else {
                                setEncuestaDias(encuestaDias.filter(d => d !== idx));
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          {dia}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Franja Inicio:</label>
                      <select
                        value={encuestaFranjaInicio}
                        onChange={(e) => setEncuestaFranjaInicio(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', fontSize: '0.8rem' }}
                      >
                        {Array.from({ length: 9 }).map((_, i) => (
                          <option key={i} value={i}>Bloque {i} ({(7 + i * 1.5).toString().split('.')[0].padStart(2, '0')}:00)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Franja Fin:</label>
                      <select
                        value={encuestaFranjaFin}
                        onChange={(e) => setEncuestaFranjaFin(Number(e.target.value))}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', fontSize: '0.8rem' }}
                      >
                        {Array.from({ length: 9 }).map((_, i) => (
                          <option key={i} value={i}>Bloque {i} ({(8 + i * 1.5).toString().split('.')[0].padStart(2, '0')}:30)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tiempo de Traslado */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                  Tiempo de traslado a la U (minutos):
                </label>
                <input
                  type="number"
                  min="0"
                  max="240"
                  value={encuestaTraslado}
                  onChange={(e) => setEncuestaTraslado(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Preferencia Turno */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                  Preferencia de Turno de Estudio:
                </label>
                <select
                  value={encuestaPreferencia}
                  onChange={(e) => setEncuestaPreferencia(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="Ninguno">Sin Preferencia</option>
                  <option value="Mañana">Turno Mañana (07am - 01pm)</option>
                  <option value="Tarde">Turno Tarde (01pm - 06pm)</option>
                  <option value="Noche">Turno Noche (06pm - 10pm)</option>
                </select>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '30px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEncuestaModal(false)}
                data-cy="cancel-survey-button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAsistenteConEncuesta}
                data-cy="submit-survey-button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Optimizar Horario
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CONFIRMACION CRUCE LABORAL */}
      {showCruceConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20001
        }}>
          <div className="glass-panel" style={{
            backgroundColor: '#1e293b',
            border: '2px solid #f5b041',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '95%',
            padding: '30px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 15px 0', color: '#f5b041', fontSize: '1.3rem' }}>
              Advertencia: Cruce con Horario Laboral
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5', margin: '0 0 20px 0', textAlign: 'left' }}>
              Se encontró una combinación sugerida para tu horario, pero existe un cruce entre tu horario laboral y la sección de las siguientes asignaturas:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 25px 0' }}>
              {cruceCursosList.map((curso, idx) => (
                <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'rgba(245, 176, 65, 0.15)', border: '1px solid #f5b041', borderRadius: '6px', fontSize: '0.85rem', color: '#f9e79f', fontWeight: 'bold' }}>
                  {curso}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 25px 0' }}>
              ¿Deseas aceptar este cruce laboral de forma excepcional y aplicar esta sugerencia al calendario de matrícula?
            </p>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCruceConfirm(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Rechazar Horario
              </button>
              <button
                onClick={() => {
                  setShowCruceConfirm(false);
                  aplicarSugeridas(tempSugeridas, tempFitness, tempSatisfaccion, tempAvisos);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f5b041',
                  color: '#1e293b',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Aceptar y Continuar
              </button>
            </div>

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
