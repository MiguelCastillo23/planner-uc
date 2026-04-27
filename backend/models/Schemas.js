import mongoose from 'mongoose';

const CursoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  creditos: { type: Number, required: true, min: 1, max: 6 }
});

const DocenteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especialidad: [String],
  disponibilidad: [{ dia: String, franja: [Number] }] // Franjas de 1 a 10 (ej. 7am-10pm)
});

const AulaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  capacidad: Number,
  tipo: { type: String, enum: ['Teoría', 'Laboratorio'] }
});

const HorarioSchema = new mongoose.Schema({
  nombreConfig: String,
  totalCreditos: { type: Number, min: 20, max: 22 },
  asignaciones: [{
    curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
    docente: { type: mongoose.Schema.Types.ObjectId, ref: 'Docente' },
    aula: { type: mongoose.Schema.Types.ObjectId, ref: 'Aula' },
    dia: String,
    franja: Number
  }],
  fitnessScore: Number
}, { timestamps: true });

export const Curso = mongoose.model('Curso', CursoSchema);
export const Docente = mongoose.model('Docente', DocenteSchema);
export const Aula = mongoose.model('Aula', AulaSchema);
export const Horario = mongoose.model('Horario', HorarioSchema);
