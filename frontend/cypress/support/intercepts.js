import { mockCursos, mockDocentes, mockAulas, mockCarreras, mockEstudiantes, mockSecciones } from './mockData.js';

export function setupStandardIntercepts() {
  cy.intercept('GET', 'http://localhost:3000/api/cursos', mockCursos).as('getCursos');
  cy.intercept('GET', 'http://localhost:3000/api/docentes', mockDocentes).as('getDocentes');
  cy.intercept('GET', 'http://localhost:3000/api/aulas', mockAulas).as('getAulas');
  cy.intercept('GET', 'http://localhost:3000/api/carreras', mockCarreras).as('getCarreras');
  cy.intercept('GET', 'http://localhost:3000/api/estudiantes', mockEstudiantes).as('getEstudiantes');
  cy.intercept('GET', 'http://localhost:3000/api/secciones', mockSecciones).as('getSecciones');
  cy.intercept('GET', 'http://localhost:3000/environmental-impact', 'Total solicitudes procesadas: 10\nCO2 Total generado: 0.123456 gramos\nSolicitud promedio: 1500 Bytes').as('getEnvImpact');
}
