import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Curso } from './models/Schemas.js';

dotenv.config();

const cursosEjemplo = [
  { nombre: "Cálculo I", codigo: "MAT101", creditos: 4 },
  { nombre: "Programación Orientada a Objetos", codigo: "INF202", creditos: 5 },
  { nombre: "Bases de Datos", codigo: "INF303", creditos: 4 },
  { nombre: "Ética y Ciudadanía", codigo: "HUM101", creditos: 2 },
  { nombre: "Estructuras de Datos", codigo: "INF205", creditos: 4 },
  { nombre: "Arquitectura de Software", codigo: "INF401", creditos: 3 },
  { nombre: "Inteligencia Artificial", codigo: "INF501", creditos: 4 },
  { nombre: "Redes de Computadoras", codigo: "INF305", creditos: 4 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Conectado para siembra de datos...");
    
    await Curso.deleteMany({}); // Limpia la colección para evitar duplicados
    await Curso.insertMany(cursosEjemplo);
    
    console.log("✅ Cursos insertados correctamente");
    process.exit();
  } catch (err) {
    console.error("❌ Error en el seed:", err);
    process.exit(1);
  }
};

seedDB();
