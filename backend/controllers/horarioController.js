import { GeneticEngine } from '../src/engine/genetic.js';

export const generarHorario = async (req, res) => {
  console.log("Iniciando generación de horario para:", req.body.cursos?.length, "cursos");
  
  try {
    const { cursos } = req.body;
    if (!cursos || cursos.length === 0) return res.status(400).json({ error: "No hay cursos" });

    const motor = new GeneticEngine();
    let mejorIndividuo = null;
    let mejorFitness = -1;

    for (let i = 0; i < 300; i++) {
      const candidato = motor.crearIndividuo(cursos);
      const fitness = motor.calcularFitness(candidato);
      
      if (fitness > mejorFitness) {
        mejorFitness = fitness;
        mejorIndividuo = { ...candidato, fitness };
      }
    }

    console.log("✅ Generación exitosa. Mejor Fitness:", mejorFitness);
    res.json(mejorIndividuo);
  } catch (error) {
    console.error("🔥 CRASH EN CONTROLADOR:", error.stack);
    res.status(500).json({ error: "Fallo interno", detail: error.message });
  }
};
