import { http, HttpResponse } from 'msw';

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
    horario: [{ dia: 'Lunes', franja: [1, 2] }] 
  },
  { 
    _id: 's2', 
    codigo: 'SEC02', 
    curso: mockCursos[1], 
    docente: mockDocentes[1], 
    aula: mockAulas[1], 
    vacantesTotales: 40, 
    vacantesDisponibles: 40, 
    horario: [{ dia: 'Martes', franja: [3, 4] }] 
  }
];

export const handlers = [
  // INFRAESTRUCTURA Y ENTIDADES
  http.get('http://localhost:3000/api/cursos', () => HttpResponse.json(mockCursos)),
  http.get('http://localhost:3000/api/docentes', () => HttpResponse.json(mockDocentes)),
  http.get('http://localhost:3000/api/aulas', () => HttpResponse.json(mockAulas)),
  http.get('http://localhost:3000/api/carreras', () => HttpResponse.json(mockCarreras)),
  http.get('http://localhost:3000/api/estudiantes', () => HttpResponse.json(mockEstudiantes)),
  http.get('http://localhost:3000/api/secciones', () => HttpResponse.json(mockSecciones)),

  // MANTENIMIENTO ACADÉMICO (CRUD)
  // Carreras
  http.post('http://localhost:3000/api/admin/carreras', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, carrera: { _id: 'new-car', ...data } });
  }),
  http.put('http://localhost:3000/api/admin/carreras/:id', async ({ request, params }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, carrera: { _id: params.id, ...data } });
  }),
  http.delete('http://localhost:3000/api/admin/carreras/:id', () => HttpResponse.json({ success: true })),

  // Cursos
  http.post('http://localhost:3000/api/admin/cursos', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, curso: { _id: 'new-cur', ...data } });
  }),
  http.put('http://localhost:3000/api/admin/cursos/:id', async ({ request, params }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, curso: { _id: params.id, ...data } });
  }),
  http.delete('http://localhost:3000/api/admin/cursos/:id', () => HttpResponse.json({ success: true })),

  // Docentes
  http.post('http://localhost:3000/api/admin/docentes', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, docente: { _id: 'new-doc', ...data } });
  }),
  http.put('http://localhost:3000/api/admin/docentes/:id', async ({ request, params }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, docente: { _id: params.id, ...data } });
  }),
  http.delete('http://localhost:3000/api/admin/docentes/:id', () => HttpResponse.json({ success: true })),

  // Aulas
  http.post('http://localhost:3000/api/admin/aulas', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, aula: { _id: 'new-aul', ...data } });
  }),
  http.put('http://localhost:3000/api/admin/aulas/:id', async ({ request, params }) => {
    const data = await request.json();
    return HttpResponse.json({ success: true, aula: { _id: params.id, ...data } });
  }),
  http.delete('http://localhost:3000/api/admin/aulas/:id', () => HttpResponse.json({ success: true })),

  // EMISIONES ECOLÓGICAS
  http.get('http://localhost:3000/environmental-impact', () => {
    return new HttpResponse(
      'Total solicitudes procesadas: 10\nCO2 Total generado: 0.123456 gramos\nSolicitud promedio: 1500 Bytes',
      { headers: { 'Content-Type': 'text/plain' } }
    );
  }),

  // ACCIONES ADMINISTRADOR
  http.post('http://localhost:3000/api/admin/actualizar-pagos', async ({ request }) => {
    const data = await request.json();
    const est = mockEstudiantes.find(e => e._id === data.estudianteId) || mockEstudiantes[0];
    const updatedEst = { ...est, [data.campo]: data.valor };
    return HttpResponse.json({ success: true, estudiante: updatedEst });
  }),
  http.post('http://localhost:3000/api/admin/generar-horarios-globales', () => {
    return HttpResponse.json({ success: true, fitness: 0.985 });
  }),

  // ACCIONES ESTUDIANTE
  http.post('http://localhost:3000/api/matricula', () => {
    const updatedEst = { ...mockEstudiantes[0], estadoMatricula: 'Matriculado' };
    return HttpResponse.json({ success: true, estudiante: updatedEst, matricula: { _id: 'm1', secciones: [mockSecciones[0]._id] } });
  }),
  http.post('http://localhost:3000/api/matricula/asistente', () => {
    return HttpResponse.json({ success: true, fitness: 0.85, seccionesSugeridas: [mockSecciones[0]] });
  }),
  http.post('http://localhost:3000/api/matricula/dirigida', () => {
    return HttpResponse.json({ success: true, mensaje: 'Solicitud enviada con éxito' });
  }),
  http.post('http://localhost:3000/api/matricula/reserva', () => {
    return HttpResponse.json({ success: true, mensaje: 'Matrícula reservada' });
  }),
  http.post('http://localhost:3000/api/matricula/retiro', () => {
    return HttpResponse.json({ success: true, mensaje: 'Retiro procesado' });
  })
];
