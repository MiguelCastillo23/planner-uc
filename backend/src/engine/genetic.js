export class GeneticEngine {
  constructor() {
    this.aulas = ['A101', 'B202', 'J205', 'M202', 'L105', 'K302']; // Más aulas para evitar choques
  }

  crearIndividuo(cursosSeleccionados = []) {
    try {
      let horario = [];
      const docenteMock = "Docente Principal";

      cursosSeleccionados.forEach(curso => {
        const aulaAleatoria = this.aulas[Math.floor(Math.random() * this.aulas.length)];

        if (curso.creditos === 3) {
          // REGLA: 2 bloques SEGUIDOS el mismo día (3h)
          const dia = Math.floor(Math.random() * 6);
          const franjaInicio = Math.floor(Math.random() * 8); // Máximo 8 para que +1 no sea > 9
          
          for (let i = 0; i < 2; i++) {
            horario.push({ ...curso, dia, franja: franjaInicio + i, aula: aulaAleatoria, docente: docenteMock });
          }
        } 
        else {
          // REGLA: 4 créditos o más -> 2 bloques seguidos (3h) + 1 bloque (1.5h) otro día
          const diaPrincipal = Math.floor(Math.random() * 6);
          const franjaInicio = Math.floor(Math.random() * 8);
          
          // Bloque de 3h
          for (let i = 0; i < 2; i++) {
            horario.push({ ...curso, dia: diaPrincipal, franja: franjaInicio + i, aula: aulaAleatoria, docente: docenteMock });
          }
          
          // Bloque de 1.5h otro día
          let diaSecundario;
          do { diaSecundario = Math.floor(Math.random() * 6); } while (diaSecundario === diaPrincipal);
          horario.push({ ...curso, dia: diaSecundario, franja: Math.floor(Math.random() * 9), aula: aulaAleatoria, docente: docenteMock });
        }
      });

      return { genes: horario };
    } catch (err) {
      console.error("❌ Error en crearIndividuo:", err);
      throw err;
    }
  }

  calcularFitness(individuo) {
    try {
      let conflictos = 0;
      const ocupacion = new Set();

      individuo.genes.forEach(g => {
        const clave = `${g.dia}-${g.franja}-${g.aula}`;
        if (ocupacion.has(clave)) conflictos++;
        ocupacion.add(clave);
        
        if (g.franja < 0 || g.franja > 8) conflictos += 5;
      });

      return 1 / (1 + conflictos);
    } catch (err) {
      console.error("❌ Error en calcularFitness:", err);
      return 0;
    }
  }
}
