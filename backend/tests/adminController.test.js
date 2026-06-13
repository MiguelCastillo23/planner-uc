import { generarHorariosGlobales, actualizarEstadoPago } from '../controllers/adminController.js';
import { Curso, Docente, Aula, Seccion, Estudiante } from '../models/Schemas.js';
import { jest } from '@jest/globals';

describe('Admin Controller - Pruebas Unitarias', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };

    res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: jest.fn(),
      send: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('generarHorariosGlobales', () => {
    test('Debe retornar 400 si faltan cursos, docentes o aulas para la programación', async () => {
      // Simulamos que no hay cursos
      jest.spyOn(Curso, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(Docente, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ nombre: 'Docente A', especialidad: [] }])
      });
      jest.spyOn(Aula, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ nombre: 'Aula A', capacidad: 20 }])
      });

      await generarHorariosGlobales(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Faltan cursos, docentes o aulas para realizar la programación.'
      });
    });

    test('Debe generar horarios globales exitosamente (200) cuando hay datos completos', async () => {
      const mockCursos = [
        { _id: 'c1', codigo: 'ASUCO1108', nombre: 'Álgebra', creditos: 3 }
      ];
      const mockDocentes = [
        { _id: 'd1', nombre: 'Docente A', especialidad: ['ASUCO1108'] }
      ];
      const mockAulas = [
        { _id: 'a1', nombre: 'Aula A', capacidad: 25 }
      ];

      jest.spyOn(Curso, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCursos)
      });
      jest.spyOn(Docente, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDocentes)
      });
      jest.spyOn(Aula, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAulas)
      });

      jest.spyOn(Seccion, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
      jest.spyOn(Seccion, 'insertMany').mockImplementation((secciones) => {
        return Promise.resolve(secciones.map((s, index) => ({ ...s, _id: `sec-${index}` })));
      });

      await generarHorariosGlobales(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        fitness: expect.any(Number),
        totalSecciones: expect.any(Number),
        secciones: expect.any(Array)
      }));
      expect(Seccion.deleteMany).toHaveBeenCalled();
      expect(Seccion.insertMany).toHaveBeenCalled();
    });

    test('Debe retornar 500 si ocurre una excepción interna', async () => {
      jest.spyOn(Curso, 'find').mockImplementation(() => {
        throw new Error('Database Error');
      });

      await generarHorariosGlobales(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Error interno del servidor',
        detail: 'Database Error'
      }));
    });
  });

  describe('actualizarEstadoPago', () => {
    test('Debe retornar 404 si el estudiante no existe', async () => {
      req.body = { estudianteId: 'nonexistent-id', tieneDeudas: false };
      jest.spyOn(Estudiante, 'findById').mockResolvedValue(null);

      await actualizarEstadoPago(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Estudiante no encontrado' });
    });

    test('Debe actualizar estado financiero de estudiante exitosamente (200)', async () => {
      const mockEstudiante = {
        _id: 'est-123',
        nombre: 'Juan Pérez',
        tieneDeudas: true,
        tasaPagada: false,
        seguroVigente: false,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        estudianteId: 'est-123',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true
      };

      jest.spyOn(Estudiante, 'findById').mockResolvedValue(mockEstudiante);

      await actualizarEstadoPago(req, res);

      expect(res.statusCode).toBe(200);
      expect(mockEstudiante.tieneDeudas).toBe(false);
      expect(mockEstudiante.tasaPagada).toBe(true);
      expect(mockEstudiante.seguroVigente).toBe(true);
      expect(mockEstudiante.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        estudiante: mockEstudiante
      });
    });

    test('Debe retornar 500 en caso de excepción al buscar/guardar', async () => {
      req.body = { estudianteId: 'est-123' };
      jest.spyOn(Estudiante, 'findById').mockRejectedValue(new Error('DB connection fail'));

      await actualizarEstadoPago(req, res);

      expect(res.statusCode).toBe(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Error al actualizar pagos',
        detail: 'DB connection fail'
      }));
    });
  });
});
