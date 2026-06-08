import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the controller under test and the real GeneticEngine so we can spy on its prototype methods.
import { generarHorario } from '../controllers/horarioController.js';
import { GeneticEngine } from '../src/engine/genetic.js';

// Helper to create mock Express objects
const makeRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

describe('horarioController - generarHorario', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 when no cursos provided (Arrange-Act-Assert)', async () => {
    // Arrange
    const req = { body: {} };
    const res = makeRes();

    // Act
    await generarHorario(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'No hay cursos' });
  });

  it('should run engine 300 iterations and return the best individual (Arrange-Act-Assert)', async () => {
    // Arrange
    const req = { body: { cursos: ['C1'] } };
    const res = makeRes();

    // Track a simple incremental candidate id so fitness grows monotonically.
    let counter = 0;
    const crearIndividuoMock = vi
      .spyOn(GeneticEngine.prototype, 'crearIndividuo')
      .mockImplementation(() => ({ id: counter++ }));

    const calcularFitnessMock = vi
      .spyOn(GeneticEngine.prototype, 'calcularFitness')
      .mockImplementation((candidate) => candidate.id);

    // Act
    await generarHorario(req, res);

    // Assert: best individual should be the one with highest id (299), with fitness 299
    expect(crearIndividuoMock).toHaveBeenCalledTimes(300);
    expect(calcularFitnessMock).toHaveBeenCalledTimes(300);
    expect(res.json).toHaveBeenCalledTimes(1);

    const returned = res.json.mock.calls[0][0];
    expect(returned).toEqual({ id: 299, fitness: 299 });
  });

  it('should respond 500 and include error detail when engine throws (Arrange-Act-Assert)', async () => {
    // Arrange
    const req = { body: { cursos: ['C1'] } };
    const res = makeRes();

    // Make crearIndividuo succeed but calcularFitness throw to simulate runtime failure
    let counter = 0;
    vi.spyOn(GeneticEngine.prototype, 'crearIndividuo').mockImplementation(() => ({ id: counter++ }));
    vi.spyOn(GeneticEngine.prototype, 'calcularFitness').mockImplementation(() => {
      throw new Error('simulated engine error');
    });

    // Act
    await generarHorario(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Fallo interno', detail: 'simulated engine error' });
  });
});
