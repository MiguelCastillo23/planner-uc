import { describe, it, expect, vi, test } from 'vitest';
import { GeneticEngine } from '../src/engine/genetic.js';

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
