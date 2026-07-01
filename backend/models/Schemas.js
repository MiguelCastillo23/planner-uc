import mongoose from 'mongoose';

const CursoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  creditos: { type: Number, required: true, min: 1, max: 6 },
  semestre: { type: Number, required: true, min: 1, max: 10 },
  prerrequisitos: [String],
  modalidad: { type: String, enum: ['Presencial', 'Semipresencial', 'Distancia', 'Híbrido'], default: 'Presencial' },
  carrera: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrera' }
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

const SeccionSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  docente: { type: mongoose.Schema.Types.ObjectId, ref: 'Docente', required: true },
  aula: { type: mongoose.Schema.Types.ObjectId, ref: 'Aula', required: true },
  horario: [{ dia: Number, franja: Number }], // dia: 0 (Lunes) a 5 (Sábado)
  vacantesTotales: { type: Number, required: true, default: 25 },
  vacantesDisponibles: { type: Number, required: true, default: 25 }
});

const EstudianteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true },
  semestre: { type: Number, required: true, default: 1, min: 1, max: 10 },
  planEstudios: { type: String, default: 'Plan 2018' },
  planVigente: { type: Boolean, default: true },
  tieneDeudas: { type: Boolean, default: false },
  tasaPagada: { type: Boolean, default: true },
  seguroVigente: { type: Boolean, default: true },
  cursosAprobados: [String], // Códigos de cursos aprobados
  historialDesaprobados: { type: Map, of: Number, default: {} }, // cursoCodigo -> número de desaprobaciones
  cantidadDirigidos: { type: Number, default: 0 },
  estadoMatricula: { type: String, enum: ['Ninguno', 'Matriculado', 'Reservado'], default: 'Ninguno' }
});

const MatriculaSchema = new mongoose.Schema({
  estudiante: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudiante', required: true },
  secciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seccion' }],
  asistenciaHibrida: { type: Map, of: String, default: {} }, // seccionId -> 'Física' | 'Remota'
  fecha: { type: Date, default: Date.now },
  semana: { type: Number, default: 1 }
}, { timestamps: true });

const HorarioSchema = new mongoose.Schema({
  nombreConfig: String,
  totalCreditos: { type: Number, min: 20, max: 25 },
  asignaciones: [{
    curso: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
    docente: { type: mongoose.Schema.Types.ObjectId, ref: 'Docente' },
    aula: { type: mongoose.Schema.Types.ObjectId, ref: 'Aula' },
    dia: String,
    franja: Number
  }],
  fitnessScore: Number
}, { timestamps: true });

const CarreraSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  codigo: { type: String, required: true, unique: true }
});

export const Curso = mongoose.model('Curso', CursoSchema);
export const Docente = mongoose.model('Docente', DocenteSchema);
export const Aula = mongoose.model('Aula', AulaSchema);
export const Seccion = mongoose.model('Seccion', SeccionSchema);
export const Estudiante = mongoose.model('Estudiante', EstudianteSchema);
export const Matricula = mongoose.model('Matricula', MatriculaSchema);
export const Horario = mongoose.model('Horario', HorarioSchema);
export const Carrera = mongoose.model('Carrera', CarreraSchema);

