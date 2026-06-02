import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Curso, Docente, Aula, Seccion, Estudiante, Matricula, Horario } from './models/Schemas.js';

dotenv.config();

const cursosSistemas = [
  // Semestre 1
  { nombre: "Matemática Superior", codigo: "ASUCO1113", creditos: 5, semestre: 1, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Habilidades Comunicativas", codigo: "ASUCO1083", creditos: 4, semestre: 1, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Gestión del Aprendizaje", codigo: "ASUCO1082", creditos: 3, semestre: 1, prerrequisitos: [], modalidad: "Híbrido" },
  { nombre: "Introducción a la Ing. de Sistemas e Inf.", codigo: "ASUCO0512", creditos: 3, semestre: 1, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Química 1", codigo: "ASUCO1117", creditos: 3, semestre: 1, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Laboratorio de Liderazgo", codigo: "ASUCO1086", creditos: 2, semestre: 1, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Herramientas Virtuales para el Aprendizaje", codigo: "ASUCO1700", creditos: 1, semestre: 1, prerrequisitos: [], modalidad: "Distancia" },

  // Semestre 2
  { nombre: "Álgebra Matricial y Geometría Analítica", codigo: "ASUCO1108", creditos: 4, semestre: 2, prerrequisitos: ["ASUCO1113"], modalidad: "Presencial" },
  { nombre: "Fundamentos del Cálculo", codigo: "ASUCO1110", creditos: 4, semestre: 2, prerrequisitos: ["ASUCO1113"], modalidad: "Presencial" },
  { nombre: "Matemática Discreta", codigo: "ASUCO0562", creditos: 4, semestre: 2, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 20 créditos (se valida en controller)
  { nombre: "Comunicación Efectiva", codigo: "ASUCO1075", creditos: 3, semestre: 2, prerrequisitos: ["ASUCO1083"], modalidad: "Presencial" },
  { nombre: "Ética, Ciudadanía y Globalización", codigo: "ASUCO1079", creditos: 3, semestre: 2, prerrequisitos: [], modalidad: "Híbrido" },
  { nombre: "Gestión Basada en Procesos", codigo: "ASUCO1112", creditos: 3, semestre: 2, prerrequisitos: [], modalidad: "Semipresencial" },

  // Semestre 3
  { nombre: "Cálculo Diferencial", codigo: "ASUCO1160", creditos: 5, semestre: 3, prerrequisitos: ["ASUCO1108"], modalidad: "Presencial" },
  { nombre: "Física 1", codigo: "ASUCO1296", creditos: 4, semestre: 3, prerrequisitos: ["ASUCO1110"], modalidad: "Presencial" },
  { nombre: "Fundamentos de Programación", codigo: "ASUCO1312", creditos: 4, semestre: 3, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 30 créditos
  { nombre: "Sistemas de Información", codigo: "ASUCO0798", creditos: 4, semestre: 3, prerrequisitos: ["ASUCO1112"], modalidad: "Presencial" },
  { nombre: "Estadística General", codigo: "ASUCO1275", creditos: 3, semestre: 3, prerrequisitos: ["ASUCO1110"], modalidad: "Presencial" },
  { nombre: "Laboratorio de Innovación", codigo: "ASUCO1389", creditos: 1, semestre: 3, prerrequisitos: ["ASUCO1086"], modalidad: "Presencial" },

  // Semestre 4
  { nombre: "Cálculo Integral", codigo: "ASUCO1161", creditos: 5, semestre: 4, prerrequisitos: ["ASUCO1160"], modalidad: "Presencial" },
  { nombre: "Física 2", codigo: "ASUCO1297", creditos: 4, semestre: 4, prerrequisitos: ["ASUCO1296"], modalidad: "Presencial" },
  { nombre: "Programación Orientada a Objetos", codigo: "ASUCO1482", creditos: 4, semestre: 4, prerrequisitos: ["ASUCO1312"], modalidad: "Presencial" },
  { nombre: "Comunicación y Argumentación", codigo: "ASUCO1183", creditos: 3, semestre: 4, prerrequisitos: ["ASUCO1075"], modalidad: "Presencial" },
  { nombre: "Estadística Aplicada", codigo: "ASUCO1273", creditos: 3, semestre: 4, prerrequisitos: ["ASUCO1275"], modalidad: "Presencial" },
  { nombre: "Estructura de Datos", codigo: "ASUCO0316", creditos: 3, semestre: 4, prerrequisitos: ["ASUCO1312"], modalidad: "Presencial" },

  // Semestre 5
  { nombre: "Ecuaciones Diferenciales", codigo: "ASUCO1255", creditos: 5, semestre: 5, prerrequisitos: ["ASUCO1161"], modalidad: "Presencial" },
  { nombre: "Análisis y Requerimientos de Software", codigo: "ASUCO1136", creditos: 4, semestre: 5, prerrequisitos: ["ASUCO0798"], modalidad: "Presencial" },
  { nombre: "Base de Datos", codigo: "ASUCO0051", creditos: 4, semestre: 5, prerrequisitos: ["ASUCO0316"], modalidad: "Presencial" },
  { nombre: "Sistemas Digitales", codigo: "ASUCO1541", creditos: 4, semestre: 5, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 60 créditos
  { nombre: "Medio Ambiente y Ecología", codigo: "ASUCO1658", creditos: 3, semestre: 5, prerrequisitos: ["ASUCO1079"], modalidad: "Distancia" },
  { nombre: "Laboratorio Avanzado de Innovación", codigo: "ASUCO1388", creditos: 1, semestre: 5, prerrequisitos: ["ASUCO1389"], modalidad: "Presencial" },

  // Semestre 6
  { nombre: "Arquitectura del Computador", codigo: "ASUCO1140", creditos: 4, semestre: 6, prerrequisitos: ["ASUCO1541"], modalidad: "Presencial" },
  { nombre: "Diseño de Software", codigo: "ASUCO0957", creditos: 4, semestre: 6, prerrequisitos: ["ASUCO1136"], modalidad: "Presencial" },
  { nombre: "Investigación Operativa", codigo: "ASUCO1386", creditos: 4, semestre: 6, prerrequisitos: ["ASUCO1273"], modalidad: "Presencial" },
  { nombre: "Administración de Base de Datos", codigo: "ASUCO0006", creditos: 3, semestre: 6, prerrequisitos: ["ASUCO0051"], modalidad: "Presencial" },
  { nombre: "Seminario de Investigación", codigo: "ASUCO1532", creditos: 3, semestre: 6, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 80 créditos
  { nombre: "Sistemas Operativos", codigo: "ASUCO1061", creditos: 3, semestre: 6, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 80 créditos

  // Semestre 7
  { nombre: "Arquitectura Empresarial", codigo: "ASUCO1141", creditos: 5, semestre: 7, prerrequisitos: ["ASUCO0051"], modalidad: "Presencial" },
  { nombre: "Construcción de Software", codigo: "ASUCO0947", creditos: 5, semestre: 7, prerrequisitos: ["ASUCO0957", "ASUCO1482"], modalidad: "Presencial" },
  { nombre: "Redes de Computadores", codigo: "ASUCO0754", creditos: 4, semestre: 7, prerrequisitos: ["ASUCO1140"], modalidad: "Presencial" },
  { nombre: "Ingeniería Económica", codigo: "ASUCO0466", creditos: 3, semestre: 7, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 100 créditos
  { nombre: "Innovación Social", codigo: "ASUCO1365", creditos: 2, semestre: 7, prerrequisitos: ["ASUCO1388"], modalidad: "Presencial" },
  { nombre: "Gestión Profesional", codigo: "ASUCO1341", creditos: 1, semestre: 7, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 100 créditos

  // Semestre 8
  { nombre: "Conmutación y Enrutamiento", codigo: "ASUCO0123", creditos: 4, semestre: 8, prerrequisitos: ["ASUCO0754"], modalidad: "Presencial" },
  { nombre: "Dirección de Proyectos", codigo: "ASUCO1235", creditos: 4, semestre: 8, prerrequisitos: [], modalidad: "Híbrido" }, // Requiere 120 créditos
  { nombre: "Pruebas y Calidad de Software", codigo: "ASUCO1006", creditos: 4, semestre: 8, prerrequisitos: ["ASUCO0947"], modalidad: "Presencial" },
  { nombre: "Simulación", codigo: "ASUCO1534", creditos: 4, semestre: 8, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 120 créditos
  { nombre: "Conversation Class", codigo: "ASUCO1203", creditos: 3, semestre: 8, prerrequisitos: [], modalidad: "Presencial" },
  { nombre: "Supervisión Prácticas Preprofesionales", codigo: "ASUCO1545", creditos: 1, semestre: 8, prerrequisitos: ["ASUCO1341"], modalidad: "Presencial" },

  // Semestre 9
  { nombre: "Desarrollo de Aplicaciones Móviles", codigo: "ASUCO1228", creditos: 4, semestre: 9, prerrequisitos: [], modalidad: "Híbrido" }, // Requiere 140 créditos
  { nombre: "Ingeniería Web", codigo: "ASUCO0469", creditos: 4, semestre: 9, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 140 créditos
  { nombre: "Taller de Investigación 1", codigo: "ASUCO1580", creditos: 4, semestre: 9, prerrequisitos: ["ASUCO1532"], modalidad: "Presencial" }, // Requiere 140 créditos
  { nombre: "Taller de Proyectos 1", codigo: "ASUCO1584", creditos: 4, semestre: 9, prerrequisitos: ["ASUCO1006", "ASUCO1235"], modalidad: "Presencial" },
  { nombre: "Gestión de Servicios TI", codigo: "ASUCO0413", creditos: 3, semestre: 9, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 140 créditos
  { nombre: "Metodologías Ágiles de Desarrollo", codigo: "ASUCO0587", creditos: 3, semestre: 9, prerrequisitos: [], modalidad: "Híbrido" }, // Requiere 140 créditos

  // Semestre 10
  { nombre: "Auditoría de Sistemas", codigo: "ASUCO0941", creditos: 4, semestre: 10, prerrequisitos: [], modalidad: "Presencial" }, // Requiere 160 créditos
  { nombre: "Taller de Investigación 2", codigo: "ASUCO1581", creditos: 4, semestre: 10, prerrequisitos: ["ASUCO1580"], modalidad: "Presencial" },
  { nombre: "Taller de Proyectos 2", codigo: "ASUCO1585", creditos: 4, semestre: 10, prerrequisitos: ["ASUCO1584"], modalidad: "Presencial" },
  { nombre: "Cloud Computing", codigo: "ASUCO0097", creditos: 3, semestre: 10, prerrequisitos: ["ASUCO0469"], modalidad: "Híbrido" },
  { nombre: "Inteligencia de Negocios", codigo: "ASUCO0490", creditos: 3, semestre: 10, prerrequisitos: ["ASUCO0006"], modalidad: "Presencial" },
  { nombre: "Arquitectura Orientada a Servicios", codigo: "ASUCO0940", creditos: 3, semestre: 10, prerrequisitos: [], modalidad: "Presencial" } // Requiere 140 créditos
];

const docentesSeed = [
  { nombre: "Dra. María Gonzales", especialidad: ["ASUCO1113", "ASUCO1108", "ASUCO1110", "ASUCO1160", "ASUCO1161", "ASUCO1255"] },
  { nombre: "Mg. Carlos Mendoza", especialidad: ["ASUCO1296", "ASUCO1297", "ASUCO1541", "ASUCO1140"] },
  { nombre: "Ing. Alan Turing", especialidad: ["ASUCO1312", "ASUCO1482", "ASUCO0316", "ASUCO0469", "ASUCO1228"] },
  { nombre: "Dra. Grace Hopper", especialidad: ["ASUCO0051", "ASUCO0006", "ASUCO0798", "ASUCO1141"] },
  { nombre: "Dr. Richard Stallman", especialidad: ["ASUCO1061", "ASUCO0941", "ASUCO0097"] },
  { nombre: "Ing. Tim Berners-Lee", especialidad: ["ASUCO0754", "ASUCO0123", "ASUCO0940"] },
  { nombre: "Mg. Ada Lovelace", especialidad: ["ASUCO1136", "ASUCO0957", "ASUCO0947", "ASUCO1006"] },
  { nombre: "Dr. Donald Knuth", especialidad: ["ASUCO1386", "ASUCO1532", "ASUCO1534", "ASUCO1580", "ASUCO1581", "ASUCO1584", "ASUCO1585"] },
  { nombre: "Lic. Carmen Silva", especialidad: ["ASUCO1083", "ASUCO1075", "ASUCO1183", "ASUCO1203"] },
  { nombre: "Dr. Roberto Díaz", especialidad: ["ASUCO1082", "ASUCO1086", "ASUCO1389", "ASUCO1388", "ASUCO1365", "ASUCO1341"] },
  { nombre: "Ing. Enrique Vives", especialidad: ["ASUCO1700", "ASUCO1117", "ASUCO1079", "ASUCO1112", "ASUCO1275", "ASUCO1273", "ASUCO1658", "ASUCO0466", "ASUCO1235", "ASUCO1545", "ASUCO0413", "ASUCO0587", "ASUCO0490"] }
];

const aulasSeed = [
  { nombre: "Aula A101", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula A102", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula A103", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula B202", capacidad: 25, tipo: "Teoría" },
  { nombre: "Aula B203", capacidad: 25, tipo: "Teoría" },
  { nombre: "Aula B204", capacidad: 25, tipo: "Teoría" },
  { nombre: "Aula J205", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula J206", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula J207", capacidad: 30, tipo: "Teoría" },
  { nombre: "Aula M202", capacidad: 25, tipo: "Teoría" },
  { nombre: "Aula M203", capacidad: 25, tipo: "Teoría" },
  { nombre: "Aula M204", capacidad: 25, tipo: "Teoría" },
  { nombre: "Lab L105", capacidad: 15, tipo: "Laboratorio" },
  { nombre: "Lab L106", capacidad: 15, tipo: "Laboratorio" },
  { nombre: "Lab K302", capacidad: 20, tipo: "Laboratorio" },
  { nombre: "Lab K303", capacidad: 20, tipo: "Laboratorio" },
  { nombre: "Aula Virtual", capacidad: 100, tipo: "Teoría" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔗 Conectado a MongoDB Atlas para siembra v2.0.0...");

    // Limpiar base de datos
    await Curso.deleteMany({});
    await Docente.deleteMany({});
    await Aula.deleteMany({});
    await Seccion.deleteMany({});
    await Estudiante.deleteMany({});
    await Matricula.deleteMany({});
    await Horario.deleteMany({});
    console.log("🧹 Base de datos limpiada");

    // Insertar Cursos, Docentes y Aulas
    const cursosDB = await Curso.insertMany(cursosSistemas);
    console.log(`✅ Cursos sembrados: ${cursosDB.length}`);

    // Completar disponibilidad docente aleatoria
    const docentesConDisponibilidad = docentesSeed.map(d => {
      const disponibilidad = [];
      for (let diaIdx = 0; diaIdx < 6; diaIdx++) {
        // Asignar unas 4 franjas aleatorias libres al día
        const franjas = [];
        while (franjas.length < 5) {
          const f = Math.floor(Math.random() * 9);
          if (!franjas.includes(f)) franjas.push(f);
        }
        disponibilidad.push({ dia: diaIdx.toString(), franja: franjas.sort() });
      }
      return { ...d, disponibilidad };
    });
    const docentesDB = await Docente.insertMany(docentesConDisponibilidad);
    console.log(`✅ Docentes sembrados: ${docentesDB.length}`);

    const aulasDB = await Aula.insertMany(aulasSeed);
    console.log(`✅ Aulas sembradas: ${aulasDB.length}`);

    // Generar 3 secciones para cada curso de forma determinista para evitar solapamientos inmediatos
    let seccionCount = 0;
    const seccionesToInsert = [];

    for (let cIndex = 0; cIndex < cursosDB.length; cIndex++) {
      const curso = cursosDB[cIndex];

      // Encontrar docentes aptos para el curso
      let docentesAptos = docentesDB.filter(d => d.especialidad.includes(curso.codigo));
      if (docentesAptos.length === 0) {
        // Backup: cualquier docente
        docentesAptos = [docentesDB[cIndex % docentesDB.length]];
      }

      for (let s = 1; s <= 3; s++) {
        const docente = docentesAptos[(s - 1) % docentesAptos.length];
        const aula = aulasDB[(cIndex + s) % aulasDB.length];
        const codigoSeccion = `${curso.codigo}-SEC0${s}`;

        // Distribuir los horarios de las 3 secciones en días distintos
        // Para simplificar, asignaremos horarios fijos basados en el índice del curso y la sección
        const dia1 = (cIndex + s) % 6;
        let dia2 = (dia1 + 2) % 6;
        if (dia2 === dia1) dia2 = (dia1 + 1) % 6;

        const franjaBase = (cIndex * 2 + s) % 8; // Asegurar distribución en distintas franjas

        const horario = [];
        if (curso.creditos === 3) {
          // 2 bloques seguidos el mismo día
          horario.push({ dia: dia1, franja: franjaBase });
          horario.push({ dia: dia1, franja: franjaBase + 1 });
        } else if (curso.creditos >= 4) {
          // 2 bloques seguidos + 1 bloque otro día
          horario.push({ dia: dia1, franja: franjaBase });
          horario.push({ dia: dia1, franja: franjaBase + 1 });
          horario.push({ dia: dia2, franja: (franjaBase + 3) % 9 });
        } else {
          // 1 o 2 créditos: 1 bloque o 2 bloques sencillos
          horario.push({ dia: dia1, franja: franjaBase });
        }

        seccionesToInsert.push({
          codigo: codigoSeccion,
          curso: curso._id,
          docente: docente._id,
          aula: aula._id,
          horario,
          vacantesTotales: aula.capacidad || 25,
          vacantesDisponibles: aula.capacidad || 25
        });
        seccionCount++;
      }
    }

    await Seccion.insertMany(seccionesToInsert);
    console.log(`✅ Secciones programadas y publicadas: ${seccionCount}`);

    // Sembrar Estudiantes de Prueba
    const estudiantesSeed = [
      {
        nombre: "Pedro Gómez (Regular)",
        codigo: "EST001",
        semestre: 5,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: [
          // Semestre 1 aprobados
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700",
          // Semestre 2 aprobados
          "ASUCO1108", "ASUCO1110", "ASUCO0562", "ASUCO1075", "ASUCO1079", "ASUCO1112",
          // Semestre 3 aprobados
          "ASUCO1160", "ASUCO1296", "ASUCO1312", "ASUCO0798", "ASUCO1275", "ASUCO1389",
          // Semestre 4 aprobados
          "ASUCO1161", "ASUCO1297", "ASUCO1183", "ASUCO1273", "ASUCO0316"
          // NOTA: No aprobó POO (ASUCO1482) para simular que puede llevarla en 5to semestre
        ],
        historialDesaprobados: {},
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "Ana Rojas (Deudor Administrativo)",
        codigo: "EST002",
        semestre: 3,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: true, // Bloqueo financiero
        tasaPagada: false,
        seguroVigente: false,
        cursosAprobados: [
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700"
        ],
        historialDesaprobados: {},
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "José Pérez (Repitente 2da vez)",
        codigo: "EST003",
        semestre: 5,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: [
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700",
          "ASUCO1108", "ASUCO1110", "ASUCO0562", "ASUCO1075", "ASUCO1079", "ASUCO1112"
        ],
        historialDesaprobados: { "ASUCO1482": 2 }, // Desaprobó POO 2 veces (Carga máx: 16 créditos)
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "María Torres (Separado Temporal - 3ra desaprobación)",
        codigo: "EST004",
        semestre: 6,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: [
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700",
          "ASUCO1108", "ASUCO1110", "ASUCO0562", "ASUCO1075", "ASUCO1079", "ASUCO1112",
          "ASUCO1160", "ASUCO1296", "ASUCO1312", "ASUCO0798", "ASUCO1275", "ASUCO1389"
        ],
        historialDesaprobados: { "ASUCO0051": 3 }, // Desaprobó Base de Datos 3 veces. Solo se puede matricular en Base de Datos.
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "Luis Soto (Retirado Definitivo)",
        codigo: "EST005",
        semestre: 3,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: ["ASUCO1083", "ASUCO1082", "ASUCO1086", "ASUCO1700"],
        historialDesaprobados: { "ASUCO1110": 4 }, // Desaprobó Fundamentos del Cálculo 4 veces. Bloqueo total.
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "Clara Benítez (Egresante)",
        codigo: "EST006",
        semestre: 10,
        planEstudios: "Plan 2018",
        planVigente: true,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: [
          // Aprobó absolutamente todo de 1° a 9° semestre excepto Taller de Investigación 2 y Taller de Proyectos 2
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700",
          "ASUCO1108", "ASUCO1110", "ASUCO0562", "ASUCO1075", "ASUCO1079", "ASUCO1112",
          "ASUCO1160", "ASUCO1296", "ASUCO1312", "ASUCO0798", "ASUCO1275", "ASUCO1389",
          "ASUCO1161", "ASUCO1297", "ASUCO1482", "ASUCO1183", "ASUCO1273", "ASUCO0316",
          "ASUCO1255", "ASUCO1136", "ASUCO0051", "ASUCO1541", "ASUCO1658", "ASUCO1388",
          "ASUCO1140", "ASUCO0957", "ASUCO1386", "ASUCO0006", "ASUCO1532", "ASUCO1061",
          "ASUCO1141", "ASUCO0947", "ASUCO0754", "ASUCO0466", "ASUCO1365", "ASUCO1341",
          "ASUCO0123", "ASUCO1235", "ASUCO1006", "ASUCO1534", "ASUCO1203", "ASUCO1545",
          "ASUCO1228", "ASUCO0469", "ASUCO1580", "ASUCO1584", "ASUCO0413", "ASUCO0587",
          "ASUCO0941", "ASUCO0097", "ASUCO0490", "ASUCO0940"
        ],
        historialDesaprobados: {},
        cantidadDirigidos: 2, // Ya llevó 2 cursos dirigidos
        estadoMatricula: "Ninguno"
      },
      {
        nombre: "Daniel Rivas (Retorno Reserva)",
        codigo: "EST007",
        semestre: 6,
        planEstudios: "Plan 2014", // Plan no vigente
        planVigente: false,
        tieneDeudas: false,
        tasaPagada: true,
        seguroVigente: true,
        cursosAprobados: [
          "ASUCO1113", "ASUCO1083", "ASUCO1082", "ASUCO0512", "ASUCO1117", "ASUCO1086", "ASUCO1700",
          "ASUCO1108", "ASUCO1110", "ASUCO0562", "ASUCO1075", "ASUCO1079", "ASUCO1112",
          "ASUCO1160", "ASUCO1296", "ASUCO1312", "ASUCO0798", "ASUCO1275", "ASUCO1389"
        ],
        historialDesaprobados: {},
        cantidadDirigidos: 0,
        estadoMatricula: "Ninguno"
      }
    ];

    const estudiantesDB = await Estudiante.insertMany(estudiantesSeed);
    console.log(`✅ Estudiantes sembrados: ${estudiantesDB.length}`);

    console.log("🎉 SIEMBRA COMPLETADA CON ÉXITO");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en la siembra:", err);
    process.exit(1);
  }
};

seedDB();
