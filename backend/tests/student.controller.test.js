import { describe, it, expect, vi, beforeEach } from 'vitest';
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
import { Curso, Docente, Aula, Seccion, Estudiante, Matricula } from '../models/Schemas.js';
import { GeneticEngine } from '../src/engine/genetic.js';

// Helper de query mockeado para soportar encadenamiento (populate, sort, lean)
const mockQuery = (val) => {
  const queryObj = {
    populate: vi.fn().mockImplementation(() => queryObj),
    sort: vi.fn().mockImplementation(() => queryObj),
    lean: vi.fn().mockImplementation(() => queryObj),
    then: (resolve, reject) => {
      if (val instanceof Error) {
        reject(val);
      } else {
        resolve(val);
      }
    }
  };
  return queryObj;
};

// Mocks de Mongoose Schemas/Models con métodos estáticos únicos para cada modelo
vi.mock('../models/Schemas.js', () => {
  const mockQueryInner = (val) => {
    const queryObj = {
      populate: vi.fn().mockImplementation(() => queryObj),
      sort: vi.fn().mockImplementation(() => queryObj),
      lean: vi.fn().mockImplementation(() => queryObj),
      then: (resolve, reject) => {
        if (val instanceof Error) {
          reject(val);
        } else {
          resolve(val);
        }
      }
    };
    return queryObj;
  };

  const models = {};
  ['Curso', 'Docente', 'Aula', 'Seccion', 'Estudiante', 'Matricula'].forEach((name) => {
    const ModelClass = function(data) {
      Object.assign(this, data);
    };
    ModelClass.prototype.save = vi.fn().mockResolvedValue({});
    
    // Cada clase de modelo tiene sus propias instancias de vi.fn() aisladas
    ModelClass.find = vi.fn().mockImplementation(() => mockQueryInner([]));
    ModelClass.findOne = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.findById = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.findByIdAndUpdate = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.findByIdAndDelete = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.findOneAndDelete = vi.fn().mockImplementation(() => mockQueryInner(null));

    models[name] = ModelClass;
  });

  return models;
});

// Helper para crear req/res de Express mockeados
const makeMockExpress = () => {
  const req = {
    params: {},
    body: {},
  };
  const res = {
    statusCode: 200,
    status: vi.fn().mockImplementation(function (code) {
      this.statusCode = code;
      return this;
    }),
    json: vi.fn().mockImplementation(function (data) {
      this.body = data;
      return this;
    }),
  };
  return { req, res };
};

describe('Student Controller Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Resetear valores de retorno de mock para cada modelo de forma aislada
    [Curso, Docente, Aula, Seccion, Estudiante, Matricula].forEach((model) => {
      model.find.mockReturnValue(mockQuery([]));
      model.findOne.mockReturnValue(mockQuery(null));
      model.findById.mockReturnValue(mockQuery(null));
      model.findByIdAndUpdate.mockReturnValue(mockQuery(null));
      model.findByIdAndDelete.mockReturnValue(mockQuery(null));
    });

    Matricula.prototype.save.mockResolvedValue({});
    Estudiante.prototype.save.mockResolvedValue({});
  });

  // ==========================================
  // getEstudiante
  // ==========================================
  describe('getEstudiante', () => {
    it('debe devolver un estudiante cuando existe (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.params.codigo = 'EST001';
      
      const mockEstudiante = { codigo: 'EST001', nombre: 'Pedro Gómez' };
      Estudiante.findOne.mockReturnValue(mockQuery(mockEstudiante));

      await getEstudiante(req, res);

      expect(Estudiante.findOne).toHaveBeenCalledWith({ codigo: 'EST001' });
      expect(res.json).toHaveBeenCalledWith(mockEstudiante);
    });

    it('debe devolver 404 si el estudiante no existe (Validation)', async () => {
      const { req, res } = makeMockExpress();
      req.params.codigo = 'INVALIDO';

      Estudiante.findOne.mockReturnValue(mockQuery(null));

      await getEstudiante(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado' });
    });

    it('debe devolver 500 ante un error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.params.codigo = 'EST001';

      Estudiante.findOne.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await getEstudiante(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener estudiante',
        detail: 'Simulated DB Crash'
      });
    });
  });

  // ==========================================
  // getSeccionesDisponibles
  // ==========================================
  describe('getSeccionesDisponibles', () => {
    it('debe devolver secciones con populate y lean (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      const mockSecciones = [{ codigo: 'SEC1', curso: {} }];

      Seccion.find.mockReturnValue(mockQuery(mockSecciones));

      await getSeccionesDisponibles(req, res);

      expect(Seccion.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSecciones);
    });

    it('debe devolver 500 ante un error de consulta (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();

      Seccion.find.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await getSeccionesDisponibles(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener secciones',
        detail: 'Simulated DB Crash'
      });
    });
  });

  // ==========================================
  // getEstudiantesSimulacion
  // ==========================================
  describe('getEstudiantesSimulacion', () => {
    it('debe devolver estudiantes ordenados (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      const mockEstudiantes = [{ codigo: 'A' }, { codigo: 'B' }];

      Estudiante.find.mockReturnValue(mockQuery(mockEstudiantes));

      await getEstudiantesSimulacion(req, res);

      expect(Estudiante.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEstudiantes);
    });

    it('debe devolver 500 ante un error de ordenamiento (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();

      Estudiante.find.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await getEstudiantesSimulacion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al obtener estudiantes',
        detail: 'Simulated DB Crash'
      });
    });
  });

  // ==========================================
  // procesarMatricula
  // ==========================================
  describe('procesarMatricula', () => {
    let mockEstudiante;
    let mockSecciones;

    beforeEach(() => {
      mockEstudiante = {
        _id: 'std123',
        nombre: 'Juan Perez',
        planVigente: true,
        planEstudios: 'Plan 2015',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        historialDesaprobados: new Map(),
        cursosAprobados: [],
        semestre: 10, // Default a 10 para omitir validación de créditos mínimos (< 12)
        estadoMatricula: 'Pendiente',
        save: vi.fn().mockResolvedValue({})
      };

      mockSecciones = [
        {
          _id: 'sec1',
          codigo: 'ASUCO1108-SEC01',
          curso: { codigo: 'ASUCO1108', creditos: 4, prerrequisitos: [], modalidad: 'Presencial' },
          horario: [{ dia: 1, franja: 2 }],
          vacantesDisponibles: 10
        }
      ];
    });

    it('debe devolver 404 si el estudiante no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };

      Estudiante.findById.mockReturnValue(mockQuery(null));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado.' });
    });

    it('debe adaptar automáticamente al plan vigente si planVigente es falso', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockEstudiante.planVigente = false;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(mockSecciones));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      await procesarMatricula(req, res);

      expect(mockEstudiante.planEstudios).toBe('Plan 2018');
      expect(mockEstudiante.planVigente).toBe(true);
      expect(mockEstudiante.save).toHaveBeenCalled();
    });

    it('debe bloquear matrícula si presenta deudas', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockEstudiante.tieneDeudas = true;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('presenta deudas pendientes');
    });

    it('debe bloquear matrícula si tasa no está pagada', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockEstudiante.tasaPagada = false;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('tasa educativa');
    });

    it('debe bloquear matrícula si seguro no está vigente', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockEstudiante.seguroVigente = false;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('seguro universitario');
    });

    it('debe devolver 400 si una o más secciones no existen', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1', 'sec2'] };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery([mockSecciones[0]])); // Devuelve solo 1 sección

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Una o más secciones seleccionadas no existen.' });
    });

    it('debe bloquear si el estudiante tiene cuarta desaprobación académica', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockEstudiante.historialDesaprobados.set('CURSO1', 4);

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(mockSecciones));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('separado definitivamente');
    });

    it('debe bloquear si tiene tercera desaprobación y se matricula en curso distinto o más de uno', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1', 'sec2'] };
      mockEstudiante.historialDesaprobados.set('CURSO1', 3);

      const seccionesMultiples = [
        { curso: { codigo: 'CURSO1', creditos: 4 } },
        { curso: { codigo: 'CURSO2', creditos: 4 } }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesMultiples));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('3ra desaprobación');
    });

    it('debe bloquear si tiene segunda desaprobación y excede 16 créditos', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1', 'sec2', 'sec3', 'sec4', 'sec5'] };
      mockEstudiante.historialDesaprobados.set('CURSO1', 2);

      const seccionesPesadas = Array(5).fill({ curso: { codigo: 'C', creditos: 4, prerrequisitos: [] }, horario: [] });

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesPesadas));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body.error).toContain('máxima bloqueada a 16 créditos');
    });

    it('debe bloquear si la carga académica ordinaria excede 25 créditos', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['s1', 's2'] };

      const seccionesPesadas = [
        { curso: { codigo: 'A', creditos: 15, prerrequisitos: [] }, horario: [] },
        { curso: { codigo: 'B', creditos: 12, prerrequisitos: [] }, horario: [] }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesPesadas));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Carga académica excedida');
    });

    it('debe bloquear si la carga es insuficiente (< 12) sin justificación ni semestre terminal', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'], justificacionCargaMinima: false };
      mockEstudiante.semestre = 5;

      const seccionesLivianas = [{ curso: { codigo: 'C', creditos: 4, prerrequisitos: [] }, horario: [] }];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesLivianas));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Carga académica insuficiente');
    });

    it('debe permitir carga insuficiente (< 12) si tiene justificación', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'], justificacionCargaMinima: true };
      mockEstudiante.semestre = 5;
      
      const seccionesLivianas = [{ _id: 'sec1', curso: { codigo: 'C', creditos: 4, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }], vacantesDisponibles: 1 }];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesLivianas));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      await procesarMatricula(req, res);
      
      expect(res.statusCode).not.toBe(400);
    });

    it('debe permitir carga insuficiente (< 12) si el semestre es terminal (>= 10)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'], justificacionCargaMinima: false };
      mockEstudiante.semestre = 10;

      const seccionesLivianas = [{ _id: 'sec1', curso: { codigo: 'C', creditos: 4, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }], vacantesDisponibles: 1 }];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesLivianas));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      await procesarMatricula(req, res);

      expect(res.statusCode).not.toBe(400);
    });

    it('debe bloquear si no se cumple un prerrequisito de la malla', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };

      const seccionesConPre = [
        { curso: { codigo: 'C1', creditos: 6, prerrequisitos: ['REQ1'] }, horario: [] }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesConPre));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Prerrequisito no cumplido');
    });

    it('debe bloquear Taller de Investigación 2 si no se ha aprobado el 1', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };

      const seccionesTaller = [
        { curso: { codigo: 'ASUCO1581', creditos: 6, prerrequisitos: [] }, horario: [] }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesTaller));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Taller de Investigación 1');
    });

    it('debe bloquear Investigación en ciclos de verano', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'], tipoPeriodo: 'Verano' };

      const seccionesTaller = [
        { curso: { codigo: 'ASUCO1580', creditos: 6, prerrequisitos: [] }, horario: [] }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesTaller));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Restricción de Ciclo');
    });

    it('debe bloquear si se detecta cruce de horarios para el estudiante', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1', 'sec2'] };

      const seccionesCruce = [
        { codigo: 'SEC1', curso: { codigo: 'C1', creditos: 6, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }] },
        { codigo: 'SEC2', curso: { codigo: 'C2', creditos: 6, prerrequisitos: [] }, horario: [{ dia: 1, franja: 2 }] }
      ];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(seccionesCruce));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Cruce de horarios');
    });

    it('debe bloquear si no hay vacantes disponibles en la sección', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };
      mockSecciones[0].vacantesDisponibles = 0;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(mockSecciones));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Vacantes agotadas');
    });

    it('debe bloquear curso híbrido si no selecciona modalidad de asistencia', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'], asistenciaHibrida: {} };
      mockSecciones[0].curso.modalidad = 'Híbrido';

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(mockSecciones));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Selección obligatoria');
    });

    it('debe matricular con éxito al estudiante (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = {
        estudianteId: 'std123',
        seccionIds: ['sec1'],
        asistenciaHibrida: { 'sec1': 'Física' }
      };
      mockSecciones[0].curso.modalidad = 'Híbrido';

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Seccion.find.mockReturnValue(mockQuery(mockSecciones));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      await procesarMatricula(req, res);

      expect(mockEstudiante.estadoMatricula).toBe('Matriculado');
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledWith('sec1', { $inc: { vacantesDisponibles: -1 } });
      expect(res.json).toHaveBeenCalled();
    });

    it('debe devolver 500 ante fallo inesperado (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', seccionIds: ['sec1'] };

      Estudiante.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await procesarMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================
  // autoMatricularAsistente
  // ==========================================
  describe('autoMatricularAsistente', () => {
    beforeEach(() => {
      vi.spyOn(GeneticEngine.prototype, 'crearIndividuoAlumno').mockReturnValue({ genes: ['sec1'] });
      vi.spyOn(GeneticEngine.prototype, 'calcularFitnessAlumno').mockReturnValue(1);
    });

    it('debe devolver 404 si el estudiante no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoIds: ['c1'] };

      Estudiante.findById.mockReturnValue(mockQuery(null));

      await autoMatricularAsistente(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe sugerir secciones usando algoritmo genético (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoIds: ['c1'] };

      const mockEstudiante = { nombre: 'Juan' };
      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.find.mockReturnValue(mockQuery([{ _id: 'c1' }]));
      Seccion.find.mockReturnValue(mockQuery([{ _id: 'sec1', curso: 'c1' }]));

      await autoMatricularAsistente(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        fitness: 1,
        seccionesSugeridas: ['sec1']
      });
    });

    it('debe devolver 500 ante error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoIds: ['c1'] };

      Estudiante.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await autoMatricularAsistente(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================
  // solicitarAsignaturaDirigida
  // ==========================================
  describe('solicitarAsignaturaDirigida', () => {
    let mockEstudiante, mockCurso;

    beforeEach(() => {
      mockEstudiante = {
        nombre: 'Juan',
        cantidadDirigidos: 0,
        historialDesaprobados: new Map(),
        cursosAprobados: [],
        save: vi.fn().mockResolvedValue({})
      };

      mockCurso = {
        codigo: 'CURSO1',
        nombre: 'Matemática',
        prerrequisitos: []
      };
    });

    it('debe devolver 404 si el estudiante no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };

      Estudiante.findById.mockReturnValue(mockQuery(null));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe devolver 404 si el curso no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(null));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe bloquear si se supera el limite de 3 dirigidas', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };
      mockEstudiante.cantidadDirigidos = 3;

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(mockCurso));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Límite superado');
    });

    it('debe bloquear si el curso es Taller de Investigacion 1 o 2', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };
      mockCurso.codigo = 'ASUCO1580';

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(mockCurso));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Taller de Investigación 1 y 2');
    });

    it('debe bloquear si la asignatura se ha desaprobado 2 o más veces', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };
      mockEstudiante.historialDesaprobados.set('CURSO1', 2);

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(mockCurso));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('dos o más veces');
    });

    it('debe bloquear si no se cumplen los prerrequisitos ordinarios', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };
      mockCurso.prerrequisitos = ['REQ1'];

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(mockCurso));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Prerrequisito no cumplido');
    });

    it('debe aprobar asignatura dirigida con éxito (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Curso.findById.mockReturnValue(mockQuery(mockCurso));

      await solicitarAsignaturaDirigida(req, res);

      expect(mockEstudiante.cantidadDirigidos).toBe(1);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('debe devolver 500 ante error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', cursoId: 'c1' };

      Estudiante.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await solicitarAsignaturaDirigida(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================
  // procesarRetiroCurso
  // ==========================================
  describe('procesarRetiroCurso', () => {
    let mockMatricula, mockSeccion;

    beforeEach(() => {
      mockMatricula = {
        _id: 'mat123',
        secciones: [
          { _id: 'sec1', curso: { nombre: 'Cálculo', modalidad: 'Presencial' } }
        ],
        save: vi.fn().mockResolvedValue({})
      };

      mockSeccion = {
        _id: 'sec1',
        curso: { nombre: 'Cálculo', modalidad: 'Presencial' }
      };
    });

    it('debe devolver 404 si la matrícula no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 5 };

      Matricula.findById.mockReturnValue(mockQuery(null));

      await procesarRetiroCurso(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe devolver 404 si la sección no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 5 };

      Matricula.findById.mockReturnValue(mockQuery(mockMatricula));
      Seccion.findById.mockReturnValue(mockQuery(null));

      await procesarRetiroCurso(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe bloquear retiro presencial si excede la semana 14', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 15 };

      Matricula.findById.mockReturnValue(mockQuery(mockMatricula));
      Seccion.findById.mockReturnValue(mockQuery(mockSeccion));

      await procesarRetiroCurso(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Plazo vencido');
    });

    it('debe bloquear retiro a distancia si excede la semana 7', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 8 };
      mockSeccion.curso.modalidad = 'Distancia';

      Matricula.findById.mockReturnValue(mockQuery(mockMatricula));
      Seccion.findById.mockReturnValue(mockQuery(mockSeccion));

      await procesarRetiroCurso(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Plazo vencido');
    });

    it('debe procesar el retiro del curso con éxito (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 10 };

      Matricula.findById.mockReturnValue(mockQuery(mockMatricula));
      Seccion.findById.mockReturnValue(mockQuery(mockSeccion));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));

      await procesarRetiroCurso(req, res);

      expect(mockMatricula.secciones.length).toBe(0);
      expect(mockMatricula.save).toHaveBeenCalled();
      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledWith('sec1', { $inc: { vacantesDisponibles: 1 } });
      expect(res.json).toHaveBeenCalled();
    });

    it('debe devolver 500 ante error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { matriculaId: 'mat123', seccionId: 'sec1', semanaSimulada: 5 };

      Matricula.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await procesarRetiroCurso(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================
  // procesarReservaMatricula
  // ==========================================
  describe('procesarReservaMatricula', () => {
    let mockEstudiante;

    beforeEach(() => {
      mockEstudiante = {
        nombre: 'Juan',
        estadoMatricula: 'Pendiente',
        planVigente: true,
        save: vi.fn().mockResolvedValue({})
      };
    });

    it('debe devolver 404 si el estudiante no existe', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', semanaSimulada: 1 };

      Estudiante.findById.mockReturnValue(mockQuery(null));

      await procesarReservaMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe bloquear reserva si excede la semana 2', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', semanaSimulada: 3 };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await procesarReservaMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Plazo vencido');
    });

    it('debe procesar la reserva devolviendo vacantes de matricula activa si existiera (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', semanaSimulada: 1 };

      const mockMatriculaActiva = {
        _id: 'mat123',
        secciones: ['sec1']
      };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Matricula.findOne.mockReturnValue(mockQuery(mockMatriculaActiva));
      Seccion.findByIdAndUpdate.mockReturnValue(mockQuery({}));
      Matricula.findByIdAndDelete.mockReturnValue(mockQuery({}));

      await procesarReservaMatricula(req, res);

      expect(Seccion.findByIdAndUpdate).toHaveBeenCalledWith('sec1', { $inc: { vacantesDisponibles: 1 } });
      expect(Matricula.findByIdAndDelete).toHaveBeenCalledWith('mat123');
      expect(mockEstudiante.estadoMatricula).toBe('Reservado');
      expect(mockEstudiante.planVigente).toBe(false);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('debe procesar la reserva sin matricula activa', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', semanaSimulada: 1 };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));
      Matricula.findOne.mockReturnValue(mockQuery(null));

      await procesarReservaMatricula(req, res);

      expect(mockEstudiante.estadoMatricula).toBe('Reservado');
      expect(mockEstudiante.planVigente).toBe(false);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('debe devolver 500 ante error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'std123', semanaSimulada: 1 };

      Estudiante.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await procesarReservaMatricula(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
