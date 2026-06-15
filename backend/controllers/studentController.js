import { Curso, Docente, Aula, Seccion, Estudiante, Matricula } from '../models/Schemas.js';
import { GeneticEngine } from '../src/engine/genetic.js';

// Obtener detalles del estudiante por su código
export const getEstudiante = async (req, res) => {
  const { codigo } = req.params;
  try {
    const estudiante = await Estudiante.findOne({ codigo });
    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json(estudiante);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estudiante", detail: error.message });
  }
};

// Obtener todas las secciones de cursos con datos poblados de Curso, Docente y Aula
export const getSeccionesDisponibles = async (req, res) => {
  try {
    const secciones = await Seccion.find()
      .populate('curso')
      .populate('docente')
      .populate('aula')
      .lean();
    res.json(secciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener secciones", detail: error.message });
  }
};

// Obtener todos los estudiantes de prueba
export const getEstudiantesSimulacion = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find().sort({ codigo: 1 });
    res.json(estudiantes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estudiantes", detail: error.message });
  }
};

// ========================================================
// 1. PROCESAR MATRÍCULA MANUAL
// ========================================================
export const procesarMatricula = async (req, res) => {
  const { estudianteId, seccionIds, asistenciaHibrida, semana, tipoPeriodo, justificacionCargaMinima } = req.body;
  
  try {
    // 1. Cargar estudiante
    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado." });

    // 2. Control de Acceso y Adaptación Automática de Planes (RNF-05)
    if (!estudiante.planVigente) {
      console.log(`🔄 Adaptando automáticamente a ${estudiante.nombre} al plan vigente 'Plan 2018'`);
      estudiante.planEstudios = 'Plan 2018';
      estudiante.planVigente = true;
      await estudiante.save();
    }

    // 3. Validaciones administrativas (RNF-01)
    if (estudiante.tieneDeudas) {
      return res.status(403).json({ error: "Bloqueo Administrativo: El estudiante presenta deudas pendientes con la Universidad." });
    }
    if (!estudiante.tasaPagada) {
      return res.status(403).json({ error: "Bloqueo Administrativo: No se ha registrado el pago de la tasa educativa del ciclo." });
    }
    if (!estudiante.seguroVigente) {
      return res.status(403).json({ error: "Bloqueo Administrativo: El seguro universitario obligatorio no se encuentra vigente." });
    }

    // 4. Cargar secciones seleccionadas
    const secciones = await Seccion.find({ _id: { $in: seccionIds } }).populate('curso');
    if (secciones.length !== seccionIds.length) {
      return res.status(400).json({ error: "Una o más secciones seleccionadas no existen." });
    }

    // 5. Validaciones por rendimiento académico (RF-04)
    // Comprobar desaprobaciones históricas
    let tieneTerceraDesaprobacion = false;
    let cursoTercera = "";
    let tieneCuartaDesaprobacion = false;

    for (let [cursoCod, fails] of estudiante.historialDesaprobados.entries()) {
      if (fails >= 4) {
        tieneCuartaDesaprobacion = true;
      } else if (fails === 3) {
        tieneTerceraDesaprobacion = true;
        cursoTercera = cursoCod;
      }
    }

    // Bloqueo definitivo (4ta vez)
    if (tieneCuartaDesaprobacion) {
      return res.status(403).json({ error: "Bloqueo Académico: El estudiante ha sido separado definitivamente de la institución (4ta desaprobación)." });
    }

    // Bloqueo de curso único (3ra vez)
    if (tieneTerceraDesaprobacion) {
      // El alumno solo puede matricularse en esa asignatura
      const tieneCursosDistintos = secciones.some(s => s.curso.codigo !== cursoTercera);
      if (tieneCursosDistintos || secciones.length > 1) {
        return res.status(403).json({ error: `Bloqueo Académico: Alumno separado temporalmente (3ra desaprobación). Solo se le permite matricularse en el curso desaprobado: ${cursoTercera}` });
      }
    }

    // Lógica de créditos máximos por 2da desaprobación
    let tieneSegundaDesaprobacion = false;
    for (let [_, fails] of estudiante.historialDesaprobados.entries()) {
      if (fails === 2) tieneSegundaDesaprobacion = true;
    }

    const totalCreditos = secciones.reduce((acc, s) => acc + s.curso.creditos, 0);

    if (tieneSegundaDesaprobacion && totalCreditos > 16) {
      return res.status(403).json({ error: `Rendimiento Académico: Carga máxima bloqueada a 16 créditos por desaprobar una asignatura por segunda vez. (Créditos seleccionados: ${totalCreditos})` });
    }

    // 6. Validación de límites de creditaje ordinarios (RF-01)
    if (!tieneTerceraDesaprobacion) {
      // Máximo ordinario de 25 créditos
      if (totalCreditos > 25) {
        return res.status(400).json({ error: `Carga académica excedida: El límite máximo en periodos regulares es de 25 créditos. (Seleccionados: ${totalCreditos})` });
      }

      // Mínimo ordinario de 12 créditos, excepto egresantes justificados
      if (totalCreditos < 12 && !justificacionCargaMinima && estudiante.semestre < 10) {
        return res.status(400).json({ error: `Carga académica insuficiente: Se requiere una matrícula mínima de 12 créditos, a menos que justifique que es para culminar sus estudios.` });
      }
    }

    // 7. Validación de prerrequisitos (RF-02)
    for (let sec of secciones) {
      const curso = sec.curso;
      
      // Control de Prerrequisitos de la Malla
      for (let preCod of curso.prerrequisitos) {
        if (!estudiante.cursosAprobados.includes(preCod)) {
          return res.status(400).json({ 
            error: `Prerrequisito no cumplido: Para matricularse en "${curso.nombre}" (${curso.codigo}) debe haber aprobado previamente "${preCod}".` 
          });
        }
      }

      // Validación especial: Taller de Investigación 2 secuencial
      if (curso.codigo === "ASUCO1581") { // Taller de Investigación 2
        if (!estudiante.cursosAprobados.includes("ASUCO1580")) { // Taller de Investigación 1
          return res.status(400).json({ error: "Prerrequisito no cumplido: Taller de Investigación 2 requiere la aprobación continua de Taller de Investigación 1." });
        }
      }
    }

    // 8. Validación de ciclo de verano para Investigación (RNF-03)
    if (tipoPeriodo === 'Verano' || tipoPeriodo === 'Periodo 0') {
      const tieneInvestigacion = secciones.some(s => s.curso.codigo === "ASUCO1580" || s.curso.codigo === "ASUCO1581");
      if (tieneInvestigacion) {
        return res.status(400).json({ error: "Restricción de Ciclo: Las asignaturas de Taller de Investigación 1 y 2 no están disponibles para matrícula en ciclos de verano (Periodo 0)." });
      }
    }

    // 9. Validación de cruces de horarios de estudiante (RF-03)
    const ocupacionHoras = new Set();
    for (let sec of secciones) {
      for (let slot of sec.horario) {
        const clave = `${slot.dia}-${slot.franja}`;
        if (ocupacionHoras.has(clave)) {
          return res.status(400).json({ error: `Cruce de horarios: Conflicto detectado en el día y franja de la sección ${sec.codigo}.` });
        }
        ocupacionHoras.add(clave);
      }
    }

    // 10. Validación de vacantes y modalidades híbridas (RF-05)
    for (let sec of secciones) {
      if (sec.vacantesDisponibles <= 0) {
        return res.status(400).json({ error: `Vacantes agotadas: La sección "${sec.codigo}" no tiene vacantes disponibles.` });
      }

      // Si es híbrido, debe registrarse y bloquearse la forma de asistencia
      if (sec.curso.modalidad === 'Híbrido') {
        const asistencia = asistenciaHibrida?.[sec._id.toString()];
        if (!asistencia || (asistencia !== 'Física' && asistencia !== 'Remota')) {
          return res.status(400).json({ error: `Selección obligatoria: Debe definir la modalidad de asistencia (Física o Remota) para el curso híbrido "${sec.curso.nombre}".` });
        }
      }
    }

    // 11. Registrar Matrícula y deducir vacantes
    // Crear objeto asistencia hibrida limpio
    const asistenciaHibridaClean = {};
    secciones.forEach(sec => {
      if (sec.curso.modalidad === 'Híbrido') {
        asistenciaHibridaClean[sec._id.toString()] = asistenciaHibrida[sec._id.toString()];
      } else {
        asistenciaHibridaClean[sec._id.toString()] = 'No Aplica';
      }
    });

    const nuevaMatricula = new Matricula({
      estudiante: estudiante._id,
      secciones: secciones.map(s => s._id),
      asistenciaHibrida: asistenciaHibridaClean,
      semana: semana || 1
    });

    await nuevaMatricula.save();

    // Descontar vacantes atómicamente
    for (let sec of secciones) {
      await Seccion.findByIdAndUpdate(sec._id, { $inc: { vacantesDisponibles: -1 } });
    }

    // Actualizar estado del estudiante
    estudiante.estadoMatricula = 'Matriculado';
    await estudiante.save();

    console.log(`✅ Matrícula formalizada con éxito para ${estudiante.nombre}`);
    res.json({ success: true, matricula: nuevaMatricula, estudiante });

  } catch (error) {
    console.error("🔥 Error en procesarMatricula:", error.stack);
    res.status(500).json({ error: "Error en el servidor al formalizar la matrícula", detail: error.message });
  }
};

// ========================================================
// 2. ASISTENTE GENÉTICO DE AUTO-MATRÍCULA (ESTUDIANTE)
// ========================================================
export const autoMatricularAsistente = async (req, res) => {
  const { 
    estudianteId, 
    cursoIds, 
    trabaja, 
    diasLaborales, 
    franjaLaboralInicio, 
    franjaLaboralFin, 
    tiempoTraslado, 
    preferenciaTurno 
  } = req.body;

  try {
    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado." });

    const cursosDeseados = await Curso.find({ _id: { $in: cursoIds } });
    const seccionesDisponibles = await Seccion.find({ curso: { $in: cursoIds } }).populate('curso').lean();

    const preferencias = {
      trabaja: trabaja === true || trabaja === 'true',
      diasLaborales: Array.isArray(diasLaborales) ? diasLaborales.map(Number) : [],
      franjaLaboralInicio: Number(franjaLaboralInicio) || 0,
      franjaLaboralFin: Number(franjaLaboralFin) || 0,
      tiempoTraslado: Number(tiempoTraslado) || 0,
      preferenciaTurno: preferenciaTurno || 'Ninguno'
    };

    const motor = new GeneticEngine();
    let mejorIndividuo = null;
    let mejorFitness = -1;

    // Buscar combinación óptima de secciones
    for (let i = 0; i < 500; i++) {
      const candidato = motor.crearIndividuoAlumno(cursosDeseados, seccionesDisponibles);
      const fitness = motor.calcularFitnessAlumno(candidato, preferencias);

      if (fitness > mejorFitness) {
        mejorFitness = fitness;
        mejorIndividuo = { ...candidato, fitness };
      }
      if (fitness === 1) break; // Sin cruces y compacto
    }

    // Identificar cruces, calcular porcentaje de satisfacción y generar avisos detallados
    let satisfaccion = 100;
    const avisos = [];
    const crucesLaborales = [];

    if (mejorIndividuo && mejorIndividuo.genes) {
      // 1. Cruce laboral
      if (preferencias.trabaja && preferencias.diasLaborales.length > 0) {
        mejorIndividuo.genes.forEach(sec => {
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
            const nombreCurso = sec.curso?.nombre || "Asignatura";
            crucesLaborales.push(nombreCurso);
          }
        });

        if (crucesLaborales.length > 0) {
          if (crucesLaborales.length === 1) {
            satisfaccion -= 30;
            avisos.push(`El curso "${crucesLaborales[0]}" se cruza con tu horario laboral (sección asignada excepcionalmente).`);
          } else {
            satisfaccion -= 60;
            avisos.push(`Cruce múltiple con tu horario laboral en los cursos: ${crucesLaborales.join(', ')}.`);
          }
        }
      }

      // 2. Preferencia de Turno de Estudio
      if (preferencias.preferenciaTurno && preferencias.preferenciaTurno !== 'Ninguno') {
        const cursosFueraDeTurno = new Set();
        mejorIndividuo.genes.forEach(sec => {
          sec.horario.forEach(h => {
            let fueraDeTurno = false;
            if (preferencias.preferenciaTurno === 'Mañana' && h.franja > 3) fueraDeTurno = true;
            if (preferencias.preferenciaTurno === 'Tarde' && (h.franja < 4 || h.franja > 6)) fueraDeTurno = true;
            if (preferencias.preferenciaTurno === 'Noche' && h.franja < 7) fueraDeTurno = true;

            if (fueraDeTurno) {
              const nombreCurso = sec.curso?.nombre || "Asignatura";
              cursosFueraDeTurno.add(nombreCurso);
            }
          });
        });

        if (cursosFueraDeTurno.size > 0) {
          cursosFueraDeTurno.forEach(nombreCurso => {
            satisfaccion -= 10;
            avisos.push(`El curso "${nombreCurso}" no se pudo programar en el turno ${preferencias.preferenciaTurno} por disponibilidad.`);
          });
        }
      }

      // 3. Tiempo de Traslado a la U
      if (preferencias.tiempoTraslado && preferencias.tiempoTraslado > 60) {
        const diasConClase = new Set();
        mejorIndividuo.genes.forEach(sec => {
          sec.horario.forEach(h => {
            diasConClase.add(h.dia);
          });
        });
        if (diasConClase.size > 3) {
          satisfaccion -= 15;
          avisos.push(`Asistirás a la universidad ${diasConClase.size} días a la semana a pesar de tener un traslado largo (${preferencias.tiempoTraslado} min).`);
        }
      }

      // 4. Huecos o bloques libres en el horario
      let huecosHorarios = 0;
      const agendaEstudiante = new Map();
      mejorIndividuo.genes.forEach(sec => {
        sec.horario.forEach(h => {
          const claveHora = `${h.dia}-${h.franja}`;
          agendaEstudiante.set(claveHora, sec);
        });
      });

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

      if (huecosHorarios > 0) {
        satisfaccion -= huecosHorarios * 3;
        avisos.push(`El horario sugerido contiene ${huecosHorarios} hora(s) libre(s) (hueco) entre clases.`);
      }
    }

    satisfaccion = Math.max(0, Math.min(100, Math.round(satisfaccion)));

    res.json({
      success: true,
      fitness: mejorFitness,
      seccionesSugeridas: mejorIndividuo ? mejorIndividuo.genes : [],
      cruceLaboral: crucesLaborales.length > 0,
      crucesLaborales,
      satisfaccion,
      avisos
    });

  } catch (error) {
    console.error("🔥 Error en autoMatricularAsistente:", error.stack);
    res.status(500).json({ error: "Error al generar auto-matrícula", detail: error.message });
  }
};

// ========================================================
// 3. SOLICITUD DE ASIGNATURAS DIRIGIDAS (RF-06)
// ========================================================
export const solicitarAsignaturaDirigida = async (req, res) => {
  const { estudianteId, cursoId } = req.body;
  try {
    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado." });

    const curso = await Curso.findById(cursoId);
    if (!curso) return res.status(404).json({ error: "Curso no encontrado." });

    // Regla: No superar un total de 3 dirigidas históricas
    if (estudiante.cantidadDirigidos >= 3) {
      return res.status(400).json({ error: "Límite superado: Un estudiante no puede cursar más de tres (3) asignaturas dirigidas durante su permanencia." });
    }

    // Regla: Secuenciales (Taller de Investigación 1 y 2) no pueden ser dirigidas
    if (curso.codigo === "ASUCO1580" || curso.codigo === "ASUCO1581") {
      return res.status(400).json({ error: "Restricción: Las asignaturas de Taller de Investigación 1 y 2 no pueden ser cursadas de forma dirigida." });
    }

    // Regla: Impedir matrícula dirigida en asignaturas desaprobadas dos veces
    const desaprobaciones = estudiante.historialDesaprobados.get(curso.codigo) || 0;
    if (desaprobaciones >= 2) {
      return res.status(400).json({ error: `Restricción: No se permite solicitar bajo modalidad dirigida una asignatura que ha desaprobado dos o más veces (${curso.codigo}).` });
    }

    // Validar prerrequisitos ordinarios antes de habilitar dirigida
    for (let preCod of curso.prerrequisitos) {
      if (!estudiante.cursosAprobados.includes(preCod)) {
        return res.status(400).json({ error: `Prerrequisito no cumplido: Requiere aprobar previamente ${preCod}.` });
      }
    }

    // Aumentar contador de dirigidos y guardar
    estudiante.cantidadDirigidos += 1;
    await estudiante.save();

    console.log(`📝 Asignatura dirigida registrada: ${curso.nombre} para ${estudiante.nombre}`);
    res.json({
      success: true,
      mensaje: `Solicitud de asignatura dirigida aprobada con éxito para "${curso.nombre}".`,
      cantidadDirigidos: estudiante.cantidadDirigidos
    });

  } catch (error) {
    console.error("🔥 Error en solicitarAsignaturaDirigida:", error.stack);
    res.status(500).json({ error: "Error al solicitar asignatura dirigida", detail: error.message });
  }
};

// ========================================================
// 4. RETIROS Y RESERVAS DE MATRÍCULA (RF-07)
// ========================================================

// Retiro de curso
export const procesarRetiroCurso = async (req, res) => {
  const { matriculaId, seccionId, semanaSimulada } = req.body;
  try {
    const matricula = await Matricula.findById(matriculaId).populate('secciones');
    if (!matricula) return res.status(404).json({ error: "Matrícula no encontrada." });

    const seccion = await Seccion.findById(seccionId).populate('curso');
    if (!seccion) return res.status(404).json({ error: "Sección no encontrada." });

    // Regla: Retiro permitido hasta la semana 14 (presencial) o semana 7 (bloques semipresenciales/distancia)
    const modalidad = seccion.curso.modalidad;
    let limiteSemanas = 14; // Presencial
    if (modalidad === 'Semipresencial' || modalidad === 'Distancia') {
      limiteSemanas = 7;
    }

    if (semanaSimulada > limiteSemanas) {
      return res.status(400).json({ 
        error: `Plazo vencido: El retiro para cursos de modalidad ${modalidad} está permitido únicamente hasta la semana ${limiteSemanas}. (Semana actual: ${semanaSimulada})` 
      });
    }

    // Remover la sección de la matrícula
    matricula.secciones = matricula.secciones.filter(s => s._id.toString() !== seccionId);
    await matricula.save();

    // Devolver vacante
    await Seccion.findByIdAndUpdate(seccionId, { $inc: { vacantesDisponibles: 1 } });

    console.log(`🗑️ Retiro procesado para el curso ${seccion.curso.nombre}`);
    res.json({ success: true, mensaje: `Retiro del curso "${seccion.curso.nombre}" procesado correctamente. Vacante devuelta.` });

  } catch (error) {
    console.error("🔥 Error en procesarRetiroCurso:", error.stack);
    res.status(500).json({ error: "Error al procesar el retiro", detail: error.message });
  }
};

// Reserva de matrícula
export const procesarReservaMatricula = async (req, res) => {
  const { estudianteId, semanaSimulada } = req.body;
  try {
    const estudiante = await Estudiante.findById(estudianteId);
    if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado." });

    // Regla: Permitir reserva hasta la segunda semana de clases
    if (semanaSimulada > 2) {
      return res.status(400).json({ 
        error: `Plazo vencido: La reserva de matrícula completa solo se puede realizar hasta la segunda semana de clases. (Semana actual: ${semanaSimulada})` 
      });
    }

    // Buscar y eliminar matrícula activa del ciclo si existiera
    const matriculaActiva = await Matricula.findOne({ estudiante: estudianteId });
    if (matriculaActiva) {
      // Devolver vacantes
      for (let secId of matriculaActiva.secciones) {
        await Seccion.findByIdAndUpdate(secId, { $inc: { vacantesDisponibles: 1 } });
      }
      await Matricula.findByIdAndDelete(matriculaActiva._id);
    }

    // Colocar estado de estudiante a Reservado y actualizar vigencia del plan a inactivo (simulación)
    estudiante.estadoMatricula = 'Reservado';
    estudiante.planVigente = false; // Al retornar del semestre de reserva se deberá adecuar al plan vigente
    await estudiante.save();

    console.log(`📅 Reserva de matrícula registrada para ${estudiante.nombre}`);
    res.json({ 
      success: true, 
      mensaje: "Reserva de matrícula formalizada con éxito. Su plan de estudios ha quedado inactivo y se actualizará a su retorno.",
      estudiante
    });

  } catch (error) {
    console.error("🔥 Error en procesarReservaMatricula:", error.stack);
    res.status(500).json({ error: "Error al procesar reserva", detail: error.message });
  }
};
