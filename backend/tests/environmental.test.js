import { environmentalTracker } from '../middlewares/environmentalTracker.js';
import EnvironmentalMetric from '../models/EnvironmentalMetric.js';
import { jest } from '@jest/globals';

// Spy on the DB model instead of full module mock to avoid ESM issues
jest.spyOn(EnvironmentalMetric, 'create').mockImplementation(() => Promise.resolve({}));

describe('Environmental Tracker Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      path: '/api/test'
    };
    
    res = {
      statusCode: 200,
      getHeader: jest.fn(),
      send: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          // Guardamos el callback para llamarlo manualmente en el test
          res.finishCallback = callback;
        }
      }),
      locals: {}
    };
    
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('debe llamar a next() y registrar la métrica al finalizar la respuesta', async () => {
    res.getHeader.mockReturnValue('1024'); // Simulamos 1024 bytes transferidos

    environmentalTracker(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(typeof res.finishCallback).toBe('function');

    // Simulamos que la respuesta HTTP ha finalizado
    await res.finishCallback();

    expect(EnvironmentalMetric.create).toHaveBeenCalled();
    
    const createArgs = EnvironmentalMetric.create.mock.calls[0][0];
    expect(createArgs.method).toBe('GET');
    expect(createArgs.path).toBe('/api/test');
    expect(createArgs.status).toBe(200);
    expect(createArgs.bytesTransferred).toBe(1024);
    expect(createArgs.co2Emissions).toBeGreaterThan(0); // Debe calcular CO2
    expect(createArgs.responseTime).toBeGreaterThanOrEqual(0);
  });

  test('no debe registrar métricas para la ruta del dashboard', async () => {
    req.originalUrl = '/environmental-impact';

    environmentalTracker(req, res, next);
    
    await res.finishCallback();

    expect(EnvironmentalMetric.create).not.toHaveBeenCalled();
  });
});
