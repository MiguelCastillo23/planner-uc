export default {
  testEnvironment: 'node',
  transform: {},
  // Omitimos globalSetup y globalTeardown para evitar levantar la base de datos en memoria
  collectCoverage: false
};
