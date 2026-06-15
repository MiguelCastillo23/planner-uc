import { sanitizeNoSQL, noSQLSanitizer, errorHandler } from '../middlewares/security.js';
import { jest } from '@jest/globals';

describe('Security Middlewares - Pruebas Unitarias', () => {
  let warnSpy, errorSpy;

  beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe('sanitizeNoSQL (Sanitizador de Inyección MongoDB)', () => {
    test('Debe eliminar claves que inicien con "$" o contengan "."', () => {
      const payload = {
        username: 'estudiante1',
        password: {
          '$gt': ''
        },
        'nested.field': 'malicioso',
        nestedObject: {
          normalField: 123,
          '$ne': null,
          'deep.nested': 'test'
        }
      };

      const result = sanitizeNoSQL(payload);

      expect(result.username).toBe('estudiante1');
      expect(result.password).toEqual({});
      expect(result.password['$gt']).toBeUndefined();
      expect(result['nested.field']).toBeUndefined();
      expect(result.nestedObject.normalField).toBe(123);
      expect(result.nestedObject['$ne']).toBeUndefined();
      expect(result.nestedObject['deep.nested']).toBeUndefined();
    });

    test('Debe retornar objetos vacíos o nulos sin lanzar errores', () => {
      expect(sanitizeNoSQL(null)).toBeNull();
      expect(sanitizeNoSQL(undefined)).toBeUndefined();
      expect(sanitizeNoSQL('cadena-de-texto')).toBe('cadena-de-texto');
    });
  });

  describe('noSQLSanitizer (Middleware Express)', () => {
    test('Debe sanitizar req.body, req.query y req.params', () => {
      const req = {
        body: { '$gt': 'any' },
        query: { filter: { '$ne': '' } },
        params: { id: '正常id', '$lte': 'x' }
      };
      const res = {};
      const next = jest.fn();

      noSQLSanitizer(req, res, next);

      expect(req.body).toEqual({});
      expect(req.query.filter).toEqual({});
      expect(req.params.id).toBe('正常id');
      expect(req.params['$lte']).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('errorHandler (Manejador de Errores)', () => {
    let req, res, next;
    let originalNodeEnv;

    beforeEach(() => {
      req = {};
      res = {
        statusCode: 200,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: jest.fn()
      };
      next = jest.fn();
      // Guardar el entorno original
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('Debe ocultar los detalles del error (stack trace) en producción', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Database connection failed');
      error.status = 503;

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(503);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Ha ocurrido un error interno en el servidor.'
      });
    });

    test('Debe mostrar los detalles completos del error en desarrollo', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Database connection failed');
      error.status = 500;

      errorHandler(error, req, res, next);

      expect(res.statusCode).toBe(500);
      const jsonResponse = res.json.mock.calls[0][0];
      expect(jsonResponse.error).toBe('Internal Server Error');
      expect(jsonResponse.message).toBe('Database connection failed');
      expect(jsonResponse.stack).toBeDefined();
    });
  });
});
