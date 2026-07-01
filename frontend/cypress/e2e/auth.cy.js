import { setupStandardIntercepts } from '../support/intercepts.js';

describe('Flujo de Autenticación y Redirección de Roles', () => {
  beforeEach(() => {
    setupStandardIntercepts();
    cy.visit('/login');
  });

  it('Debería iniciar sesión como administrador con credenciales válidas y cerrar sesión correctamente', () => {
    // Rellenar credenciales de admin
    cy.get('[data-cy="admin-user-input"]').type('admin');
    cy.get('[data-cy="admin-pass-input"]').type('admin');
    cy.get('[data-cy="admin-login-button"]').click();

    // Validar redirección e interfaz de admin
    cy.url().should('include', '/admin');
    cy.contains('Menú Admin').should('be.visible');

    // Cerrar sesión
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('Debería iniciar sesión como estudiante seleccionando un usuario de la lista de simulación', () => {
    // Seleccionar el estudiante de prueba
    cy.get('[data-cy="student-select"]').select('Estudiante Test');
    cy.get('[data-cy="student-login-button"]').click();

    // Validar redirección e interfaz del estudiante
    cy.url().should('include', '/estudiante');
    cy.contains('Expediente Alumno').should('be.visible');

    // Cerrar sesión
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});
