import { environmentalTracker } from '../middlewares/environmentalTracker.js';
import EnvironmentalMetric from '../models/EnvironmentalMetric.js';
import { jest } from '@jest/globals';
import request from 'supertest';
import { setupIntegration, teardownIntegration, logApiCall } from './integrationHelper.js';


describe('Environmental Tracker Middleware', () => {
  let createSpy;

  beforeAll(() => {
    createSpy = jest.spyOn(EnvironmentalMetric, 'create').mockImplementation(() => Promise.resolve({}));
  });

  afterAll(() => {
    if (createSpy) {
      createSpy.mockRestore();
    }
  });
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

describe('Pruebas de Integración - Tracker Ambiental (Supertest)', () => {
  let serverUrl;

  beforeAll(async () => {
    serverUrl = await setupIntegration();
  }, 30000);

  afterAll(async () => {
    await teardownIntegration();
  }, 30000);

  test('Debe registrar métricas en la base de datos tras una petición GET y exponerlas en el dashboard ambiental', async () => {
    // 1. Limpiar métricas en memoria para asegurar conteo exacto
    await EnvironmentalMetric.deleteMany({});

    // 2. Realizar petición de prueba para activar el middleware
    const resGet = await request(serverUrl).get('/api/cursos');
    logApiCall('GET', '/api/cursos', resGet.statusCode);
    expect(resGet.statusCode).toBe(200);

    // 3. Realizar petición al dashboard para validar el reporte consolidado
    const resImpact = await request(serverUrl).get('/environmental-impact');
    logApiCall('GET', '/environmental-impact', resImpact.statusCode, { length: resImpact.text?.length });
    
    expect(resImpact.statusCode).toBe(200);
    expect(resImpact.headers['content-type']).toContain('text/html');
    expect(resImpact.text).toContain('Dashboard de Impacto Ambiental');
    expect(resImpact.text).toContain('kpi-card');
  });
});
