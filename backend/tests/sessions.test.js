import { GeneticEngine } from '../src/engine/genetic.js';
import request from 'supertest';
import { setupIntegration, teardownIntegration, logApiCall } from './integrationHelper.js';
import { Estudiante } from '../models/Schemas.js';


describe('Validación de Lógica de Sesiones y Reglas de Tiempo', () => {
  const cursosMock = [
    { nombre: 'Cálculo', codigo: 'MAT1', creditos: 4 }, // Debe tener 3 sesiones
    { nombre: 'Ética', codigo: 'ETI1', creditos: 3 }    // Debe tener 2 sesiones
  ];

  const motor = new GeneticEngine([]);

  test('Debe generar la cantidad correcta de sesiones según créditos', () => {
    const individuo = motor.crearIndividuo(cursosMock);
    
    const sesionesCalculo = individuo.genes.filter(g => g.codigo === 'MAT1');
    const sesionesEtica = individuo.genes.filter(g => g.codigo === 'ETI1');

    expect(sesionesCalculo.length).toBe(3);
    expect(sesionesEtica.length).toBe(2);
  });

  test('La Fitness Function debe penalizar solapamientos en la misma aula', () => {
    const individuoInvalido = {
      genes: [
        { codigo: 'A', dia: 1, franja: 1, aula: 'A101', docente: 'D1' },
        { codigo: 'B', dia: 1, franja: 1, aula: 'A101', docente: 'D2' } // Misma aula/hora
      ]
    };

    const fitness = motor.calcularFitness(individuoInvalido);
    expect(fitness).toBeLessThan(1); // Debe estar penalizado
  });
});

describe('Pruebas de Integración - Sesiones y Autenticación (Supertest)', () => {
  let serverUrl;

  beforeAll(async () => {
    serverUrl = await setupIntegration();
  }, 30000);

  afterAll(async () => {
    await teardownIntegration();
  }, 30000);

  describe('Autenticación y Sesión de Estudiante', () => {
    test('Debe devolver los datos del estudiante (Sesión activa) si existe el código', async () => {
      // Registrar un estudiante de simulación
      await Estudiante.create({
        codigo: '20231234',
        nombre: 'Estudiante Sesion',
        planEstudios: 'ING-INF',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        planVigente: true
      });

      const res = await request(serverUrl).get('/api/estudiantes/20231234');
      logApiCall('GET', '/api/estudiantes/20231234', res.statusCode, res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe('Estudiante Sesion');
      expect(res.body.codigo).toBe('20231234');
    });

    test('Debe devolver 404 si el estudiante no existe (Sesión inexistente)', async () => {
      const res = await request(serverUrl).get('/api/estudiantes/99999999');
      logApiCall('GET', '/api/estudiantes/99999999', res.statusCode, res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Estudiante no encontrado');
    });
  });
});
