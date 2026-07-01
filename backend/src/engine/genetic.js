export class GeneticEngine {
  constructor() {
    this.aulas = ['A101', 'B202', 'J205', 'M202', 'L105', 'K302']; // Aulas del motor original
    this.diasSemana = [0, 1, 2, 3, 4, 5]; // 0: Lunes, 5: Sábado
    this.totalFranjas = 9; // 0 a 8
  }

  // ==========================================
  // COMPATIBILIDAD CON PRUEBAS ORIGINALES (JEST)
  // ==========================================
  
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

  // ==========================================
  // 1. MOTOR GENÉTICO GLOBAL (ADMINISTRATIVO)
  // ==========================================
  
  generarProgramacionGlobal(cursos = [], docentes = [], aulas = []) {
    try {
      const asignaciones = [];

      cursos.forEach(curso => {
        // Encontrar docentes aptos para el curso
        let docentesAptos = docentes.filter(d => d.especialidad.includes(curso.codigo));
        if (docentesAptos.length === 0) docentesAptos = [docentes[Math.floor(Math.random() * docentes.length)]];

        // Crear 3 secciones por curso
        for (let secNum = 1; secNum <= 3; secNum++) {
          const docente = docentesAptos[(secNum - 1) % docentesAptos.length];
          const aula = aulas[Math.floor(Math.random() * aulas.length)];
          const codigoSeccion = `${curso.codigo}-SEC0${secNum}`;

          // Definir días y franjas
          const diaPrincipal = Math.floor(Math.random() * 6);
          const franjaInicio = Math.floor(Math.random() * 8); // Máximo 8 para que +1 sea < 9

          const horario = [];
          if (curso.creditos === 3) {
            // 2 bloques seguidos el mismo día (3 horas)
            horario.push({ dia: diaPrincipal, franja: franjaInicio });
            horario.push({ dia: diaPrincipal, franja: franjaInicio + 1 });
          } else if (curso.creditos >= 4) {
            // 2 bloques seguidos + 1 bloque otro día
            horario.push({ dia: diaPrincipal, franja: franjaInicio });
            horario.push({ dia: diaPrincipal, franja: franjaInicio + 1 });

            let diaSecundario;
            do {
              diaSecundario = Math.floor(Math.random() * 6);
            } while (diaSecundario === diaPrincipal);
            horario.push({ dia: diaSecundario, franja: Math.floor(Math.random() * 9) });
          } else {
            // 1 o 2 créditos: 1 bloque
            horario.push({ dia: diaPrincipal, franja: franjaInicio });
          }

          asignaciones.push({
            codigo: codigoSeccion,
            curso: curso._id,
            cursoCodigo: curso.codigo,
            cursoNombre: curso.nombre,
            docente: docente._id,
            docenteNombre: docente.nombre,
            aula: aula._id,
            aulaNombre: aula.nombre,
            horario,
            vacantesTotales: aula.capacidad || 25,
            vacantesDisponibles: aula.capacidad || 25
          });
        }
      });

      return { genes: asignaciones };
    } catch (err) {
      console.error("❌ Error en generarProgramacionGlobal:", err);
      throw err;
    }
  }

  calcularFitnessGlobal(individuo) {
    try {
      let conflictos = 0;
      const ocupacionAula = new Set();
      const ocupacionDocente = new Set();

      individuo.genes.forEach(sec => {
        sec.horario.forEach(h => {
          // Conflicto de aula en el mismo horario
          const claveAula = `${h.dia}-${h.franja}-${sec.aula}`;
          if (ocupacionAula.has(claveAula)) conflictos++;
          ocupacionAula.add(claveAula);

          // Conflicto de docente dictando dos clases a la vez
          const claveDocente = `${h.dia}-${h.franja}-${sec.docente}`;
          if (ocupacionDocente.has(claveDocente)) conflictos++;
          ocupacionDocente.add(claveDocente);

          // Penalizar franjas fuera de rango
          if (h.franja < 0 || h.franja > 8) conflictos += 5;
        });
      });

      return 1 / (1 + conflictos);
    } catch (err) {
      console.error("❌ Error en calcularFitnessGlobal:", err);
      return 0;
    }
  }

  // ==========================================
  // 2. MOTOR GENÉTICO DEL ALUMNO (ASISTENTE)
  // ==========================================
  
  crearIndividuoAlumno(cursosSeleccionados = [], seccionesDisponibles = []) {
    try {
      const genes = [];

      cursosSeleccionados.forEach(curso => {
        const seccionesCurso = seccionesDisponibles.filter(sec => 
          sec.curso._id?.toString() === curso._id?.toString() || 
          sec.curso?.toString() === curso._id?.toString()
        );

        if (seccionesCurso.length > 0) {
          const seccionElegida = seccionesCurso[Math.floor(Math.random() * seccionesCurso.length)];
          genes.push(seccionElegida);
        }
      });

      return { genes };
    } catch (err) {
      console.error("❌ Error en crearIndividuoAlumno:", err);
      throw err;
    }
  }

  calcularFitnessAlumno(individuo, preferencias = {}) {
    try {
      let conflictos = 0;
      let huecosHorarios = 0;
      const agendaEstudiante = new Map();

      // 1. Conflictos de Horario Académico (Cruces de clases)
      individuo.genes.forEach(sec => {
        sec.horario.forEach(h => {
          const claveHora = `${h.dia}-${h.franja}`;
          if (agendaEstudiante.has(claveHora)) {
            conflictos += 15; // Cruce duro entre asignaturas
          }
          agendaEstudiante.set(claveHora, sec);
        });
      });

      // 2. Evaluar Cruce con Horario Laboral (OWASP A1/Rúbrica)
      if (preferencias.trabaja && preferencias.diasLaborales && preferencias.diasLaborales.length > 0) {
        let crucesLaborales = 0;
        individuo.genes.forEach(sec => {
          let cursoCruza = false;
          sec.horario.forEach(h => {
            const diaNum = Number(h.dia);
            if (preferencias.diasLaborales.includes(diaNum)) {
              if (h.franja >= preferencias.franjaLaboralInicio && h.franja <= preferencias.franjaLaboralFin) {
                cursoCruza = true;
              }
            }
          });
          if (cursoCruza) {
            crucesLaborales++;
          }
        });

        // Penalización: Si hay más de un (1) curso cruzado con el trabajo -> no apto (penalización severa)
        if (crucesLaborales > 1) {
          conflictos += 100;
        } 
        // Si hay exactamente uno (1), se permite pero se penaliza (por si no queda otra opción)
        else if (crucesLaborales === 1) {
          conflictos += 10;
        }
      }

      // 3. Evaluar Preferencia de Turno (Mañana/Tarde/Noche)
      if (preferencias.preferenciaTurno && preferencias.preferenciaTurno !== 'Ninguno') {
        individuo.genes.forEach(sec => {
          sec.horario.forEach(h => {
            let fueraDeTurno = false;
            if (preferencias.preferenciaTurno === 'Mañana' && h.franja > 3) fueraDeTurno = true;
            if (preferencias.preferenciaTurno === 'Tarde' && (h.franja < 4 || h.franja > 6)) fueraDeTurno = true;
            if (preferencias.preferenciaTurno === 'Noche' && h.franja < 7) fueraDeTurno = true;

            if (fueraDeTurno) {
              conflictos += 0.5; // Penalización leve por franja fuera de la preferencia
            }
          });
        });
      }

      // 4. Evaluar Tiempo de Traslado (Promover días compactos si es largo)
      if (preferencias.tiempoTraslado && preferencias.tiempoTraslado > 60) {
        const diasConClase = new Set();
        individuo.genes.forEach(sec => {
          sec.horario.forEach(h => {
            diasConClase.add(h.dia);
          });
        });
        // Si viaja más de 60 minutos, penalizar que tenga que ir a la universidad más de 3 días a la semana
        if (diasConClase.size > 3) {
          conflictos += (diasConClase.size - 3) * 2.5;
        }
      }

      // 5. Espacios vacíos (Huecos) en el horario
      const franjasPorDia = {};
      for (const [clave] of agendaEstudiante) {
        const [dia, franja] = clave.split('-').map(Number);
        if (!franjasPorDia[dia]) franjasPorDia[dia] = [];
        franjasPorDia[dia].push(franja);
      }

      Object.keys(franjasPorDia).forEach(dia => {
        const slots = franjasPorDia[dia].sort((a, b) => a - b);
        if (slots.length > 1) {
          for (let idx = 0; idx < slots.length - 1; idx++) {
            const dif = slots[idx + 1] - slots[idx];
            if (dif > 1) {
              huecosHorarios += (dif - 1);
            }
          }
        }
      });

      return 1 / (1 + conflictos + (huecosHorarios * 0.1));
    } catch (err) {
      console.error("❌ Error en calcularFitnessAlumno:", err);
      return 0;
    }
  }
}
