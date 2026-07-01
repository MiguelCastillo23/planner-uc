import { generarHorario } from '../controllers/horarioController.js';
import { GeneticEngine } from '../src/engine/genetic.js';
import { jest } from '@jest/globals';

describe('Horario Controller - Pruebas Unitarias', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
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

  test('Debe retornar 400 si el campo cursos es indefinido o está vacío', async () => {
    req.body = { cursos: [] };
    await generarHorario(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No hay cursos' });

    req.body = {};
    await generarHorario(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No hay cursos' });
  });

  test('Debe retornar 200 y el mejor individuo generado por el motor genético', async () => {
    req.body = {
      cursos: [
        { nombre: 'Cálculo', codigo: 'MAT1', creditos: 4 }
      ]
    };

    // Espiamos los métodos del prototipo del GeneticEngine para asegurar que se llamen
    const spyCrearIndividuo = jest.spyOn(GeneticEngine.prototype, 'crearIndividuo');
    const spyCalcularFitness = jest.spyOn(GeneticEngine.prototype, 'calcularFitness');

    await generarHorario(req, res);

    expect(res.statusCode).toBe(200);
    expect(spyCrearIndividuo).toHaveBeenCalled();
    expect(spyCalcularFitness).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        genes: expect.any(Array),
        fitness: expect.any(Number)
      })
    );
  });

  test('Debe retornar 500 en caso de excepción del motor genético', async () => {
    req.body = {
      cursos: [
        { nombre: 'Cálculo', codigo: 'MAT1', creditos: 4 }
      ]
    };

    jest.spyOn(GeneticEngine.prototype, 'crearIndividuo').mockImplementation(() => {
      throw new Error('Genetic Engine Failed');
    });

    await generarHorario(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Fallo interno',
        detail: 'Genetic Engine Failed'
      })
    );
  });
});
