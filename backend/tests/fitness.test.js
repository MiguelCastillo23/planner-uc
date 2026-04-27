import { GeneticEngine } from '../src/engine/genetic.js';

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
