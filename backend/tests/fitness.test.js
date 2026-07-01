import { GeneticEngine } from '../src/engine/genetic.js';
import request from 'supertest';
import { setupIntegration, teardownIntegration, logApiCall } from './integrationHelper.js';


describe('Validación de Restricciones de Negocio (Créditos)', () => {
  const cursosSeleccionadosMock = [
    { nombre: 'IA', creditos: 4, codigo: 'INF1' },
    { nombre: 'Redes', creditos: 4, codigo: 'INF2' },
    { nombre: 'Base de Datos', creditos: 4, codigo: 'INF3' },
    { nombre: 'Software I', creditos: 4, codigo: 'INF4' },
    { nombre: 'Software II', creditos: 4, codigo: 'INF5' },
    { nombre: 'Ética', creditos: 2, codigo: 'HUM1' }
  ]; // Total 22 créditos

  test('Debe generar un horario con la carga académica seleccionada', () => {
    const motor = new GeneticEngine([]);
    // Ahora pasamos el mock directamente como seleccionados
    const individuo = motor.crearIndividuo(cursosSeleccionadosMock);
    
    // Calculamos créditos sumando los créditos únicos de los genes (no por sesión)
    const totalCreditos = [...new Set(individuo.genes.map(g => g.codigo))]
      .reduce((acc, code) => {
        const curso = cursosSeleccionadosMock.find(c => c.codigo === code);
        return acc + curso.creditos;
      }, 0);

    console.log(`Créditos validados: ${totalCreditos}`);
    
    expect(totalCreditos).toBeGreaterThanOrEqual(20);
    expect(totalCreditos).toBeLessThanOrEqual(22);
  });
});

describe('Pruebas de Integración - Fitness y Algoritmo (Supertest)', () => {
  let serverUrl;

  beforeAll(async () => {
    serverUrl = await setupIntegration();
  }, 30000);

  afterAll(async () => {
    await teardownIntegration();
  }, 30000);

  describe('5. Manejo de Errores del Servidor (HTTP 500)', () => {
    test('Debe devolver HTTP 500 e información del fallo interno si el payload del curso causa una excepción', async () => {
      // Mandamos un objeto no-iterable (un objeto vacío) para provocar un TypeError en .forEach
      const res = await request(serverUrl)
        .post('/api/horarios/generar')
        .send({
          cursos: {} // Causa TypeError en crearIndividuo porque {} no es un array
        });

      logApiCall('POST', '/api/horarios/generar', res.statusCode, res.body);
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Fallo interno');
      expect(res.body.detail).toBeDefined();
    });
  });
});
