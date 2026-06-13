import { procesarMatricula, solicitarAsignaturaDirigida } from '../controllers/studentController.js';
import { Estudiante, Seccion, Matricula, Curso, Carrera, Aula, Docente } from '../models/Schemas.js';
import { jest } from '@jest/globals';
import request from 'supertest';
import { setupIntegration, teardownIntegration, logApiCall } from './integrationHelper.js';


describe('Validaciones de Matrícula (RF y RNF)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        estudianteId: '60c72b2f9b1d8b2bad7c7f01',
        seccionIds: ['60c72b2f9b1d8b2bad7c7f02'],
        asistenciaHibrida: {},
        semana: 1,
        tipoPeriodo: 'Regular'
      }
    };

    res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('RNF-01: Debe bloquear la matrícula si el estudiante presenta deudas', async () => {
    // Mock Estudiante con deuda
    jest.spyOn(Estudiante, 'findById').mockResolvedValue({
      nombre: "Ana Rojas",
      tieneDeudas: true,
      tasaPagada: true,
      seguroVigente: true,
      planVigente: true,
      save: jest.fn().mockResolvedValue(true)
    });

    await procesarMatricula(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining("El estudiante presenta deudas pendientes")
    }));
  });

  test('RF-02: Debe bloquear la matrícula si no se cumplen los prerrequisitos del curso', async () => {
    // Mock Estudiante regular sin Cálculo I aprobado
    jest.spyOn(Estudiante, 'findById').mockResolvedValue({
      nombre: "Pedro Gómez",
      tieneDeudas: false,
      tasaPagada: true,
      seguroVigente: true,
      planVigente: true,
      cursosAprobados: [], // No tiene ASUCO1113 (prerrequisito)
      historialDesaprobados: new Map(),
      save: jest.fn().mockResolvedValue(true)
    });

    // Mock Sección de Álgebra que requiere ASUCO1113
    jest.spyOn(Seccion, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        {
          _id: '60c72b2f9b1d8b2bad7c7f02',
          codigo: "ASUCO1108-SEC01",
          curso: {
            codigo: "ASUCO1108",
            nombre: "Álgebra Matricial",
            creditos: 4,
            prerrequisitos: ["ASUCO1113"]
          },
          horario: [{ dia: 1, franja: 2 }],
          vacantesDisponibles: 20
        }
      ])
    });

    await procesarMatricula(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining("Prerrequisito no cumplido")
    }));
  });

  test('RF-04: Debe limitar la carga académica a 16 créditos por segunda desaprobación', async () => {
    // Mock Estudiante con 2da desaprobación
    const historial = new Map();
    historial.set("ASUCO1482", 2); // POO desaprobada 2 veces

    jest.spyOn(Estudiante, 'findById').mockResolvedValue({
      nombre: "José Pérez",
      tieneDeudas: false,
      tasaPagada: true,
      seguroVigente: true,
      planVigente: true,
      cursosAprobados: ["ASUCO1312"],
      historialDesaprobados: historial,
      save: jest.fn().mockResolvedValue(true)
    });

    // Cambiar seccionIds en la petición para que coincida con las 5 secciones mockeadas
    req.body.seccionIds = ['1', '2', '3', '4', '5'];

    // Mock 5 secciones (total 20 créditos)
    jest.spyOn(Seccion, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([
        { _id: '1', curso: { codigo: "A", creditos: 4, prerrequisitos: [] }, horario: [{ dia: 0, franja: 1 }], vacantesDisponibles: 20 },
        { _id: '2', curso: { codigo: "B", creditos: 4, prerrequisitos: [] }, horario: [{ dia: 1, franja: 1 }], vacantesDisponibles: 20 },
        { _id: '3', curso: { codigo: "C", creditos: 4, prerrequisitos: [] }, horario: [{ dia: 2, franja: 1 }], vacantesDisponibles: 20 },
        { _id: '4', curso: { codigo: "D", creditos: 4, prerrequisitos: [] }, horario: [{ dia: 3, franja: 1 }], vacantesDisponibles: 20 },
        { _id: '5', curso: { codigo: "E", creditos: 4, prerrequisitos: [] }, horario: [{ dia: 4, franja: 1 }], vacantesDisponibles: 20 }
      ])
    });

    await procesarMatricula(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining("Carga máxima bloqueada a 16 créditos")
    }));
  });

  test('RF-06: Asignaturas de Investigación no pueden solicitarse de forma dirigida', async () => {
    // Mock Estudiante y Curso
    jest.spyOn(Estudiante, 'findById').mockResolvedValue({
      nombre: "Clara Benítez",
      cantidadDirigidos: 0,
      historialDesaprobados: new Map()
    });

    jest.spyOn(Curso, 'findById').mockResolvedValue({
      codigo: "ASUCO1580",
      nombre: "Taller de Investigación 1",
      prerrequisitos: []
    });

    req.body = { estudianteId: '60c72b2f9b1d8b2bad7c7f01', cursoId: '60c72b2f9b1d8b2bad7c7f05' };

    await solicitarAsignaturaDirigida(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining("Las asignaturas de Taller de Investigación 1 y 2 no pueden ser cursadas de forma dirigida")
    }));
  });
});

describe('Pruebas de Integración - Matrícula y Mantenimiento (Supertest)', () => {
  let serverUrl;

  beforeAll(async () => {
    serverUrl = await setupIntegration();
  }, 30000);

  afterAll(async () => {
    await teardownIntegration();
  }, 30000);

  describe('1. Peticiones Válidas (HTTP 200/201)', () => {
    test('Debe registrar una nueva carrera y persistirla en la BD en memoria', async () => {
      const nuevaCarrera = { codigo: 'ING-INF', nombre: 'Ingeniería Informática' };
      
      const resPost = await request(serverUrl)
        .post('/api/admin/carreras')
        .send(nuevaCarrera);
      
      logApiCall('POST', '/api/admin/carreras', resPost.statusCode, resPost.body);
      expect(resPost.statusCode).toBe(200);
      expect(resPost.body.success).toBe(true);
      expect(resPost.body.carrera.codigo).toBe('ING-INF');

      // Verificar persistencia real mediante GET
      const resGet = await request(serverUrl).get('/api/carreras');
      logApiCall('GET', '/api/carreras', resGet.statusCode, resGet.body);
      expect(resGet.statusCode).toBe(200);
      const carreraPersistida = resGet.body.find(c => c.codigo === 'ING-INF');
      expect(carreraPersistida).toBeDefined();
      expect(carreraPersistida.nombre).toBe('Ingeniería Informática');
    });
  });

  describe('2. Peticiones Inválidas (HTTP 400 / 404)', () => {
    test('Debe rechazar solicitud de asignatura dirigida con payload incompleto', async () => {
      const res = await request(serverUrl)
        .post('/api/matricula/dirigida')
        .send({ estudianteId: '60c72b2f9b1d8b2bad7c7f01' }); // Falta cursoId
      
      logApiCall('POST', '/api/matricula/dirigida', res.statusCode, res.body);
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('3. Acceso No Autorizado / Prohibido (HTTP 403)', () => {
    test('Debe bloquear la matrícula de un estudiante con deudas pendientes', async () => {
      // Registrar un estudiante deudor en la base de datos efímera
      const estudianteDeudor = await Estudiante.create({
        codigo: '20239999',
        nombre: 'Estudiante Deudor',
        planEstudios: 'ING-INF',
        tieneDeudas: true,
        tasaPagada: true,
        seguroVigente: true,
        planVigente: true
      });

      const res = await request(serverUrl)
        .post('/api/matricula')
        .send({
          estudianteId: estudianteDeudor._id.toString(),
          seccionIds: []
        });

      logApiCall('POST', '/api/matricula', res.statusCode, res.body);
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('presenta deudas pendientes');
    });
  });

  describe('4. Datos Inconsistentes (HTTP 400)', () => {
    test('Debe bloquear la matrícula si no se cumplen los prerrequisitos del curso', async () => {
      // Registrar curso con prerrequisitos, sección del curso, y estudiante regular sin prerrequisitos
      const cursoPrereq = await Curso.create({
        codigo: 'INF-301',
        nombre: 'Sistemas Distribuidos',
        creditos: 4,
        semestre: 5,
        prerrequisitos: ['INF-201']
      });

      const aula = await Aula.create({
        nombre: 'A101',
        capacidad: 40,
        tipo: 'Teoría'
      });

      const docente = await Docente.create({
        nombre: 'Docente Prueba',
        especialidad: ['INF-301'],
        disponibilidad: [{ dia: 'Lunes', franja: [1, 2, 3] }]
      });

      const seccion = await Seccion.create({
        codigo: 'INF-301-SEC01',
        curso: cursoPrereq._id,
        aula: aula._id,
        docente: docente._id,
        vacantesTotales: 20,
        vacantesDisponibles: 20,
        horario: [{ dia: 1, franja: 2 }]
      });

      const estudiante = await Estudiante.create({
        codigo: '20238888',
        nombre: 'Estudiante Sin Prereq',
        planEstudios: 'ING-INF',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        planVigente: true,
        semestre: 10,
        cursosAprobados: [] // Sin el prerequisito 'INF-201'
      });

      const res = await request(serverUrl)
        .post('/api/matricula')
        .send({
          estudianteId: estudiante._id.toString(),
          seccionIds: [seccion._id.toString()],
          justificacionCargaMinima: true
        });

      logApiCall('POST', '/api/matricula', res.statusCode, res.body);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Prerrequisito no cumplido');
    });
  });
});
