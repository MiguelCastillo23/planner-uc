import { setupStandardIntercepts } from '../support/intercepts.js';
import { mockCarreras } from '../support/mockData.js';

describe('Gestión de Datos - Panel de Administración', () => {
  beforeEach(() => {
    setupStandardIntercepts();
    cy.visit('/login');
    
    // Iniciar sesión como administrador
    cy.get('[data-cy="admin-user-input"]').type('admin');
    cy.get('[data-cy="admin-pass-input"]').type('admin');
    cy.get('[data-cy="admin-login-button"]').click();
    
    // Navegar a la pestaña de Mantenimiento Académico
    cy.get('[data-cy="tab-mantenimiento"]').click();
  });

  it('Debería poder registrar una nueva carrera académica y verla en la lista', () => {
    // Interceptar la petición de creación de carrera
    cy.intercept('POST', 'http://localhost:3000/api/admin/carreras', {
      success: true,
      carrera: { _id: 'new-car-id', codigo: 'ING-IND', nombre: 'Ingeniería Industrial' }
    }).as('saveCarrera');

    // Interceptar la recarga de carreras agregando la nueva carrera
    const updatedCarreras = [
      ...mockCarreras,
      { _id: 'new-car-id', codigo: 'ING-IND', nombre: 'Ingeniería Industrial' }
    ];
    cy.intercept('GET', 'http://localhost:3000/api/carreras', updatedCarreras).as('getCarrerasUpdated');

    // Seleccionar subpestaña carreras (ya está activa por defecto, pero hacemos click para asegurar)
    cy.get('[data-cy="subtab-carreras"]').click();

    // Rellenar formulario de carrera
    cy.get('[data-cy="carrera-codigo-input"]').type('ING-IND');
    cy.get('[data-cy="carrera-nombre-input"]').type('Ingeniería Industrial');
    cy.get('[data-cy="carrera-save-button"]').click();

    // Validar petición POST y actualización del DOM
    cy.wait('@saveCarrera');
    cy.contains('ING-IND').should('be.visible');
    cy.contains('Ingeniería Industrial').should('be.visible');
  });
});
