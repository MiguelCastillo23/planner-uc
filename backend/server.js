import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import { generarHorario } from './controllers/horarioController.js';
import { Curso } from './models/Schemas.js';
import EnvironmentalMetric from './models/EnvironmentalMetric.js';
import { environmentalTracker } from './middlewares/environmentalTracker.js';
import { getEnvironmentalDashboard } from './controllers/environmentalController.js';

dotenv.config();

const app = express();
// Aplicar middleware de medición ambiental globalmente (debe estar arriba para medir el stream de salida)
app.use(environmentalTracker);

// Aplicar compresión Gzip para reducir tamaño de transferencia en red
app.use(compression());

app.use(cors());
app.use(express.json());

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
    const cursos = await Curso.find().select('nombre codigo creditos').lean();
    cacheCursos = cursos;
    cacheTime = ahora;
    return res.json(cursos);
  }

  // Paginación de datos si se solicita explícitamente
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const cursos = await Curso.find()
    .select('nombre codigo creditos')
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json(cursos);
});

app.post('/api/horarios/generar', generarHorario);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
