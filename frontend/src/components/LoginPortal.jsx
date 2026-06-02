import React, { useState } from 'react';

export const LoginPortal = ({ 
  estudiantesSimulados = [], 
  docentesDisponibles = [], 
  onLogin 
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

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      color: '#cbd5e1',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid #334155',
        width: '450px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
        textAlign: 'center'
      }}>
        
        {/* LOGO O TÍTULO */}
        <h2 style={{ margin: '0 0 10px 0', color: '#f8fafc', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
          Ingreso <span style={{ color: '#38bdf8' }}>Planner-UC</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '30px' }}>
          Seleccione su cuenta o perfil de simulación para ingresar.
        </p>

        {/* 1. SECTOR DE ADMINISTRADOR */}
        <form onSubmit={handleAdminSubmit} style={{ 
          background: '#0f172a', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🛠️ Acceso Administrador
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <input 
              type="text" 
              placeholder="Usuario (admin)" 
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <input 
              type="password" 
              placeholder="Contraseña (admin)" 
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            {errorAdmin && <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{errorAdmin}</span>}
            <button 
              type="submit"
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '5px'
              }}
            >
              Iniciar Sesión
            </button>
          </div>
        </form>

        {/* 2. SECTOR DE ESTUDIANTE */}
        <div style={{ 
          background: '#0f172a', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎓 Acceso Estudiante (Simulación)
          </h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Seleccione estudiante...</option>
              {estudiantesSimulados.map(est => (
                <option key={est._id} value={est._id}>{est.nombre}</option>
              ))}
            </select>
            <button
              onClick={handleStudentLogin}
              disabled={!selectedStudentId}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: selectedStudentId ? 1 : 0.5
              }}
            >
              Ingresar
            </button>
          </div>
        </div>

        {/* 3. SECTOR DE DOCENTE */}
        <div style={{ 
          background: '#0f172a', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#c084fc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            👩‍🏫 Acceso Docente (Simulación)
          </h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedDocenteId}
              onChange={(e) => setSelectedDocenteId(e.target.value)}
              style={{
                flexGrow: 1,
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Seleccione docente...</option>
              {docentesDisponibles.map(doc => (
                <option key={doc._id} value={doc._id}>{doc.nombre}</option>
              ))}
            </select>
            <button
              onClick={handleDocenteLogin}
              disabled={!selectedDocenteId}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#c084fc',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: selectedDocenteId ? 1 : 0.5
              }}
            >
              Ingresar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
