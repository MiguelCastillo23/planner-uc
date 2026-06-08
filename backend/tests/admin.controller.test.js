import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generarHorariosGlobales, actualizarEstadoPago } from '../controllers/adminController.js';
import { Curso, Docente, Aula, Seccion, Estudiante } from '../models/Schemas.js';
import { GeneticEngine } from '../src/engine/genetic.js';

// Helper de query mockeado para soportar lean() y encadenamiento asíncrono
const mockQuery = (val) => {
  const queryObj = {
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
  ['Curso', 'Docente', 'Aula', 'Seccion', 'Estudiante'].forEach((name) => {
    const ModelClass = function(data) {
      Object.assign(this, data);
    };
    ModelClass.prototype.save = vi.fn().mockResolvedValue({});
    
    // Cada clase de modelo tiene sus propias instancias de vi.fn() aisladas
    ModelClass.find = vi.fn().mockImplementation(() => mockQueryInner([]));
    ModelClass.findOne = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.findById = vi.fn().mockImplementation(() => mockQueryInner(null));
    ModelClass.deleteMany = vi.fn().mockResolvedValue({});
    ModelClass.insertMany = vi.fn().mockResolvedValue([]);

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

describe('Admin Controller Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Resetear valores de retorno de mock para cada modelo de forma aislada
    [Curso, Docente, Aula, Seccion, Estudiante].forEach((model) => {
      model.find.mockReturnValue(mockQuery([]));
      model.findOne.mockReturnValue(mockQuery(null));
      model.findById.mockReturnValue(mockQuery(null));
      model.deleteMany.mockResolvedValue({});
      model.insertMany.mockResolvedValue([]);
    });

    Estudiante.prototype.save.mockResolvedValue({});
  });

  // ==========================================
  // generarHorariosGlobales
  // ==========================================
  describe('generarHorariosGlobales', () => {
    beforeEach(() => {
      // Mockear métodos del motor genético en su prototipo
      vi.spyOn(GeneticEngine.prototype, 'generarProgramacionGlobal').mockReturnValue({
        genes: [
          {
            codigo: 'G1',
            curso: 'c1',
            docente: 'd1',
            aula: 'a1',
            horario: 'H1',
            vacantesTotales: 20,
            vacantesDisponibles: 20
          }
        ]
      });
      vi.spyOn(GeneticEngine.prototype, 'calcularFitnessGlobal').mockReturnValue(1);
    });

    it('debe generar y guardar horarios globales con éxito (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      
      const mockCursos = [{ _id: 'c1' }];
      const mockDocentes = [{ _id: 'd1' }];
      const mockAulas = [{ _id: 'a1' }];
      const mockSeccionesInsertadas = [{ codigo: 'G1' }];

      Curso.find.mockReturnValue(mockQuery(mockCursos));
      Docente.find.mockReturnValue(mockQuery(mockDocentes));
      Aula.find.mockReturnValue(mockQuery(mockAulas));
      Seccion.deleteMany.mockResolvedValue({});
      Seccion.insertMany.mockResolvedValue(mockSeccionesInsertadas);

      await generarHorariosGlobales(req, res);

      expect(Curso.find).toHaveBeenCalled();
      expect(Docente.find).toHaveBeenCalled();
      expect(Aula.find).toHaveBeenCalled();
      expect(Seccion.deleteMany).toHaveBeenCalled();
      expect(Seccion.insertMany).toHaveBeenCalledWith([
        {
          codigo: 'G1',
          curso: 'c1',
          docente: 'd1',
          aula: 'a1',
          horario: 'H1',
          vacantesTotales: 20,
          vacantesDisponibles: 20
        }
      ]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        fitness: 1,
        totalSecciones: 1,
        secciones: mockSeccionesInsertadas
      });
    });

    it('debe iterar por completo si el fitness es menor a 1 (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      
      const mockCursos = [{ _id: 'c1' }];
      const mockDocentes = [{ _id: 'd1' }];
      const mockAulas = [{ _id: 'a1' }];
      const mockSeccionesInsertadas = [{ codigo: 'G1' }];

      Curso.find.mockReturnValue(mockQuery(mockCursos));
      Docente.find.mockReturnValue(mockQuery(mockDocentes));
      Aula.find.mockReturnValue(mockQuery(mockAulas));
      Seccion.deleteMany.mockResolvedValue({});
      Seccion.insertMany.mockResolvedValue(mockSeccionesInsertadas);

      // Fitness inferior a 1 para cubrir la bifurcación break del bucle
      vi.spyOn(GeneticEngine.prototype, 'calcularFitnessGlobal').mockReturnValue(0.8);

      await generarHorariosGlobales(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        fitness: 0.8,
        totalSecciones: 1,
        secciones: mockSeccionesInsertadas
      });
    });

    it('debe devolver 400 si faltan cursos en la base de datos (Validation)', async () => {
      const { req, res } = makeMockExpress();

      Curso.find.mockReturnValue(mockQuery([]));
      Docente.find.mockReturnValue(mockQuery([{ _id: 'd1' }]));
      Aula.find.mockReturnValue(mockQuery([{ _id: 'a1' }]));

      await generarHorariosGlobales(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Faltan cursos, docentes o aulas');
    });

    it('debe devolver 400 si faltan docentes en la base de datos (Validation)', async () => {
      const { req, res } = makeMockExpress();

      Curso.find.mockReturnValue(mockQuery([{ _id: 'c1' }]));
      Docente.find.mockReturnValue(mockQuery([]));
      Aula.find.mockReturnValue(mockQuery([{ _id: 'a1' }]));

      await generarHorariosGlobales(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Faltan cursos, docentes o aulas');
    });

    it('debe devolver 400 si faltan aulas en la base de datos (Validation)', async () => {
      const { req, res } = makeMockExpress();

      Curso.find.mockReturnValue(mockQuery([{ _id: 'c1' }]));
      Docente.find.mockReturnValue(mockQuery([{ _id: 'd1' }]));
      Aula.find.mockReturnValue(mockQuery([]));

      await generarHorariosGlobales(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body.error).toContain('Faltan cursos, docentes o aulas');
    });

    it('debe devolver 500 ante un error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();

      Curso.find.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await generarHorariosGlobales(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body.error).toContain('Error interno del servidor');
      expect(res.body.detail).toBe('Simulated DB Crash');
    });
  });

  // ==========================================
  // actualizarEstadoPago
  // ==========================================
  describe('actualizarEstadoPago', () => {
    it('debe actualizar todos los estados financieros con éxito (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = {
        estudianteId: 'est123',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true
      };

      const mockEstudiante = {
        nombre: 'Pedro',
        tieneDeudas: true,
        tasaPagada: false,
        seguroVigente: false,
        save: vi.fn().mockResolvedValue({})
      };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await actualizarEstadoPago(req, res);

      expect(Estudiante.findById).toHaveBeenCalledWith('est123');
      expect(mockEstudiante.tieneDeudas).toBe(false);
      expect(mockEstudiante.tasaPagada).toBe(true);
      expect(mockEstudiante.seguroVigente).toBe(true);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, estudiante: mockEstudiante });
    });

    it('debe omitir la actualización de campos no especificados (Happy Path)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'est123' }; // Todos los campos booleanos indefinidos

      const mockEstudiante = {
        nombre: 'Pedro',
        tieneDeudas: true,
        tasaPagada: false,
        seguroVigente: false,
        save: vi.fn().mockResolvedValue({})
      };

      Estudiante.findById.mockReturnValue(mockQuery(mockEstudiante));

      await actualizarEstadoPago(req, res);

      expect(mockEstudiante.tieneDeudas).toBe(true);
      expect(mockEstudiante.tasaPagada).toBe(false);
      expect(mockEstudiante.seguroVigente).toBe(false);
      expect(mockEstudiante.save).toHaveBeenCalled();
    });

    it('debe devolver 404 si el estudiante no existe (Validation)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'est123' };

      Estudiante.findById.mockReturnValue(mockQuery(null));

      await actualizarEstadoPago(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado' });
    });

    it('debe devolver 500 ante un error del servidor (Manejo de Errores)', async () => {
      const { req, res } = makeMockExpress();
      req.body = { estudianteId: 'est123' };

      Estudiante.findById.mockReturnValue(mockQuery(new Error('Simulated DB Crash')));

      await actualizarEstadoPago(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body.error).toContain('Error al actualizar pagos');
      expect(res.body.detail).toBe('Simulated DB Crash');
    });
  });
});
