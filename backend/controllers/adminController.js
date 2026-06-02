import { GeneticEngine } from '../src/engine/genetic.js';
import { Curso, Docente, Aula, Seccion, Estudiante } from '../models/Schemas.js';

// Generar la programación académica de secciones a nivel global
export const generarHorariosGlobales = async (req, res) => {
  console.log("🛠️ Generación global de secciones iniciada por el administrador...");
  try {
    const cursos = await Curso.find().lean();
    const docentes = await Docente.find().lean();
    const aulas = await Aula.find().lean();

    if (!cursos.length || !docentes.length || !aulas.length) {
      return res.status(400).json({ error: "Faltan cursos, docentes o aulas para realizar la programación." });
    }

    const motor = new GeneticEngine();
    let mejorIndividuo = null;
    let mejorFitness = -1;

    // Ejecutar algoritmo genético para encontrar asignaciones de secciones sin solapamientos
    for (let i = 0; i < 300; i++) {
      const candidato = motor.generarProgramacionGlobal(cursos, docentes, aulas);
      const fitness = motor.calcularFitnessGlobal(candidato);

      if (fitness > mejorFitness) {
        mejorFitness = fitness;
        mejorIndividuo = { ...candidato, fitness };
      }
      
      // Si se encuentra una solución perfecta con 0 conflictos, detener búsqueda
      if (fitness === 1) break;
    }

    console.log(`🎯 Programación global completada. Fitness: ${mejorFitness}`);

    // Limpiar secciones existentes
    await Seccion.deleteMany({});

    // Mapear los genes a documentos del modelo Seccion y guardarlos
    const seccionesToSave = mejorIndividuo.genes.map(g => ({
      codigo: g.codigo,
      curso: g.curso,
      docente: g.docente,
      aula: g.aula,
      horario: g.horario,
      vacantesTotales: g.vacantesTotales,
      vacantesDisponibles: g.vacantesDisponibles
    }));

    const seccionesInsertadas = await Seccion.insertMany(seccionesToSave);

    res.json({
      success: true,
      fitness: mejorFitness,
      totalSecciones: seccionesInsertadas.length,
      secciones: seccionesInsertadas
    });
  } catch (error) {
    console.error("🔥 Error en generarHorariosGlobales:", error.stack);
    res.status(500).json({ error: "Error interno del servidor", detail: error.message });
  }
};

// Aprobar o actualizar estados de pago y deudas del estudiante
export const actualizarEstadoPago = async (req, res) => {
  const { estudianteId, tieneDeudas, tasaPagada, seguroVigente } = req.body;
  try {
    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    if (tieneDeudas !== undefined) estudiante.tieneDeudas = tieneDeudas;
    if (tasaPagada !== undefined) estudiante.tasaPagada = tasaPagada;
    if (seguroVigente !== undefined) estudiante.seguroVigente = seguroVigente;

    await estudiante.save();
    console.log(`💳 Estado financiero actualizado para el estudiante ${estudiante.nombre}`);

    res.json({ success: true, estudiante });
  } catch (error) {
    console.error("🔥 Error en actualizarEstadoPago:", error.stack);
    res.status(500).json({ error: "Error al actualizar pagos", detail: error.message });
  }
};
