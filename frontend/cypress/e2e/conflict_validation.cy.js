import { setupStandardIntercepts } from '../support/intercepts.js';
import { mockSecciones } from '../support/mockData.js';

describe('Validaciones Funcionales - Generación Sin Conflictos', () => {
  beforeEach(() => {
    setupStandardIntercepts();
    cy.visit('/login');
    
    // Iniciar sesión como estudiante
    cy.get('[data-cy="student-select"]').select('Estudiante Test');
    cy.get('[data-cy="student-login-button"]').click();
  });

  it('Debería poder ejecutar el Asistente Genético para buscar combinaciones sin cruces de horarios y recibir notificación de éxito', () => {
    // Interceptar la petición al asistente genético del alumno
    cy.intercept('POST', 'http://localhost:3000/api/matricula/asistente', {
      success: true,
      fitness: 0.950,
      seccionesSugeridas: [mockSecciones[0]]
    }).as('runGeneticAssistant');

    // Hacer clic en el botón del asistente genético (abre el modal)
    cy.get('[data-cy="genetic-assistant-button"]').click();

    // Hacer clic en el botón de confirmar de la encuesta
    cy.get('[data-cy="submit-survey-button"]').click();

    // Esperar respuesta de la API interceptada
    cy.wait('@runGeneticAssistant');

    // Validar mensaje de alerta de éxito
    cy.get('[data-cy="alert-message"]')
      .should('be.visible')
      .and('contain', '¡Asistente completado!')
      .and('contain', 'Fitness: 0.950');
  });
});
