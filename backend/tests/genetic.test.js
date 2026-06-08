import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneticEngine } from '../src/engine/genetic.js';

// Helper para mockear Math.random de forma cíclica y evitar bucles infinitos
const setupMockRandom = (values) => {
  let idx = 0;
  return vi.spyOn(Math, 'random').mockImplementation(() => {
    const val = values[idx % values.length];
    idx++;
    return val;
  });
};

describe('GeneticEngine Unit Tests', () => {
  let engine;

  beforeEach(() => {
    engine = new GeneticEngine();
    vi.restoreAllMocks();
  });

  // ==========================================
  // crearIndividuo
  // ==========================================
  describe('crearIndividuo', () => {
    it('debe crear un individuo para cursos con 3 créditos (Happy Path)', () => {
      const mockCursos = [{ codigo: 'C3', creditos: 3 }];
      setupMockRandom([0.1, 0.5, 0.25]); // index aula (0.1), dia (0.5), franja (0.25)

      const result = engine.crearIndividuo(mockCursos);

      expect(result.genes).toHaveLength(2);
      expect(result.genes[0]).toEqual({
        codigo: 'C3',
        creditos: 3,
        dia: 3,
        franja: 2,
        aula: 'A101', // index 0.1 * 6 = 0.6 -> A101
        docente: 'Docente Principal'
      });
      expect(result.genes[1]).toEqual({
        codigo: 'C3',
        creditos: 3,
        dia: 3,
        franja: 3, // +1
        aula: 'A101',
        docente: 'Docente Principal'
      });
    });

    it('debe crear un individuo para cursos con 4 o más créditos (Happy Path)', () => {
      const mockCursos = [{ codigo: 'C4', creditos: 4 }];
      
      // index aula (0.5), diaPrincipal (0.2), franjaInicio (0.5), diaSecundario (0.8), franjaSecundaria (0.3)
      setupMockRandom([0.5, 0.2, 0.5, 0.8, 0.3]);

      const result = engine.crearIndividuo(mockCursos);

      expect(result.genes).toHaveLength(3);
      expect(result.genes[0].dia).toBe(1);
      expect(result.genes[0].franja).toBe(4);
      expect(result.genes[1].dia).toBe(1);
      expect(result.genes[1].franja).toBe(5);
      expect(result.genes[2].dia).toBe(4);
      expect(result.genes[2].franja).toBe(2);
    });

    it('debe relanzar errores en caso de fallo (Manejo de Errores)', () => {
      expect(() => engine.crearIndividuo(null)).toThrow();
    });
  });

  // ==========================================
  // calcularFitness
  // ==========================================
  describe('calcularFitness', () => {
    it('debe retornar fitness = 1 si no hay conflictos (Happy Path)', () => {
      const individuo = {
        genes: [
          { dia: 1, franja: 2, aula: 'A101' },
          { dia: 1, franja: 3, aula: 'A101' }
        ]
      };

      const fitness = engine.calcularFitness(individuo);
      expect(fitness).toBe(1);
    });

    it('debe penalizar por conflictos de aula (Validation)', () => {
      const individuo = {
        genes: [
          { dia: 1, franja: 2, aula: 'A101' },
          { dia: 1, franja: 2, aula: 'A101' } // Solapamiento
        ]
      };

      const fitness = engine.calcularFitness(individuo);
      expect(fitness).toBe(0.5); // 1 / (1 + 1)
    });

    it('debe penalizar franjas fuera de rango (Validation)', () => {
      const individuo = {
        genes: [
          { dia: 1, franja: 9, aula: 'A101' } // Fuera de rango
        ]
      };

      const fitness = engine.calcularFitness(individuo);
      expect(fitness).toBe(1 / (1 + 5)); // 1 / 6
    });

    it('debe retornar 0 en caso de excepción (Manejo de Errores)', () => {
      const fitness = engine.calcularFitness(null);
      expect(fitness).toBe(0);
    });
  });

  // ==========================================
  // generarProgramacionGlobal
  // ==========================================
  describe('generarProgramacionGlobal', () => {
    let mockCursos, mockDocentes, mockAulas;

    beforeEach(() => {
      mockCursos = [
        { _id: 'c1', codigo: 'ASU1', nombre: 'Curso 1', creditos: 3 },
        { _id: 'c2', codigo: 'ASU2', nombre: 'Curso 2', creditos: 4 },
        { _id: 'c3', codigo: 'ASU3', nombre: 'Curso 3', creditos: 2 }
      ];
      mockDocentes = [
        { _id: 'd1', nombre: 'Docente 1', especialidad: ['ASU1'] },
        { _id: 'd2', nombre: 'Docente 2', especialidad: ['ASU2'] }
      ];
      mockAulas = [
        { _id: 'a1', nombre: 'Aula 1', capacidad: 30 }
      ];
    });

    it('debe generar secciones globales correctamente (Happy Path)', () => {
      // Usar secuencia cíclica para evitar bucles infinitos en do-while
      setupMockRandom([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);

      const result = engine.generarProgramacionGlobal(mockCursos, mockDocentes, mockAulas);

      // 3 secciones por cada uno de los 3 cursos = 9 secciones
      expect(result.genes).toHaveLength(9);

      // Sección con 3 créditos (Curso 1)
      const sec1 = result.genes[0];
      expect(sec1.cursoCodigo).toBe('ASU1');
      expect(sec1.horario).toHaveLength(2); // 2 bloques

      // Sección con 4 créditos (Curso 2)
      const sec4 = result.genes[3];
      expect(sec4.cursoCodigo).toBe('ASU2');
      expect(sec4.horario).toHaveLength(3); // 3 bloques

      // Sección con 2 créditos (Curso 3)
      const sec7 = result.genes[6];
      expect(sec7.cursoCodigo).toBe('ASU3');
      expect(sec7.horario).toHaveLength(1); // 1 bloque
    });

    it('debe usar un docente aleatorio si no hay docentes aptos para el curso (Validation)', () => {
      const cursoSinAptos = [{ _id: 'c3', codigo: 'SIN_APTOS', nombre: 'Curso Especial', creditos: 3 }];
      setupMockRandom([0.1, 0.2, 0.3, 0.4]);

      const result = engine.generarProgramacionGlobal(cursoSinAptos, mockDocentes, mockAulas);
      
      expect(result.genes[0].docente).toBeDefined();
    });

    it('debe relanzar errores en caso de fallo (Manejo de Errores)', () => {
      expect(() => engine.generarProgramacionGlobal(null, [], [])).toThrow();
    });
  });

  // ==========================================
  // calcularFitnessGlobal
  // ==========================================
  describe('calcularFitnessGlobal', () => {
    it('debe retornar fitness = 1 si no hay conflictos globales (Happy Path)', () => {
      const individuo = {
        genes: [
          { aula: 'a1', docente: 'd1', horario: [{ dia: 1, franja: 2 }] },
          { aula: 'a2', docente: 'd2', horario: [{ dia: 1, franja: 2 }] }
        ]
      };

      const fitness = engine.calcularFitnessGlobal(individuo);
      expect(fitness).toBe(1);
    });

    it('debe penalizar conflictos de aula y docente en el mismo horario (Validation)', () => {
      const individuo = {
        genes: [
          { aula: 'a1', docente: 'd1', horario: [{ dia: 1, franja: 2 }] },
          { aula: 'a1', docente: 'd2', horario: [{ dia: 1, franja: 2 }] } // Conflicto aula
        ]
      };

      let fitness = engine.calcularFitnessGlobal(individuo);
      expect(fitness).toBe(0.5); // 1 / (1 + 1)

      const individuoDocente = {
        genes: [
          { aula: 'a1', docente: 'd1', horario: [{ dia: 1, franja: 2 }] },
          { aula: 'a2', docente: 'd1', horario: [{ dia: 1, franja: 2 }] } // Conflicto docente
        ]
      };

      fitness = engine.calcularFitnessGlobal(individuoDocente);
      expect(fitness).toBe(0.5);
    });

    it('debe penalizar por franjas de horario fuera de rango (Validation)', () => {
      const individuo = {
        genes: [
          { aula: 'a1', docente: 'd1', horario: [{ dia: 1, franja: -1 }] } // Fuera de rango
        ]
      };

      const fitness = engine.calcularFitnessGlobal(individuo);
      expect(fitness).toBe(1 / 6);
    });

    it('debe retornar 0 en caso de excepción (Manejo de Errores)', () => {
      const fitness = engine.calcularFitnessGlobal(null);
      expect(fitness).toBe(0);
    });
  });

  // ==========================================
  // crearIndividuoAlumno
  // ==========================================
  describe('crearIndividuoAlumno', () => {
    it('debe sugerir secciones de la lista disponible que coincidan con los cursos (Happy Path)', () => {
      const mockCursos = [{ _id: 'c1' }, { _id: 'c2' }];
      const mockSecciones = [
        { _id: 'sec1', curso: { _id: 'c1' } },
        { _id: 'sec2', curso: 'c2' } // Soporta tanto id directo como populate
      ];

      const result = engine.crearIndividuoAlumno(mockCursos, mockSecciones);

      expect(result.genes).toHaveLength(2);
      expect(result.genes[0]._id).toBe('sec1');
      expect(result.genes[1]._id).toBe('sec2');
    });

    it('debe omitir cursos que no tengan secciones disponibles (Validation)', () => {
      const mockCursos = [{ _id: 'c1' }, { _id: 'c2' }];
      const mockSecciones = [
        { _id: 'sec1', curso: { _id: 'c1' } }
      ];

      const result = engine.crearIndividuoAlumno(mockCursos, mockSecciones);

      expect(result.genes).toHaveLength(1);
      expect(result.genes[0]._id).toBe('sec1');
    });

    it('debe relanzar errores en caso de fallo (Manejo de Errores)', () => {
      expect(() => engine.crearIndividuoAlumno(null, [])).toThrow();
    });
  });

  // ==========================================
  // calcularFitnessAlumno
  // ==========================================
  describe('calcularFitnessAlumno', () => {
    it('debe retornar fitness = 1 si no hay conflictos ni huecos (Happy Path)', () => {
      const individuo = {
        genes: [
          { horario: [{ dia: 1, franja: 2 }] },
          { horario: [{ dia: 1, franja: 3 }] }
        ]
      };

      const fitness = engine.calcularFitnessAlumno(individuo);
      expect(fitness).toBe(1);
    });

    it('debe penalizar fuertemente cruces de horarios para el alumno (Validation)', () => {
      const individuo = {
        genes: [
          { horario: [{ dia: 1, franja: 2 }] },
          { horario: [{ dia: 1, franja: 2 }] } // Cruce
        ]
      };

      const fitness = engine.calcularFitnessAlumno(individuo);
      expect(fitness).toBe(1 / 16); // 1 / (1 + 15)
    });

    it('debe penalizar huecos (ventanas) en el horario del alumno (Validation)', () => {
      const individuo = {
        genes: [
          { horario: [{ dia: 1, franja: 2 }] },
          { horario: [{ dia: 1, franja: 4 }] } // Hueco de 1 franja (franja 3)
        ]
      };

      const fitness = engine.calcularFitnessAlumno(individuo);
      expect(fitness).toBe(1 / (1 + 0.1)); // 1 / 1.1 = 0.90909...
    });

    it('debe retornar 0 en caso de excepción (Manejo de Errores)', () => {
      const fitness = engine.calcularFitnessAlumno(null);
      expect(fitness).toBe(0);
    });
  });
});
