import React, { useState } from 'react';

export const LoginPortal = ({ 
  estudiantesSimulados = [], 
  docentesDisponibles = [], 
  onLogin,
  rutaActual = '/login',
  onNavegar
}) => {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDocenteId, setSelectedDocenteId] = useState('');
  const [errorAdmin, setErrorAdmin] = useState('');

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorAdmin('');
    if (adminUser === 'admin' && adminPass === 'admin') {
      onLogin('administrador', null);
    } else {
      setErrorAdmin('Usuario o contraseña de administrador incorrectos.');
    }
  };

  const handleStudentLogin = () => {
    if (!selectedStudentId) return;
    const student = estudiantesSimulados.find(e => e._id === selectedStudentId);
    if (student) onLogin('estudiante', student);
  };

  const handleDocenteLogin = () => {
    if (!selectedDocenteId) return;
    const docente = docentesDisponibles.find(d => d._id === selectedDocenteId);
    if (docente) onLogin('docente', docente);
  };

  const isPortal = rutaActual === '/login' || rutaActual === '/';
  const isAdminRoute = rutaActual === '/login/admin';
  const isDocenteRoute = rutaActual === '/login/docente';
  const isEstudianteRoute = rutaActual === '/login/estudiante';

  // Renderizadores de Formularios
  const renderAdminForm = () => (
    <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Usuario Administrador</label>
        <input 
          type="text" 
          placeholder="Ej. admin" 
          value={adminUser}
          onChange={(e) => setAdminUser(e.target.value)}
          data-cy="admin-user-input"
          style={{
            padding: '11px 14px',
            borderRadius: '8px',
            backgroundColor: '#0c1222',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Contraseña</label>
        <input 
          type="password" 
          placeholder="Ej. admin" 
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
          data-cy="admin-pass-input"
          style={{
            padding: '11px 14px',
            borderRadius: '8px',
            backgroundColor: '#0c1222',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        />
      </div>
      {errorAdmin && <span style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: '600' }}>⚠️ {errorAdmin}</span>}
      
      <button 
        type="submit"
        data-cy="admin-login-button"
        className="btn-cyber-primary"
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          marginTop: '5px'
        }}
      >
        Iniciar Sesión
      </button>
    </form>
  );

  const renderDocenteForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Seleccione su Nombre</label>
        <select
          value={selectedDocenteId}
          onChange={(e) => setSelectedDocenteId(e.target.value)}
          data-cy="docente-select"
          style={{
            padding: '11px 14px',
            borderRadius: '8px',
            backgroundColor: '#0c1222',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#c084fc'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          {docentesDisponibles.length === 0 ? (
            <option value="">Cargando docentes...</option>
          ) : (
            <>
              <option value="">Seleccione docente...</option>
              {docentesDisponibles.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.nombre}</option>
              ))}
            </>
          )}
        </select>
      </div>

      <button
        onClick={handleDocenteLogin}
        disabled={!selectedDocenteId}
        data-cy="docente-login-button"
        style={{
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #c084fc 0%, #8b5cf6 100%)',
          color: '#000',
          fontWeight: '800',
          cursor: 'pointer',
          fontSize: '0.85rem',
          opacity: selectedDocenteId ? 1 : 0.5,
          boxShadow: selectedDocenteId ? '0 4px 12px rgba(139, 92, 246, 0.25)' : 'none'
        }}
      >
        Iniciar Simulación Docente
      </button>
    </div>
  );

  const renderStudentForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Seleccione su Nombre</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          data-cy="student-select"
          style={{
            padding: '11px 14px',
            borderRadius: '8px',
            backgroundColor: '#0c1222',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#10b981'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          {estudiantesSimulados.length === 0 ? (
            <option value="">Cargando estudiantes...</option>
          ) : (
            <>
              <option value="">Seleccione estudiante...</option>
              {estudiantesSimulados.map(est => (
                <option key={est._id} value={est._id}>{est.nombre}</option>
              ))}
            </>
          )}
        </select>
      </div>

      <button
        onClick={handleStudentLogin}
        disabled={!selectedStudentId}
        data-cy="student-login-button"
        style={{
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#000',
          fontWeight: '800',
          cursor: 'pointer',
          fontSize: '0.85rem',
          opacity: selectedStudentId ? 1 : 0.5,
          boxShadow: selectedStudentId ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
        }}
      >
        Iniciar Simulación Alumno
      </button>
    </div>
  );

  // 1. VISTA DE PORTAL DE SELECCIÓN DE PERFIL CON FORMULARIOS INTEGRADOS (Vista general /login)
  if (isPortal) {
    const rolesCards = [
      {
        title: "Administrador",
        desc: "Acceso para el personal de control académico. Gestione la infraestructura de la universidad y ejecute el algoritmo genético para la distribución horaria global.",
        icon: "🛠️",
        glowColor: "rgba(56, 189, 248, 0.4)",
        borderColor: "rgba(56, 189, 248, 0.15)",
        formRenderer: renderAdminForm
      },
      {
        title: "Profesor / Docente",
        desc: "Acceso para docentes asignados. Registre sus restricciones de disponibilidad semanal y visualice sus agendas académicas y listas de alumnos matriculados.",
        icon: "👩‍🏫",
        glowColor: "rgba(167, 139, 250, 0.4)",
        borderColor: "rgba(167, 139, 250, 0.15)",
        formRenderer: renderDocenteForm
      },
      {
        title: "Estudiante de Pregrado",
        desc: "Acceso para alumnos regulares. Realice su matrícula asistida con el asesor genético de horario, solicite reservas o retiros y verifique su avance de créditos.",
        icon: "🎓",
        glowColor: "rgba(16, 185, 129, 0.4)",
        borderColor: "rgba(16, 185, 129, 0.15)",
        formRenderer: renderStudentForm
      }
    ];

    return (
      <div style={{ padding: '40px 20px', maxWidth: '1250px', margin: '0 auto' }}>
        
        {/* Cabecera del Portal */}
        <div style={{ textAlign: 'center', marginBottom: '45px' }}>
          <h1 style={{
            fontSize: '3rem',
            margin: '0 0 10px 0',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #f8fafc 40%, #64748b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Planner-UC <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Inteligente</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: '0 auto', maxWidth: '600px', lineHeight: '1.6' }}>
            Bienvenido al portal de simulación académica. Ingrese sus credenciales o seleccione su perfil de simulación para ingresar.
          </p>
        </div>

        {/* Tarjetas de Selección de Perfil y Formularios */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', margin: '0 auto' }}>
          {rolesCards.map((role, idx) => (
            <div 
              key={idx}
              className="glass-panel"
              style={{
                padding: '35px 25px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '480px',
                transition: 'all 0.3s ease',
                border: `1px solid ${role.borderColor}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 15px 30px -10px ${role.glowColor}`;
                e.currentTarget.style.borderColor = role.glowColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = role.borderColor;
              }}
            >
              <div>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>{role.icon}</span>
                <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0 0 10px 0', fontWeight: '800' }}>
                  {role.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 25px 0' }}>
                  {role.desc}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {role.formRenderer()}
              </div>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '70px', textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
          Planner-UC — Sistema de Simulación de Carga Académica Basado en Algoritmos Genéticos y Green Software. 2026.
        </footer>

      </div>
    );
  }

  // 2. VISTAS DE LOGINS INDIVIDUALES (Si se accede directamente a sub-rutas como /login/admin, /login/estudiante, etc.)
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      color: '#cbd5e1',
      padding: '20px'
    }}>
      
      <div className="glass-panel animate-fade-in" style={{
        padding: '35px',
        width: '450px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Cabecera del Login Específico */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>
            {isAdminRoute && '🛠️'}
            {isDocenteRoute && '👩‍🏫'}
            {isEstudianteRoute && '🎓'}
          </span>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: '#f8fafc', fontWeight: '800' }}>
            {isAdminRoute && 'Acceso Administrador'}
            {isDocenteRoute && 'Portal de Docentes'}
            {isEstudianteRoute && 'Portal de Estudiantes'}
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
            {isAdminRoute && 'Ingrese sus credenciales de administración académica.'}
            {isDocenteRoute && 'Seleccione su perfil de docente para la simulación.'}
            {isEstudianteRoute && 'Seleccione su perfil de estudiante para la simulación.'}
          </p>
        </div>

        {/* Formularios Específicos */}
        {isAdminRoute && renderAdminForm()}
        {isDocenteRoute && renderDocenteForm()}
        {isEstudianteRoute && renderStudentForm()}

        {/* Botón Volver */}
        <button
          onClick={() => onNavegar('/login')}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '10px',
            background: 'transparent',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
            color: '#94a3b8',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          ← Volver al Portal de Selección
        </button>

      </div>
      
    </div>
  );
};

