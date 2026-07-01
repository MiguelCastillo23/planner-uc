import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { generarHorario } from './controllers/horarioController.js';
import { generarHorariosGlobales, actualizarEstadoPago } from './controllers/adminController.js';
import { 
  getEstudiante, 
  getSeccionesDisponibles, 
  getEstudiantesSimulacion, 
  procesarMatricula, 
  autoMatricularAsistente, 
  solicitarAsignaturaDirigida, 
  procesarRetiroCurso, 
  procesarReservaMatricula 
} from './controllers/studentController.js';
import { Curso, Docente, Aula, Carrera, Matricula } from './models/Schemas.js';
import EnvironmentalMetric from './models/EnvironmentalMetric.js';
import { environmentalTracker } from './middlewares/environmentalTracker.js';
import { getEnvironmentalDashboard } from './controllers/environmentalController.js';
import { noSQLSanitizer, errorHandler } from './middlewares/security.js';

dotenv.config();

const app = express();

// Cabeceras de seguridad HTTP (OWASP A5:2021-Security Misconfiguration)
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar CSP estricto para desarrollo local flexible
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Aplicar rate limiting general para prevenir denegación de servicio (OWASP A1:2021-Broken Access Control)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // límite de 200 peticiones por ventana por IP
  message: { error: 'Too many requests', message: 'Límite de peticiones excedido. Intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Aplicar middleware de medición ambiental globalmente (debe estar arriba para medir el stream de salida)
app.use(environmentalTracker);

// Aplicar compresión Gzip para reducir tamaño de transferencia en red
app.use(compression());

app.use(cors());
app.use(express.json());

// Sanitización contra NoSQL Injection (OWASP A3:2021-Injection)
app.use(noSQLSanitizer);

// Ruta pública para el dashboard de impacto ambiental
app.get('/environmental-impact', getEnvironmentalDashboard);

// Silenciar peticiones automáticas de favicon.ico (Evita contaminación por 404s innecesarios)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Conexión optimizada con Pool de conexiones para escalabilidad
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB Atlas');
    // Eliminar registros históricos al iniciar para nueva sesión de medición
    await EnvironmentalMetric.deleteMany({});
    console.log('🌱 Historial de métricas ambientales limpiado');
  })
  .catch((err) => console.error('❌ Error de conexión:', err));

// Variables para caché en memoria de cursos (Optimización de Sostenibilidad)
let cacheCursos = null;
let cacheTime = null;
const CACHE_DURATION = 60000; // 1 minuto de caché

app.get('/api/cursos', async (req, res) => {
  const { page, limit } = req.query;

  // Añadir cabecera HTTP para caché del navegador por 60 segundos (Reducción de peticiones de red)
  res.set('Cache-Control', 'public, max-age=60');

  // Si no hay parámetros de paginación, sirve desde la caché si es válida
  if (!page && !limit) {
    const ahora = Date.now();
    if (cacheCursos && cacheTime && (ahora - cacheTime < CACHE_DURATION)) {
      console.log('⚡ Sirviendo cursos desde la caché de memoria (Ahorro de BD)');
      return res.json(cacheCursos);
    }
    
    // Optimización de consulta: select() para traer solo lo indispensable
    const cursos = await Curso.find().select('nombre codigo creditos semestre prerrequisitos modalidad').lean();
    cacheCursos = cursos;
    cacheTime = ahora;
    return res.json(cursos);
  }

  // Paginación de datos si se solicita explícitamente
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const cursos = await Curso.find()
    .select('nombre codigo creditos semestre prerrequisitos modalidad')
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json(cursos);
});

app.get('/api/docentes', async (req, res) => {
  try {
    const docentes = await Docente.find().select('nombre especialidad disponibilidad').lean();
    res.json(docentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/aulas', async (req, res) => {
  try {
    const aulas = await Aula.find().select('nombre capacidad tipo').lean();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Rutas de administración
app.post('/api/admin/generar-horarios-globales', generarHorariosGlobales);
app.post('/api/admin/actualizar-pagos', actualizarEstadoPago);

// CRUD Carreras
app.get('/api/carreras', async (req, res) => {
  try {
    const carreras = await Carrera.find().lean();
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/carreras', async (req, res) => {
  try {
    const nuevaCarrera = new Carrera(req.body);
    await nuevaCarrera.save();
    res.json({ success: true, carrera: nuevaCarrera });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/carreras/:id', async (req, res) => {
  try {
    const carreraActualizada = await Carrera.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, carrera: carreraActualizada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/carreras/:id', async (req, res) => {
  try {
    await Carrera.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Cursos
app.post('/api/admin/cursos', async (req, res) => {
  try {
    const nuevoCurso = new Curso(req.body);
    await nuevoCurso.save();
    res.json({ success: true, curso: nuevoCurso });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/cursos/:id', async (req, res) => {
  try {
    const cursoActualizado = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, curso: cursoActualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/cursos/:id', async (req, res) => {
  try {
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Docentes
app.post('/api/admin/docentes', async (req, res) => {
  try {
    const disponibilidad = req.body.disponibilidad || [
      { dia: 'Lunes', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { dia: 'Martes', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { dia: 'Miércoles', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { dia: 'Jueves', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { dia: 'Viernes', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
      { dia: 'Sábado', franja: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
    ];
    const nuevoDocente = new Docente({ ...req.body, disponibilidad });
    await nuevoDocente.save();
    res.json({ success: true, docente: nuevoDocente });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/docentes/:id', async (req, res) => {
  try {
    const docenteActualizado = await Docente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, docente: docenteActualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/docentes/:id', async (req, res) => {
  try {
    await Docente.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD Aulas
app.post('/api/admin/aulas', async (req, res) => {
  try {
    const nuevaAula = new Aula(req.body);
    await nuevaAula.save();
    res.json({ success: true, aula: nuevaAula });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/aulas/:id', async (req, res) => {
  try {
    const aulaActualizada = await Aula.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, aula: aulaActualizada });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/aulas/:id', async (req, res) => {
  try {
    await Aula.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Rutas de estudiantes
app.get('/api/estudiantes', getEstudiantesSimulacion);
app.get('/api/estudiantes/:codigo', getEstudiante);
app.get('/api/secciones', getSeccionesDisponibles);
app.post('/api/matricula', procesarMatricula);
app.post('/api/matricula/asistente', autoMatricularAsistente);
app.post('/api/matricula/dirigida', solicitarAsignaturaDirigida);
app.post('/api/matricula/retiro', procesarRetiroCurso);
app.post('/api/matricula/reserva', procesarReservaMatricula);

// Obtener alumnos matriculados en una sección para el Teacher Dashboard
app.get('/api/secciones/:id/estudiantes', async (req, res) => {
  try {
    const { id } = req.params;
    const matriculas = await Matricula.find({ secciones: id }).populate('estudiante');
    const estudiantesEnrolled = matriculas.map(m => {
      const est = m.estudiante;
      if (!est) return null;
      
      let asistencia = 'Física';
      if (m.asistenciaHibrida) {
        if (typeof m.asistenciaHibrida.get === 'function') {
          asistencia = m.asistenciaHibrida.get(id);
        } else {
          asistencia = m.asistenciaHibrida[id];
        }
      }
      return {
        _id: est._id,
        nombre: est.nombre,
        codigo: est.codigo,
        asistencia: asistencia || 'Física'
      };
    }).filter(Boolean);
    res.json(estudiantesEnrolled);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/horarios/generar', generarHorario);

// Manejador de errores global seguro (OWASP A5:2021-Security Misconfiguration / Error Handling)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
