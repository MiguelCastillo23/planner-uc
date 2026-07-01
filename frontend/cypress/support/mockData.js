export const mockCursos = [
  { _id: 'c1', nombre: 'Introducción a la Programación', codigo: 'INF-101', creditos: 4, semestre: 1, prerrequisitos: [], modalidad: 'Presencial' },
  { _id: 'c2', nombre: 'Estructuras de Datos', codigo: 'INF-102', creditos: 3, semestre: 1, prerrequisitos: ['INF-101'], modalidad: 'Híbrido' }
];

export const mockDocentes = [
  { _id: 'd1', nombre: 'Prof. Alan Turing', especialidad: ['INF-101'], disponibilidad: [] },
  { _id: 'd2', nombre: 'Prof. Ada Lovelace', especialidad: ['INF-102'], disponibilidad: [] }
];

export const mockAulas = [
  { _id: 'a1', nombre: 'Lab 101', capacidad: 30, tipo: 'Laboratorio' },
  { _id: 'a2', nombre: 'Aula 201', capacidad: 40, tipo: 'Teoría' }
];

export const mockCarreras = [
  { _id: 'car1', codigo: 'ING-SIS', nombre: 'Ingeniería de Sistemas' }
];

export const mockEstudiantes = [
  { 
    _id: 'e1', 
    codigo: '20231010', 
    nombre: 'Estudiante Test', 
    planEstudios: 'ING-SIS', 
    planVigente: true, 
    semestre: 1, 
    cursosAprobados: [], 
    cantidadDirigidos: 0,
    tieneDeudas: false,
    tasaPagada: true,
    seguroVigente: true,
    estadoMatricula: 'Ninguno'
  },
  { 
    _id: 'e2', 
    codigo: '20231011', 
    nombre: 'Estudiante Deudor', 
    planEstudios: 'ING-SIS', 
    planVigente: true, 
    semestre: 1, 
    cursosAprobados: [], 
    cantidadDirigidos: 0,
    tieneDeudas: true,
    tasaPagada: false,
    seguroVigente: true,
    estadoMatricula: 'Ninguno'
  }
];

export const mockSecciones = [
  { 
    _id: 's1', 
    codigo: 'SEC01', 
    curso: mockCursos[0], 
    docente: mockDocentes[0], 
    aula: mockAulas[0], 
    vacantesTotales: 30, 
    vacantesDisponibles: 25, 
    horario: [{ dia: 0, franja: 1 }] // Lunes, 08:41 AM - 10:11 AM
  },
  { 
    _id: 's2', 
    codigo: 'SEC02', 
    curso: mockCursos[1], 
    docente: mockDocentes[1], 
    aula: mockAulas[1], 
    vacantesTotales: 40, 
    vacantesDisponibles: 40, 
    horario: [{ dia: 1, franja: 3 }] // Martes, 12:03 PM - 01:33 PM
  }
];
