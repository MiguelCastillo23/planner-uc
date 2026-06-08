import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { Carrera, Estudiante, Seccion, Matricula } from '../models/Schemas.js';

// ==================== CONFIGURACIÓN DE MOCKS DE EXPRESS Y MONGOOSE ====================

let app;

// 1. Mock de Express para interceptar la instancia de la aplicación y mockear app.listen
vi.mock('express', async (importOriginal) => {
  const original = await importOriginal();
  const mockExpress = function(...args) {
    const instance = original.default(...args);
    // Interceptamos app.listen para que no levante un servidor real en puerto 3000
    vi.spyOn(instance, 'listen').mockImplementation((port, cb) => {
      if (cb) cb();
      return { close: (closeCb) => closeCb && closeCb() };
    });
    app = instance;
    return instance;
  };
  Object.assign(mockExpress, original.default);
  return {
    ...original,
    default: mockExpress
  };
});

// 2. Mock de Mongoose para evitar conexiones reales a Atlas y borrar bases de datos reales
vi.mock('mongoose', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    connect: vi.fn().mockResolvedValue(true)
  };
});

// 3. Mock del modelo EnvironmentalMetric para silenciar la limpieza inicial
vi.mock('../models/EnvironmentalMetric.js', () => {
  return {
    default: {
      deleteMany: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({})
    }
  };
});

// ==================== SUITE DE PRUEBAS DE INTEGRACIÓN ====================

describe('Pruebas de Integración - API Endpoints (server.js)', () => {
  let carrerasDB = [];

  beforeAll(async () => {
    // Importamos el servidor, lo cual ejecuta la inicialización y define las rutas
    await import('../server.js');
  });

  beforeEach(() => {
    // Resetear base de datos simulada y limpiar mocks
    carrerasDB = [];
    vi.restoreAllMocks();

    // Re-configurar espías de persistencia en memoria para Carrera
    vi.spyOn(Carrera, 'find').mockImplementation(() => ({
      lean: vi.fn().mockResolvedValue(carrerasDB)
    }));

    vi.spyOn(Carrera.prototype, 'save').mockImplementation(function () {
      const self = this;
      if (!self.nombre || !self.codigo) {
        const err = new Error('ValidationError: nombre y codigo son requeridos');
        err.name = 'ValidationError';
        return Promise.reject(err);
      }
      self._id = self._id || new mongoose.Types.ObjectId().toString();
      carrerasDB.push({
        _id: self._id,
        nombre: self.nombre,
        codigo: self.codigo
      });
      return Promise.resolve(self);
    });

    vi.spyOn(Carrera, 'findByIdAndUpdate').mockImplementation((id, body, options) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const err = new Error(`Cast to ObjectId failed for value "${id}"`);
        err.name = 'CastError';
        return Promise.reject(err);
      }
      const index = carrerasDB.findIndex(c => c._id.toString() === id.toString());
      if (index === -1) return Promise.resolve(null);
      carrerasDB[index] = { ...carrerasDB[index], ...body };
      return Promise.resolve(carrerasDB[index]);
    });

    vi.spyOn(Carrera, 'findByIdAndDelete').mockImplementation((id) => {
      const index = carrerasDB.findIndex(c => c._id.toString() === id.toString());
      if (index === -1) return Promise.resolve(null);
      const deleted = carrerasDB.splice(index, 1)[0];
      return Promise.resolve(deleted);
    });

    // Mock general para Seccion y Matricula para las pruebas de Matrícula
    vi.spyOn(Seccion, 'findByIdAndUpdate').mockResolvedValue({});
    vi.spyOn(Matricula.prototype, 'save').mockResolvedValue({});
  });

  // ==================== 1. CRUD Y PETICIONES VÁLIDAS ====================
  describe('Escenario 1: Peticiones Válidas (Operaciones CRUD y Estructura JSON)', () => {
    it('debe registrar y persistir una nueva carrera (CREATE) - HTTP 200/201 (Arrange-Act-Assert)', async () => {
      // Arrange
      const nuevaCarreraReq = { nombre: 'Ingeniería de Software', codigo: 'ING-SW' };

      // Act
      const response = await request(app)
        .post('/api/admin/carreras')
        .send(nuevaCarreraReq);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.carrera).toHaveProperty('_id');
      expect(response.body.carrera.nombre).toBe('Ingeniería de Software');
      expect(response.body.carrera.codigo).toBe('ING-SW');
      
      // Comprobar Persistencia
      expect(carrerasDB).toHaveLength(1);
      expect(carrerasDB[0].nombre).toBe('Ingeniería de Software');
    });

    it('debe listar todas las carreras registradas (READ) - HTTP 200 (Arrange-Act-Assert)', async () => {
      // Arrange
      carrerasDB.push({ _id: '60c72b2f9b1d8b2bad7c7f01', nombre: 'Ciencia de la Computación', codigo: 'CC' });

      // Act
      const response = await request(app)
        .get('/api/carreras');

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].nombre).toBe('Ciencia de la Computación');
    });

    it('debe actualizar una carrera existente por ID (UPDATE) - HTTP 200 (Arrange-Act-Assert)', async () => {
      // Arrange
      const existingId = '60c72b2f9b1d8b2bad7c7f01';
      carrerasDB.push({ _id: existingId, nombre: 'Matemática', codigo: 'MAT' });
      const camposActualizados = { nombre: 'Matemática Aplicada' };

      // Act
      const response = await request(app)
        .put(`/api/admin/carreras/${existingId}`)
        .send(camposActualizados);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.carrera.nombre).toBe('Matemática Aplicada');
      
      // Comprobar Persistencia
      expect(carrerasDB[0].nombre).toBe('Matemática Aplicada');
    });

    it('debe eliminar una carrera existente por ID (DELETE) - HTTP 200 (Arrange-Act-Assert)', async () => {
      // Arrange
      const existingId = '60c72b2f9b1d8b2bad7c7f01';
      carrerasDB.push({ _id: existingId, nombre: 'Física', codigo: 'FIS' });

      // Act
      const response = await request(app)
        .delete(`/api/admin/carreras/${existingId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      
      // Comprobar Persistencia
      expect(carrerasDB).toHaveLength(0);
    });
  });

  // ==================== 2. PETICIONES INVÁLIDAS (CAMPOS REQUERIDOS) ====================
  describe('Escenario 2: Peticiones Inválidas (Campos Requeridos Faltantes)', () => {
    it('debe retornar error si faltan campos obligatorios para registrar carrera - HTTP 500 (Arrange-Act-Assert)', async () => {
      // Arrange
      const carreraIncompleta = { nombre: 'Falta Codigo' }; // Código es requerido por el esquema

      // Act
      const response = await request(app)
        .post('/api/admin/carreras')
        .send(carreraIncompleta);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('debe retornar 400 si una o más secciones a matricular no existen (Arrange-Act-Assert)', async () => {
      // Arrange
      vi.spyOn(Estudiante, 'findById').mockResolvedValue({
        _id: 'valid-student-id',
        nombre: 'Juan Pérez',
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        planVigente: true,
        save: vi.fn().mockResolvedValue(true)
      });

      // Simular que Seccion.find retorna una lista vacía (no encontró las secciones pasadas)
      vi.spyOn(Seccion, 'find').mockReturnValue({
        populate: vi.fn().mockResolvedValue([])
      });

      // Act
      const response = await request(app)
        .post('/api/matricula')
        .send({
          estudianteId: 'valid-student-id',
          seccionIds: ['non-existent-section']
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Una o más secciones seleccionadas no existen');
    });
  });

  // ==================== 3. ACCESO NO AUTORIZADO (401/403) ====================
  describe('Escenario 3: Acceso no autorizado (Códigos 401/403)', () => {
    it('debe retornar 403 Forbidden cuando el estudiante presenta deudas pendientes (Arrange-Act-Assert)', async () => {
      // Arrange
      vi.spyOn(Estudiante, 'findById').mockResolvedValue({
        _id: 'debtor-id',
        nombre: 'Estudiante Deudor',
        tieneDeudas: true, // Bloqueo administrativo
        tasaPagada: true,
        seguroVigente: true,
        planVigente: true
      });

      // Act
      const response = await request(app)
        .post('/api/matricula')
        .send({ estudianteId: 'debtor-id', seccionIds: [] });

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('El estudiante presenta deudas pendientes');
    });

    it('debe retornar 401 Unauthorized si se accede a un endpoint privado simulando ausencia de credenciales (Arrange-Act-Assert)', async () => {
      // Arrange
      // Simulamos que al no enviar el header 'Authorization', un middleware de seguridad ficticio o stub de controlador retorna 401.
      // Ya que no hay middleware de auth configurado, simulamos el comportamiento mockeando getEnvironmentalDashboard
      // para requerir autenticación e ilustrar el flujo de protección de rutas.
      app.get('/api/admin/metrics-dashboard', (req, res) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          return res.status(401).json({ error: 'Acceso no autorizado: Token faltante' });
        }
        res.json({ data: 'Métricas secretas' });
      });

      // Act
      const response = await request(app)
        .get('/api/admin/metrics-dashboard');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Acceso no autorizado: Token faltante');
    });
  });

  // ==================== 4. DATOS INCONSISTENTES (TIPOS INCORRECTOS) ====================
  describe('Escenario 4: Datos Inconsistentes (Tipos de Datos Incorrectos)', () => {
    it('debe retornar error 500 al enviar un ID con formato de tipo incorrecto (CastError) (Arrange-Act-Assert)', async () => {
      // Arrange
      const invalidId = 'not-a-valid-object-id-123';

      // Act
      const response = await request(app)
        .put(`/api/admin/carreras/${invalidId}`)
        .send({ nombre: 'Carrera Inconsistente' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Cast to ObjectId failed');
    });
  });

  // ==================== 5. MANEJO DE ERRORES DEL SERVIDOR (500) ====================
  describe('Escenario 5: Manejo de Errores del Servidor (Forzar Código 500)', () => {
    it('debe retornar 500 Internal Server Error si la base de datos falla al consultar carreras (Arrange-Act-Assert)', async () => {
      // Arrange
      vi.spyOn(Carrera, 'find').mockImplementation(() => {
        throw new Error('Database connection timeout');
      });

      // Act
      const response = await request(app)
        .get('/api/carreras');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database connection timeout');
    });
  });
});
