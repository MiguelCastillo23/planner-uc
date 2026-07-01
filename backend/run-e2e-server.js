import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Curso, Docente, Aula, Seccion, Estudiante, Carrera } from './models/Schemas.js';

async function startServer() {
  try {
    console.log('🔄 Iniciando base de datos MongoDB efímera para E2E...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Conectarse a la BD en memoria temporalmente para sembrar
    await mongoose.connect(mongoUri);
    console.log('🧹 Limpiando colecciones...');
    await Promise.all([
      Curso.deleteMany({}),
      Docente.deleteMany({}),
      Aula.deleteMany({}),
      Seccion.deleteMany({}),
      Estudiante.deleteMany({}),
      Carrera.deleteMany({})
    ]);

    console.log('🌱 Sembrando datos para E2E...');
    // 1. Carreras
    const carreraSistemas = new Carrera({ codigo: 'ING-SIS', nombre: 'Ingeniería de Sistemas' });
    await carreraSistemas.save();

    // 2. Cursos
    const curso1 = new Curso({
      nombre: 'Habilidades Comunicativas',
      codigo: 'ASUCO1083',
      creditos: 4,
      semestre: 1,
      modalidad: 'Presencial',
      carrera: carreraSistemas._id
    });
    const curso2 = new Curso({
      nombre: 'Gestión del Aprendizaje',
      codigo: 'ASUCO1082',
      creditos: 3,
      semestre: 1,
      modalidad: 'Híbrido',
      carrera: carreraSistemas._id
    });
    await Promise.all([curso1.save(), curso2.save()]);

    // 3. Docentes
    const docente1 = new Docente({
      nombre: 'Dra. María Gonzales',
      especialidad: ['ASUCO1083'],
      disponibilidad: [{ dia: '0', franja: [1, 2] }]
    });
    const docente2 = new Docente({
      nombre: 'Ing. Alan Turing',
      especialidad: ['ASUCO1082'],
      disponibilidad: [{ dia: '1', franja: [3, 4] }]
    });
    await Promise.all([docente1.save(), docente2.save()]);

    // 4. Aulas
    const aula1 = new Aula({ nombre: 'Aula A101', capacidad: 30, tipo: 'Teoría' });
    const aula2 = new Aula({ nombre: 'Aula A102', capacidad: 30, tipo: 'Teoría' });
    await Promise.all([aula1.save(), aula2.save()]);

    // 5. Secciones
    const seccion1 = new Seccion({
      codigo: 'ASUCO1083-SEC01',
      curso: curso1._id,
      docente: docente1._id,
      aula: aula1._id,
      horario: [{ dia: 0, franja: 1 }, { dia: 0, franja: 2 }],
      vacantesTotales: 30,
      vacantesDisponibles: 30
    });

    const seccion2 = new Seccion({
      codigo: 'ASUCO1082-SEC01',
      curso: curso2._id,
      docente: docente2._id,
      aula: aula2._id,
      horario: [{ dia: 1, franja: 3 }, { dia: 1, franja: 4 }],
      vacantesTotales: 30,
      vacantesDisponibles: 30
    });
    await Promise.all([seccion1.save(), seccion2.save()]);

    // 6. Estudiantes (Pedro Gómez para Golden, Juan Pérez para Happy, Ana Rojas para Unhappy)
    const estudiante1 = new Estudiante({
      nombre: 'Pedro Gómez (Regular)',
      codigo: 'EST001',
      semestre: 1,
      planEstudios: 'Plan 2018',
      planVigente: true,
      tieneDeudas: false,
      tasaPagada: true,
      seguroVigente: true,
      cursosAprobados: [],
      cantidadDirigidos: 0,
      estadoMatricula: 'Ninguno'
    });

    const estudiante2 = new Estudiante({
      nombre: 'Ana Rojas (Deudor Administrativo)',
      codigo: 'EST002',
      semestre: 1,
      planEstudios: 'Plan 2018',
      planVigente: true,
      tieneDeudas: true, // DEUDA ACTIVA para Unhappy Path
      tasaPagada: false,
      seguroVigente: false,
      cursosAprobados: [],
      cantidadDirigidos: 0,
      estadoMatricula: 'Ninguno'
    });

    const estudiante3 = new Estudiante({
      nombre: 'Juan Pérez (Regular)',
      codigo: 'EST003',
      semestre: 1,
      planEstudios: 'Plan 2018',
      planVigente: true,
      tieneDeudas: false,
      tasaPagada: true,
      seguroVigente: true,
      cursosAprobados: [],
      cantidadDirigidos: 0,
      estadoMatricula: 'Ninguno'
    });

    await Promise.all([estudiante1.save(), estudiante2.save(), estudiante3.save()]);

    console.log('✅ Siembra completada con éxito.');
    
    // Desconectarse para dejar que server.js realice su propia conexión
    await mongoose.disconnect();

    // Establecer variables de entorno para server.js
    process.env.MONGO_URI = mongoUri;
    process.env.PORT = '3000';

    console.log('🚀 Levantando backend de producción en puerto 3000...');
    await import('./server.js');
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor de pruebas E2E:', error);
    process.exit(1);
  }
}

startServer();
