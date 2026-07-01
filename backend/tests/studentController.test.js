import {
  getEstudiante,
  getSeccionesDisponibles,
  getEstudiantesSimulacion,
  procesarMatricula,
  autoMatricularAsistente,
  solicitarAsignaturaDirigida,
  procesarRetiroCurso,
  procesarReservaMatricula
} from '../controllers/studentController.js';
import { Estudiante, Seccion, Matricula, Curso } from '../models/Schemas.js';
import { GeneticEngine } from '../src/engine/genetic.js';
import { jest } from '@jest/globals';

describe('Student Controller - Pruebas Unitarias', () => {
  let req, res;

  const createMockStudent = (overrides = {}) => {
    return {
      _id: '60c72b2f9b1d8b2bad7c7f01',
      nombre: 'Pedro Gómez',
      codigo: 'EST001',
      semestre: 5,
      planEstudios: 'Plan 2018',
      planVigente: true,
      tieneDeudas: false,
      tasaPagada: true,
      seguroVigente: true,
      cursosAprobados: [],
      historialDesaprobados: new Map(),
      cantidadDirigidos: 0,
      estadoMatricula: 'Ninguno',
      save: jest.fn().mockResolvedValue(true),
      ...overrides
    };
  };

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
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

  describe('getEstudiante', () => {
    test('Debe retornar 200 y el estudiante si existe', async () => {
      req.params.codigo = 'EST001';
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findOne').mockResolvedValue(student);

      await getEstudiante(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith(student);
    });

    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.params.codigo = 'NO_EXISTE';
      jest.spyOn(Estudiante, 'findOne').mockResolvedValue(null);

      await getEstudiante(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado' });
    });

    test('Debe retornar 500 en caso de excepción', async () => {
      req.params.codigo = 'EST001';
      jest.spyOn(Estudiante, 'findOne').mockRejectedValue(new Error('DB error'));

      await getEstudiante(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error al obtener estudiante' }));
    });
  });

  describe('getSeccionesDisponibles', () => {
    test('Debe retornar 200 y las secciones', async () => {
      const mockSecciones = [{ codigo: 'SEC01', curso: 'c1' }];
      const mockPopulate = jest.fn();
      const mockLean = jest.fn().mockResolvedValue(mockSecciones);
      mockPopulate.mockReturnValue({ populate: mockPopulate, lean: mockLean });

      jest.spyOn(Seccion, 'find').mockReturnValue({ populate: mockPopulate });

      await getSeccionesDisponibles(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith(mockSecciones);
    });

    test('Debe retornar 500 si falla la consulta', async () => {
      jest.spyOn(Seccion, 'find').mockImplementation(() => {
        throw new Error('Find error');
      });

      await getSeccionesDisponibles(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error al obtener secciones' }));
    });
  });

  describe('getEstudiantesSimulacion', () => {
    test('Debe retornar 200 y estudiantes ordenados', async () => {
      const mockEstudiantes = [{ codigo: 'EST01' }, { codigo: 'EST02' }];
      jest.spyOn(Estudiante, 'find').mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockEstudiantes)
      });

      await getEstudiantesSimulacion(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith(mockEstudiantes);
    });

    test('Debe retornar 500 si falla la consulta', async () => {
      jest.spyOn(Estudiante, 'find').mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Sort error'))
      });

      await getEstudiantesSimulacion(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error al obtener estudiantes' }));
    });
  });

  describe('procesarMatricula', () => {
    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.body = { estudianteId: '60c72b2f9b1d8b2bad7c7f99', seccionIds: [] };
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(null);

      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado.' });
    });

    test('Debe adaptar automáticamente al Plan 2018 si no tiene planVigente', async () => {
      const student = createMockStudent({ planVigente: false, tieneDeudas: true }); // Bloquear después para no terminar el flujo
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      req.body = { estudianteId: student._id };
      await procesarMatricula(req, res);

      expect(student.planEstudios).toBe('Plan 2018');
      expect(student.planVigente).toBe(true);
      expect(student.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(403); // Bloqueado por deudas después del guardado del plan
    });

    test('Debe retornar 403 si el estudiante tiene deudas', async () => {
      const student = createMockStudent({ tieneDeudas: true });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      req.body = { estudianteId: student._id };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('presenta deudas pendientes') }));
    });

    test('Debe retornar 403 si la tasa educativa del ciclo no ha sido pagada', async () => {
      const student = createMockStudent({ tasaPagada: false });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      req.body = { estudianteId: student._id };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('pago de la tasa educativa') }));
    });

    test('Debe retornar 403 si el seguro obligatorio no está vigente', async () => {
      const student = createMockStudent({ seguroVigente: false });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      req.body = { estudianteId: student._id };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('seguro universitario obligatorio') }));
    });

    test('Debe retornar 400 si una o más secciones no existen', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      // Retorna menos secciones que las solicitadas
      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      req.body = { estudianteId: student._id, seccionIds: ['sec1'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Una o más secciones seleccionadas no existen.' });
    });

    test('Debe retornar 403 si el estudiante tiene una 4ta desaprobación (bloqueo definitivo)', async () => {
      const student = createMockStudent();
      student.historialDesaprobados.set('CURSO_FAIL', 4);
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ curso: { codigo: 'ASUCO1113', creditos: 4 } }])
      });

      req.body = { estudianteId: student._id, seccionIds: ['sec1'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('separado definitivamente') }));
    });

    test('Debe retornar 403 si tiene una 3ra desaprobación y se matricula en más cursos u otro curso', async () => {
      const student = createMockStudent();
      student.historialDesaprobados.set('CURSO_FAIL', 3);
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      // Intenta matricularse en dos secciones
      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'CURSO_FAIL', creditos: 3 } },
          { curso: { codigo: 'OTRO_CURSO', creditos: 3 } }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['sec1', 'sec2'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Solo se le permite matricularse en el curso desaprobado') }));
    });

    test('Debe retornar 403 si tiene una 2da desaprobación y la carga supera 16 créditos', async () => {
      const student = createMockStudent();
      student.historialDesaprobados.set('CURSO_FAIL', 2);
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'CURSO_1', creditos: 5, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_2', creditos: 5, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_3', creditos: 5, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_4', creditos: 2, prerrequisitos: [] } } // Total = 17 créditos
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1', 's2', 's3', 's4'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Carga máxima bloqueada a 16 créditos') }));
    });

    test('Debe retornar 400 si la carga excede los 25 créditos en ciclo ordinario', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'CURSO_1', creditos: 6, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_2', creditos: 6, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_3', creditos: 6, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_4', creditos: 5, prerrequisitos: [] } },
          { curso: { codigo: 'CURSO_5', creditos: 3, prerrequisitos: [] } } // Total = 26 créditos
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1', 's2', 's3', 's4', 's5'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('El límite máximo en periodos regulares es de 25 créditos') }));
    });

    test('Debe retornar 400 si la carga es menor a 12 créditos sin justificación', async () => {
      const student = createMockStudent({ semestre: 5 });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'CURSO_1', creditos: 4, prerrequisitos: [] } } // Menor a 12 créditos
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('matrícula mínima de 12 créditos') }));
    });

    test('Debe permitir menos de 12 créditos si cuenta con justificación o es del semestre >= 10', async () => {
      const student = createMockStudent({ semestre: 10 });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      const mockSeccion = {
        _id: 's1',
        codigo: 'SEC01',
        curso: { codigo: 'CURSO_1', creditos: 4, prerrequisitos: [], modalidad: 'Presencial' },
        horario: [{ dia: 1, franja: 2 }],
        vacantesDisponibles: 10
      };

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockSeccion])
      });

      jest.spyOn(Matricula.prototype, 'save').mockResolvedValue({});
      jest.spyOn(Seccion, 'findByIdAndUpdate').mockResolvedValue({});

      req.body = { estudianteId: student._id, seccionIds: ['s1'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(200);
    });

    test('Debe retornar 400 si no se cumplen los prerrequisitos del curso', async () => {
      const student = createMockStudent({ cursosAprobados: [] });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'CURSO_AVANZADO', creditos: 4, prerrequisitos: ['CURSO_BASE'] } }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'], justificacionCargaMinima: true };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Prerrequisito no cumplido') }));
    });

    test('Debe retornar 400 si se matricula en Taller de Investigación 2 sin aprobar Taller de Investigación 1', async () => {
      const student = createMockStudent({ cursosAprobados: [] }); // No tiene ASUCO1580
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'ASUCO1581', creditos: 4, prerrequisitos: [] } }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'], justificacionCargaMinima: true };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Taller de Investigación 2 requiere la aprobación continua') }));
    });

    test('Debe retornar 400 si se intenta matricular Investigación en Verano', async () => {
      const student = createMockStudent({ cursosAprobados: ['PREREQ_MOCK'] });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'ASUCO1580', creditos: 4, prerrequisitos: [] } }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'], tipoPeriodo: 'Verano', justificacionCargaMinima: true };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('no están disponibles para matrícula en ciclos de verano') }));
    });

    test('Debe retornar 400 si hay cruce de horarios entre las secciones', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'C1', creditos: 6, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }] },
          { curso: { codigo: 'C2', creditos: 6, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }] } // Mismo día y franja
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1', 's2'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Cruce de horarios') }));
    });

    test('Debe retornar 400 si no hay vacantes disponibles en la sección', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { curso: { codigo: 'C1', creditos: 12, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }], vacantesDisponibles: 0 }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'] };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Vacantes agotadas') }));
    });

    test('Debe retornar 400 si el curso es Híbrido pero no se especifica forma de asistencia válida', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          { _id: 's1', curso: { nombre: 'HibridoCurso', codigo: 'C1', creditos: 12, modalidad: 'Híbrido', prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }], vacantesDisponibles: 10 }
        ])
      });

      req.body = { estudianteId: student._id, seccionIds: ['s1'], asistenciaHibrida: { s1: 'Virtual' } }; // 'Virtual' es inválido (debe ser Física o Remota)
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Debe definir la modalidad de asistencia (Física o Remota)') }));
    });

    test('Debe formalizar matrícula exitosamente (200) y descontar vacantes', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      const mockSeccion = {
        _id: 's1',
        codigo: 'SEC01',
        curso: { nombre: 'HibridoCurso', codigo: 'C1', creditos: 12, modalidad: 'Híbrido', prerrequisitos: [] },
        horario: [{ dia: 1, franja: 2 }],
        vacantesDisponibles: 10
      };

      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockSeccion])
      });

      jest.spyOn(Matricula.prototype, 'save').mockResolvedValue({});
      jest.spyOn(Seccion, 'findByIdAndUpdate').mockResolvedValue({});

      req.body = { estudianteId: student._id, seccionIds: ['s1'], asistenciaHibrida: { s1: 'Física' } };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(200);
      expect(student.estadoMatricula).toBe('Matriculado');
      expect(student.save).toHaveBeenCalled();
      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledWith('s1', { $inc: { vacantesDisponibles: -1 } });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('Debe retornar 500 si ocurre un error durante el procesamiento', async () => {
      jest.spyOn(Estudiante, 'findById').mockRejectedValue(new Error('Crash'));

      req.body = { estudianteId: 'some-id' };
      await procesarMatricula(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Error en el servidor al formalizar la matrícula' }));
    });
  });

  describe('autoMatricularAsistente', () => {
    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.body = { estudianteId: 'est-id', cursoIds: [] };
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(null);

      await autoMatricularAsistente(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado.' });
    });

    test('Debe retornar sugerencias de matrícula exitosamente (200)', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'find').mockResolvedValue([{ _id: 'c1' }]);

      const mockSeccion = { curso: 'c1', horario: [{ dia: 1, franja: 2 }] };
      jest.spyOn(Seccion, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockSeccion])
        })
      });

      req.body = { estudianteId: student._id, cursoIds: ['c1'] };

      const spyCrearIndividuo = jest.spyOn(GeneticEngine.prototype, 'crearIndividuoAlumno');
      const spyCalcularFitness = jest.spyOn(GeneticEngine.prototype, 'calcularFitnessAlumno');

      await autoMatricularAsistente(req, res);

      expect(res.statusCode).toBe(200);
      expect(spyCrearIndividuo).toHaveBeenCalled();
      expect(spyCalcularFitness).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        fitness: expect.any(Number),
        seccionesSugeridas: expect.any(Array)
      }));
    });

    test('Debe retornar 500 en caso de excepción', async () => {
      jest.spyOn(Estudiante, 'findById').mockRejectedValue(new Error('Crash'));
      req.body = { estudianteId: 'est-id' };

      await autoMatricularAsistente(req, res);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('solicitarAsignaturaDirigida', () => {
    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.body = { estudianteId: 'est-id', cursoId: 'cur-id' };
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(null);

      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado.' });
    });

    test('Debe retornar 404 si el curso no existe', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue(null);

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Curso no encontrado.' });
    });

    test('Debe retornar 400 si ya superó el límite de 3 dirigidas', async () => {
      const student = createMockStudent({ cantidadDirigidos: 3 });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue({ codigo: 'C1' });

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Límite superado') }));
    });

    test('Debe retornar 400 si el curso es Investigación (ASUCO1580 o ASUCO1581)', async () => {
      const student = createMockStudent({ cantidadDirigidos: 1 });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue({ codigo: 'ASUCO1580' });

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('no pueden ser cursadas de forma dirigida') }));
    });

    test('Debe retornar 400 si el estudiante desaprobó el curso 2 o más veces', async () => {
      const student = createMockStudent({ cantidadDirigidos: 1 });
      student.historialDesaprobados.set('CURSO_FAIL', 2);
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue({ codigo: 'CURSO_FAIL' });

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('ha desaprobado dos o más veces') }));
    });

    test('Debe retornar 400 si no se cumplen los prerrequisitos del curso dirigido', async () => {
      const student = createMockStudent({ cantidadDirigidos: 1, cursosAprobados: [] });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue({ codigo: 'C2', prerrequisitos: ['C1'] });

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Prerrequisito no cumplido') }));
    });

    test('Debe registrar la asignatura dirigida con éxito (200) e incrementar el contador', async () => {
      const student = createMockStudent({ cantidadDirigidos: 1, cursosAprobados: ['C1'] });
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);
      jest.spyOn(Curso, 'findById').mockResolvedValue({ nombre: 'Curso Dirigido', codigo: 'C2', prerrequisitos: ['C1'] });

      req.body = { estudianteId: student._id, cursoId: 'cur-id' };
      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(200);
      expect(student.cantidadDirigidos).toBe(2);
      expect(student.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, cantidadDirigidos: 2 }));
    });

    test('Debe retornar 500 si falla la base de datos', async () => {
      jest.spyOn(Estudiante, 'findById').mockRejectedValue(new Error('DB failure'));
      req.body = { estudianteId: 'est-id' };

      await solicitarAsignaturaDirigida(req, res);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('procesarRetiroCurso', () => {
    test('Debe retornar 404 si la matrícula no existe', async () => {
      req.body = { matriculaId: 'mat-id', seccionId: 'sec-id' };
      jest.spyOn(Matricula, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Matrícula no encontrada.' });
    });

    test('Debe retornar 404 si la sección no existe', async () => {
      const mockMatricula = { _id: 'mat-123', secciones: [] };
      jest.spyOn(Matricula, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatricula)
      });
      jest.spyOn(Seccion, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      req.body = { matriculaId: 'mat-id', seccionId: 'sec-id' };
      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Sección no encontrada.' });
    });

    test('Debe retornar 400 si se excede el límite de semanas para Semipresencial/Distancia (Semana 7)', async () => {
      const mockMatricula = { _id: 'mat-123', secciones: [], save: jest.fn() };
      jest.spyOn(Matricula, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatricula)
      });

      const mockSeccion = {
        _id: 'sec-id',
        curso: { nombre: 'C1', modalidad: 'Semipresencial' }
      };
      jest.spyOn(Seccion, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSeccion)
      });

      req.body = { matriculaId: 'mat-id', seccionId: 'sec-id', semanaSimulada: 8 }; // Excede semana 7
      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Plazo vencido') }));
    });

    test('Debe retornar 400 si se excede el límite de semanas para Presencial (Semana 14)', async () => {
      const mockMatricula = { _id: 'mat-123', secciones: [], save: jest.fn() };
      jest.spyOn(Matricula, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatricula)
      });

      const mockSeccion = {
        _id: 'sec-id',
        curso: { nombre: 'C1', modalidad: 'Presencial' }
      };
      jest.spyOn(Seccion, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSeccion)
      });

      req.body = { matriculaId: 'mat-id', seccionId: 'sec-id', semanaSimulada: 15 }; // Excede semana 14
      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Plazo vencido') }));
    });

    test('Debe procesar el retiro del curso con éxito (200) y devolver vacante', async () => {
      const mockMatricula = {
        _id: 'mat-123',
        secciones: [
          { _id: 'sec-id' },
          { _id: 'otra-sec' }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      jest.spyOn(Matricula, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMatricula)
      });

      const mockSeccion = {
        _id: 'sec-id',
        curso: { nombre: 'Curso Presencial', modalidad: 'Presencial' }
      };
      jest.spyOn(Seccion, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSeccion)
      });

      jest.spyOn(Seccion, 'findByIdAndUpdate').mockResolvedValue({});

      req.body = { matriculaId: 'mat-id', seccionId: 'sec-id', semanaSimulada: 10 };
      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockMatricula.secciones.length).toBe(1); // Se removió la sección correspondiente
      expect(mockMatricula.save).toHaveBeenCalled();
      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledWith('sec-id', { $inc: { vacantesDisponibles: 1 } });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('Debe retornar 500 si ocurre un error', async () => {
      jest.spyOn(Matricula, 'findById').mockImplementation(() => {
        throw new Error('Matricula query fail');
      });
      req.body = { matriculaId: 'mat-id' };

      await procesarRetiroCurso(req, res);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('procesarReservaMatricula', () => {
    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.body = { estudianteId: 'est-id', semanaSimulada: 1 };
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(null);

      await procesarReservaMatricula(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado.' });
    });

    test('Debe retornar 400 si se excede la semana 2 de reserva', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      req.body = { estudianteId: student._id, semanaSimulada: 3 }; // Excede semana 2
      await procesarReservaMatricula(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('La reserva de matrícula completa solo se puede realizar hasta la segunda semana') }));
    });

    test('Debe procesar la reserva exitosamente (200), liberar vacantes y desactivar plan de estudios', async () => {
      const student = createMockStudent();
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(student);

      const mockMatriculaActiva = {
        _id: 'mat-123',
        secciones: ['sec-1', 'sec-2']
      };
      jest.spyOn(Matricula, 'findOne').mockResolvedValue(mockMatriculaActiva);
      jest.spyOn(Seccion, 'findByIdAndUpdate').mockResolvedValue({});
      jest.spyOn(Matricula, 'findByIdAndDelete').mockResolvedValue({});

      req.body = { estudianteId: student._id, semanaSimulada: 2 };
      await procesarReservaMatricula(req, res);

      expect(res.statusCode).toBe(200);
      expect(student.estadoMatricula).toBe('Reservado');
      expect(student.planVigente).toBe(false);
      expect(student.save).toHaveBeenCalled();
      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(Matricula.findByIdAndDelete).toHaveBeenCalledWith('mat-123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('Debe retornar 500 en caso de excepción', async () => {
      jest.spyOn(Estudiante, 'findById').mockRejectedValue(new Error('DB fail'));
      req.body = { estudianteId: 'est-id' };

      await procesarReservaMatricula(req, res);

      expect(res.statusCode).toBe(500);
    });
  });
});
