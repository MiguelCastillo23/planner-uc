import { setupStandardIntercepts } from '../support/intercepts.js';

describe('Navegación Funcional y Renderizado de Horarios', () => {
  beforeEach(() => {
    setupStandardIntercepts();
    cy.visit('/login');
    
    // Iniciar sesión como estudiante
    cy.get('[data-cy="student-select"]').select('Estudiante Test');
    cy.get('[data-cy="student-login-button"]').click();
  });

  it('Debería poder seleccionar asignaturas y visualizarlas reflejadas en la grilla de horarios', () => {
    // Verificar que la grilla de horarios inicial no se renderiza (ya que no hay cursos seleccionados)
    cy.get('[data-cy="schedule-grid"]').should('not.exist');

    // Seleccionar la asignatura SEC01 (Introducción a la Programación)
    cy.get('[data-cy="section-checkbox-SEC01"]').click();

    // Validar que la grilla de horario ahora renderiza el curso y su respectiva aula
    cy.get('[data-cy="schedule-grid"]').within(() => {
      cy.contains('INTRODUCCIÓN A LA PROGRAMACIÓN').should('be.visible');
      cy.contains('AULA: Lab 101').should('be.visible');
      cy.contains('Prof. Alan Turing').should('be.visible');
    });

    // Deseleccionar la asignatura SEC01
    cy.get('[data-cy="section-checkbox-SEC01"]').click();
    cy.contains('INTRODUCCIÓN A LA PROGRAMACIÓN').should('not.exist');
  });
});
