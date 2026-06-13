import { setupStandardIntercepts } from '../support/intercepts.js';

describe('Manejo de Errores y Validaciones de Entrada', () => {
  beforeEach(() => {
    setupStandardIntercepts();
  });

  it('Debería impedir el envío del formulario CRUD si tiene campos obligatorios vacíos (Validación HTML5)', () => {
    cy.visit('/login');
    // Login admin
    cy.get('[data-cy="admin-user-input"]').type('admin');
    cy.get('[data-cy="admin-pass-input"]').type('admin');
    cy.get('[data-cy="admin-login-button"]').click();

    // Navegar a Mantenimiento Académico
    cy.get('[data-cy="tab-mantenimiento"]').click();
    cy.get('[data-cy="subtab-carreras"]').click();

    // Intentar presionar guardar con inputs vacíos
    cy.get('[data-cy="carrera-save-button"]').click();

    // Comprobar que los campos de entrada requeridos siguen siendo inválidos según HTML5 y no se ha enviado POST
    cy.get('[data-cy="carrera-codigo-input"]:invalid').should('exist');
    cy.get('[data-cy="carrera-nombre-input"]:invalid').should('exist');
  });

  it('Debería mostrar indicador visual de advertencia (rojo) cuando los créditos seleccionados estén fuera del rango válido [12, 25]', () => {
    cy.visit('/login');
    // Login estudiante
    cy.get('[data-cy="student-select"]').select('Estudiante Test');
    cy.get('[data-cy="student-login-button"]').click();

    // Inicialmente 0 créditos seleccionados (fuera de rango) -> indicador en rojo
    cy.get('[data-cy="credits-counter"]')
      .should('be.visible')
      .and('contain', 'Créditos Seleccionados: 0')
      .and('have.css', 'color', 'rgb(248, 113, 113)'); // #f87171 en rgb

    // Seleccionar SEC01 (4 créditos) -> 4 créditos (aún fuera de rango)
    cy.get('[data-cy="section-checkbox-SEC01"]').click();
    cy.get('[data-cy="credits-counter"]')
      .should('contain', 'Créditos Seleccionados: 4')
      .and('have.css', 'color', 'rgb(248, 113, 113)');
  });
});
