import { getEnvironmentalDashboard } from '../controllers/environmentalController.js';
import EnvironmentalMetric from '../models/EnvironmentalMetric.js';
import { jest } from '@jest/globals';

describe('Environmental Controller - Pruebas Unitarias', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      statusCode: 200,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('Debe renderizar el dashboard HTML con métricas calculadas correctamente (200)', async () => {
    const mockMetrics = [
      {
        timestamp: new Date('2026-06-12T12:00:00Z'),
        method: 'GET',
        path: '/api/courses',
        status: 200,
        responseTime: 100,
        bytesTransferred: 500,
        co2Emissions: 0.000045
      },
      {
        timestamp: new Date('2026-06-12T12:05:00Z'),
        method: 'POST',
        path: '/api/matricula',
        status: 201,
        responseTime: 300,
        bytesTransferred: 1500,
        co2Emissions: 0.000120
      },
      {
        timestamp: new Date('2026-06-12T12:10:00Z'),
        method: 'GET',
        path: '/api/courses',
        status: 400,
        responseTime: 50,
        bytesTransferred: 200,
        co2Emissions: 0.000018
      }
    ];

    jest.spyOn(EnvironmentalMetric, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMetrics)
      })
    });

    await getEnvironmentalDashboard(req, res);

    expect(res.send).toHaveBeenCalled();
    const htmlResponse = res.send.mock.calls[0][0];

    // Verificar estructura y cálculos de KPI
    expect(htmlResponse).toContain('Dashboard de Impacto Ambiental');
    expect(htmlResponse).toContain('Total Solicitudes');
    expect(htmlResponse).toContain('3'); // totalRequests
    expect(htmlResponse).toContain('0.000183'); // totalCO2 (0.000045 + 0.000120 + 0.000018)
    expect(htmlResponse).toContain('/api/matricula'); // Most polluting
    expect(htmlResponse).toContain('/api/courses'); // Most used
  });

  test('Debe manejar adecuadamente una colección de métricas vacía (200) y evitar divisiones por cero', async () => {
    jest.spyOn(EnvironmentalMetric, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    await getEnvironmentalDashboard(req, res);

    expect(res.send).toHaveBeenCalled();
    const htmlResponse = res.send.mock.calls[0][0];

    expect(htmlResponse).toContain('Total Solicitudes');
    expect(htmlResponse).toContain('<p>0</p>'); // totalRequests = 0
    expect(htmlResponse).toContain('0.000000'); // Promedio CO2 es 0.000000
  });

  test('Debe retornar 500 si ocurre una excepción en la base de datos', async () => {
    jest.spyOn(EnvironmentalMetric, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB read error'))
      })
    });

    await getEnvironmentalDashboard(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.send).toHaveBeenCalledWith('Error interno del servidor al cargar el dashboard.');
  });
});
