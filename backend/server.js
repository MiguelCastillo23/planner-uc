import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { generarHorario } from './controllers/horarioController.js';
import { Curso } from './models/Schemas.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión optimizada con Pool de conexiones para escalabilidad
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error de conexión:', err));

app.get('/api/cursos', async (req, res) => {
  const cursos = await Curso.find().lean();
  res.json(cursos);
});

app.post('/api/horarios/generar', generarHorario);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
