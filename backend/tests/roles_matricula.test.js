import { procesarMatricula, solicitarAsignaturaDirigida } from '../controllers/studentController.js';
import { Estudiante, Seccion, Matricula, Curso } from '../models/Schemas.js';
import { jest } from '@jest/globals';

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
