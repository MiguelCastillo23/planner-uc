# INFORME FINAL DE CIERRE DE PROYECTO

## 1. Portada y Resumen Ejecutivo

### 1.1. Portada y Datos Generales

#### 1.1.1. Información General del Proyecto
*   **Nombre del Sistema:** Planner-UC
*   **Título del Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible
*   **Organización Destino:** Universidad Continental
*   **Fecha de Cierre:** 22 de junio de 2026
*   **Versión de la Línea Base:** 3.0.0 (Final Liberado)
*   **Moneda Base del Proyecto:** Soles Peruanos (S/.)
*   **Tarifa Referencial de Ingeniería:** S/. 35.00 por hora/hombre

#### 1.1.2. Equipo de Desarrollo y Roles Scrum
El equipo de ingeniería se autoorganizó bajo el marco ágil Scrum. Se asumió una dinámica de responsabilidades Full-Stack cruzadas para evitar silos de conocimiento y asegurar el desarrollo incremental continuo:

| Identificación del Integrante | Rol Principal Scrum | Especialidad Técnica | Responsabilidades Clave de Cierre |
| :--- | :--- | :--- | :--- |
| **Miguel Angel Castillo Rojas** | Scrum Master | Backend Developer | Gestión de ceremonias ágiles, diseño de la base de datos, lógica del motor CSP y auditoría de seguridad OWASP. |
| **Tony Ulloa Alvinagorta** | Product Master | Backend Developer | Gobernanza de la API REST, optimización algorítmica de transiciones, gestión de persistencia y pruebas unitarias de servidor. |
| **Alain Aliaga Eulogio** | Product Owner | Frontend Developer | Definición y priorización del Product Backlog, maquetación de interfaces reactivas en React y validación de usabilidad ISO 25010. |
| **Erick Sanchez Vicente** | Product Owner | Frontend Developer | Modelado de historias de usuario, implementación de componentes interactivos, pruebas E2E de interfaz y control de accesibilidad WCAG. |

---

### 1.2. Resumen Ejecutivo (Síntesis del Proyecto)

#### 1.2.1. Definición del Problema Combinatorio (CSP)
El proyecto Planner-UC resuelve de forma automatizada la asignación de recursos académicos en la Universidad Continental. Este entorno se rige por un modelo de currículo flexible que genera una alta variabilidad en la matrícula y una densa red de restricciones interdependientes. 

El desafío se modeló formalmente como un **Problema de Satisfacción de Restricciones (Constraint Satisfaction Problem - CSP)** de alta complejidad computacional. El motor del sistema procesa un conjunto multidimensional de variables (estudiantes, asignaturas, secciones, docentes, aulas físicas y franjas horarias). Debe garantizar matemáticamente el cumplimiento de restricciones duras e ineludibles:
*   Cero solapamientos de tiempo y espacio para docentes, alumnos y aulas de forma simultánea.
*   Control estricto de los límites administrativos de matrícula, restringiendo la carga exclusivamente entre **20 y 22 créditos** por estudiante regular.
*   Validación automatizada de la secuencia de prerrequisitos del plan de estudios.
*   Respeto a las estructuras horarias institucionales diferenciadas, manteniendo bloques continuos de 3 horas para cursos de 3 créditos, y divisiones específicas (3h + 1.5h en días distintos) para cursos de 4 créditos, dentro de una ventana de 07:00 AM a 10:00 PM con **11 minutos obligatorios de transición**.

#### 1.2.2. La Solución Innovadora (Algoritmo Genético en Stack MERN)
La solución desarrollada rompe el paradigma de la planificación manual e ineficiente mediante un enfoque heurístico evolutivo inteligente. Se construyó un motor genético avanzado (`GeneticEngine`) capaz de explorar el espacio de soluciones sin caer en la explosión combinatoria que bloquea a los sistemas CSP tradicionales. El motor evalúa cada horario potencial a través de una función matemática de *Fitness* estructurada, aplicando penalizaciones severas a las infracciones de restricciones duras y optimizando de forma progresiva las restricciones blandas (como la reducción de horas muertas o "huecos" en la agenda del alumno) mediante operadores de selección por torneo, cruce (*crossover*) y mutación.

Esta arquitectura algorítmica se implementó de manera homogénea utilizando JavaScript en todas sus capas a través del **Stack MERN**:
*   **Frontend (UI/UX):** Una aplicación de página única (SPA) de alta velocidad construida con **React.js** sobre **Vite v6.0.10**, diseñada bajo componentes accesibles y una grilla interactiva basada en CSS Grid.
*   **Backend (Lógica):** Un servidor asíncrono y no bloqueante desarrollado en **Node.js v22.20.0** y **Express.js**, optimizado para el procesamiento intensivo del motor de generación.
*   **Persistencia (Datos):** Una base de datos no relacional orientada a documentos en **MongoDB Atlas**, cuyo esquema flexible permitió mapear dinámicamente las estructuras cambiantes de las mallas curriculares y las disponibilidades docentes.

#### 1.2.3. Logros Principales del Software (Métricas de Cierre)
Al concluir el ciclo de vida del proyecto enfocado en el Producto Mínimo Viable (PMV), el sistema arrojó métricas de rendimiento y calidad de software sobresalientes, validadas mediante auditorías técnicas objetivas:
1.  **Optimización Ecológica de Alto Impacto (94.7% de Reducción de CO2):** Integrando la librería de medición `@tgwf/co2` bajo el estándar *Sustainable Web Design (SWD)*, se auditó el ciclo de navegación completo. La aplicación redujo sus emisiones de carbono de **0.001049 gramos (estado base inicial) a solo 0.000055 gramos** por solicitud optimizada. Esto se logró mediante la inyección de middleware de compresión Gzip en Node.js, la configuración de cabeceras de caché HTTP efectivas por 60 segundos (estado 304 Not Modified), el uso del método `.select()` para proyecciones de datos eficientes en MongoDB y la carga perezosa (*Lazy Loading*) con `React.lazy` y `Suspense` en React. Estas mejoras permitieron que el motor convergiera en un tiempo medio de procesamiento de **0.8 segundos**, superando con éxito la meta original fijada en menos de 2 segundos.
2.  **Alta Madurez de Ingeniería y Robustez (89.4% de Cobertura de Pruebas):** La suite automatizada de control de calidad implementada con **Jest** (para pruebas unitarias y de integración) y **Cypress** (para pruebas de extremo a extremo) certificó una cobertura global del **89.4%** en todo el monorepositorio. Esta cifra se elevó al **92.3%** al evaluar estrictamente los componentes de la lógica de negocio y el motor matemático (`genetic.js`). Este riguroso marco de QA garantizó la resolución definitiva de defectos críticos relacionados con la persistencia asíncrona en el almacenamiento local y eliminó los riesgos de inconsistencia de datos en escenarios concurrentes multiusuario.

## 2. Análisis del Problema Complejo y Estado del Arte

### 2.1. Caracterización del Problema Complejo

#### 2.1.1. Entorno de Currículo Flexible de la Universidad Continental
El modelo educativo de la Universidad Continental se fundamenta en un esquema de currículo flexible que otorga al estudiante autonomía para gestionar su progreso académico. A diferencia de las estructuras tradicionales organizadas en bloques rígidos y fijos por ciclo, este entorno permite la libre elección de asignaturas, modalidades (presencial, semipresencial y a distancia) y turnos. Esta libertad de elección rompe cualquier previsibilidad sobre la composición de los grupos de estudiantes, transformando la planificación educativa en un entorno dinámico de alta variabilidad. La falta de trayectorias estandarizadas individuales exige un sistema de software capaz de asimilar configuraciones personalizadas masivas sin degradar la consistencia del servicio.

#### 2.1.2. Variabilidad de Matrícula y Restricciones Interdependientes
La autonomía estudiantil genera una fluctuación drástica en la demanda de asignaturas semestre a semestre, lo que se traduce en una alta variabilidad de la matrícula. El verdadero desafío de ingeniería de software no radica en el volumen de datos, sino en la densa red de restricciones administrativas y académicas fuertemente interdependientes que condicionan cada registro. 

El sistema debe operar bajo un estricto control de límites, validando en tiempo real que el alumno regular se matricule en un rango obligatorio de **20 a 22 créditos**. Simultáneamente, debe verificar de manera secuencial la lógica de prerrequisitos del plan de estudios, bloqueando de forma automática el acceso a materias avanzadas si no se registran las aprobaciones previas. Asimismo, la estructura de las sesiones varía según el peso del curso: las asignaturas de 3 créditos se programan en un bloque continuo de 3 horas, mientras que los cursos de 4 créditos se dividen obligatoriamente en un bloque de 3 horas y un sub-bloque complementario de 1.5 horas en días totalmente distintos. La modificación o adición de una sola sección altera la validez de cientos de horarios preexistentes, provocando un efecto dominó que hace inviable cualquier procesamiento lineal.

#### 2.1.3. Conflictos Críticos de Recursos e Infraestructura
La asignación de recursos tangibles y logísticos introduce limitaciones físicas insalvables dentro del ecosistema universitario. Los docentes actúan como proveedores de disponibilidad con restricciones horarias contractuales específicas que no pueden ser vulneradas. Por otro lado, la infraestructura física (aulas teóricas, laboratorios de cómputo especializados y talleres) posee aforos máximos auditables bajo normas de seguridad institucional. 

Todos estos elementos deben converger y ordenarse dentro de una ventana horaria institucional rígida, comprendida de forma exclusiva entre las **07:00 AM y las 10:00 PM**. Adicionalmente, el modelo logístico exige un intervalo de amortiguación o margen obligatorio de **11 minutos de transición** entre el fin de una sesión y el inicio de la siguiente para permitir el desplazamiento físico de alumnos y docentes. El cruce accidental de un profesor, la asignación duplicada de un laboratorio o la programación de un alumno en bloques superpuestos constituyen solapamientos críticos que invalidan la solución por completo.

---

### 2.2. Análisis de Soluciones Similares (Estado del Arte)

#### 2.2.1. Limitaciones de los Enfoques CSP Puros Tradicionales
En la literatura científica de la Ingeniería de Software, la planificación de horarios universitarios se tipifica como el *University Course Timetabling Problem* (UCTP), un problema clásico clasificado como NP-completo debido a su explosión combinatoria. Los sistemas comerciales tradicionales abordan este desafío modelándolo como un Problema de Satisfacción de Restricciones puro (CSP por sus siglas en inglés), utilizando solucionadores basados en algoritmos de *backtracking* lineal o programación lógica con restricciones estándar. 

Si bien estos motores demuestran una alta fiabilidad para garantizar el cumplimiento de restricciones de tipo binario o determinista (como evitar que un aula albergue dos cursos a la vez), colapsan ante entornos de currículo flexible. Al incrementarse el número de variables e interdependencias, el espacio de búsqueda se expande de manera exponencial. Esto provoca que los enfoques CSP puros sufran bloqueos por consumo excesivo de memoria o caigan en bucles infinitos de cómputo, devolviendo errores de inconsistencia matemática sin ofrecer alternativas viables a los administradores académicos.

#### 2.2.2. Ventajas Metaheurísticas del Algoritmo Genético como Motor Evolutivo
Para superar la rigidez de los enfoques CSP puros, las investigaciones contemporáneas en ingeniería de sistemas respaldan la aplicación de metaheurísticas de optimización global, destacando los **Algoritmos Genéticos**. Un enfoque evolutivo no busca explorar cada combinación posible del espacio de búsqueda; en su lugar, imita los principios de la selección natural y la genética biológica para aproximar soluciones óptimas en un tiempo reducido. 

El sistema abstrae las soluciones potenciales (los horarios) en forma de cadenas de datos o cromosomas, y mide su calidad mediante una función matemática de **Fitness**. La gran ventaja técnica de esta metodología radica en su capacidad para gestionar simultáneamente dos tipos de criterios mediante penalizaciones ponderadas:
*   **Restricciones Duras (*Hard Constraints*):** Condiciones cuya violación anula la validez del horario (solapamientos de docentes, violación del rango de 20-22 créditos). Reciben un peso de penalización máximo en la función de Fitness, forzando la eliminación natural de estas soluciones inviables en las primeras generaciones del algoritmo.
*   **Restricciones Blandas (*Soft Constraints*):** Lineamientos orientados a la experiencia del usuario y la comodidad del estudiante (minimizar horas libres o "huecos" entre clases, agrupar las materias en bloques continuos o evitar asignaciones en extremos horarios). Estas reglas no invalidan el sistema, sino que guían la evolución del algoritmo hacia configuraciones más eficientes mediante operadores probabilísticos de selección por torneo, cruce (*crossover*) y mutación.

#### 2.2.3. Síntesis y Justificación Teórica de Planner-UC
La arquitectura e ingeniería de **Planner-UC** se fundamenta en un enfoque híbrido que extrae y combina las mayores fortalezas del estado del arte analizado. El sistema adopta formalmente el modelado matemático estructural de un modelo CSP `(X, D, C)` para definir con precisión matemática las variables, dominios de secciones y reglas restrictivas institucionales de la Universidad Continental. Sin embargo, para evitar los cuellos de botella computacionales de los métodos tradicionales, delega el procesamiento y la resolución matemática a un motor genético optimizado (`GeneticEngine`).

La justificación para implementar esta solución sobre el **Stack MERN** radica en la sinergia entre el motor y la infraestructura web:
*   La naturaleza asíncrona y basada en eventos de **Node.js** e **Express.js** proporciona el entorno de ejecución ideal para procesar los bucles iterativos intensivos del algoritmo sin bloquear el servidor.
*   El almacenamiento documental de **MongoDB** asimila los esquemas flexibles y dinámicos propios del currículo flexible sin requerir costosas operaciones de unión (*joins*) relacionales.
*   La reactividad de **React.js** en combinación con CSS Grid traduce de manera inmediata las soluciones óptimas generadas por el motor en interfaces de usuario intuitivas y dinámicas. 

Esta confluencia de diseño e ingeniería permite que Planner-UC converja hacia soluciones 100% válidas y libres de conflictos en un tiempo medio de **0.8 segundos**, consolidando una base de alta eficiencia técnica alineada con las demandas académicas modernas.

## 3. Gestión Adaptativa y Trabajo Colaborativo

### 3.1. Ciclo de Vida e Iteraciones (Scrum)

#### 3.1.1. Resumen y Entregables Clave de los Sprints 1 y 2
El desarrollo del proyecto se estructuró de manera incremental utilizando el marco ágil Scrum, lo que permitió validar de forma temprana los cimientos del sistema y mitigar los riesgos asociados a la complejidad combinatoria del motor de horarios.

*   **Sprint 1: Cimientos y Gestión de Datos (MERN)**
    *   **Resumen:** En esta fase se configuró el entorno inicial del monorepositorio y se estableció la persistencia flexible de las entidades base en la nube. Se dio prioridad al diseño de esquemas en MongoDB Atlas capaces de asimilar los datos dinámicos de docentes, aulas, cursos y mallas curriculares. Se implementaron los endpoints iniciales utilizando Express y Node.js bajo una arquitectura limpia de controladores y modelos.
    *   **Entregables Clave:** Operaciones CRUD completas para la gestión de recursos académicos (aulas, laboratorios y asignaturas), modelos lógicos de relación Docente-Curso en la base de datos y la provisión de la infraestructura inicial desplegada en la nube de forma funcional.
*   **Sprint 2: El Motor de Optimización**
    *   **Resumen:** Este sprint se centró en el núcleo algorítmico del sistema, transformando el modelado conceptual CSP en componentes lógicos ejecutables en el backend. Se programó el motor genético (`GeneticEngine`), implementando las heurísticas de selección por torneo y la lógica de validación de restricciones duras en Node.js, coordinando el desarrollo para evitar solapamientos.
    *   **Entregables Clave:** Algoritmo de optimización evolutivo capaz de converger en soluciones libres de solapamientos horarios y el validador automatizado del rango estricto de matrícula (20 a 22 créditos) y prerrequisitos secuenciales.

#### 3.1.2. Resumen y Entregables Clave de los Sprints 3 y 4
Las últimas iteraciones se enfocaron en la experiencia del usuario, la integración de la interfaz gráfica y la aplicación rigurosa de estándares de calidad e impacto sostenible.

*   **Sprint 3: Interfaz de Usuario y Experiencia (UX/UI)**
    *   **Resumen:** Se construyó la aplicación web interactiva de página única (SPA) utilizando React.js y Vite. El objetivo principal fue conectar las respuestas JSON del motor de horarios con una interfaz visual intuitiva y reactiva que facilitara la interacción humana con el algoritmo.
    *   **Entregables Clave:** Formulario de registro dinámico de franjas horarias de disponibilidad para los docentes, panel interactivo de selección de asignaturas con bloqueo por contador de créditos y el Dashboard de visualización del horario final renderizado mediante una grilla de CSS Grid.
*   **Sprint 4: Calidad, Seguridad y Sostenibilidad**
    *   **Resumen:** Fase orientada al endurecimiento técnico del software antes de la liberación final del Producto Mínimo Viable (PMV). Se integraron las pautas de Green Software para minimizar el uso de CPU en el backend, se implementaron auditorías de seguridad basadas en el estándar OWASP y se el desarrollo de pruebas complejas.
    *   **Entregables Clave:** Módulo de autenticación y acceso seguro al perfil basado en JSON Web Tokens (JWT), API con middleware de compresión Gzip y políticas de caché en el servidor, panel de reporte de eficiencia de aulas (Green IT) y suite completa de pruebas unitarias, integrales y de extremo a extremo (E2E) documentada de forma definitiva.

---

### 3.2. Gestión del Repositorio y Métrica de Coorganización

#### 3.2.1. Flujo de Trabajo en GitHub (GitHub Flow)
Para coordinar el desarrollo simultáneo sin introducir regresiones en el código funcional, el equipo adoptó de manera estricta el flujo de trabajo *GitHub Flow* y el monitoreo visual mediante *GitHub Graph*. 

La rama principal `main` se mantuvo bloqueada mediante políticas de protección del repositorio, impidiendo cualquier inserción directa de código. El proceso operativo estructurado para la integración de características constó de los siguientes pasos secuenciales:
1. Apertura de una rama de característica aislada (*Feature Branch*) a partir de la última versión estable de `main`.
2. Desarrollo local de la tarea asignada bajo el enfoque de desarrollo guiado por especificaciones.
3. Apertura de un *Pull Request* (PR) formal detallando el módulo afectado y los criterios de aceptación cubiertos.
4. Revisión técnica cruzada obligatoria: ningún cambio pudo fusionarse a la rama `main` sin haber sido revisado, probado localmente y aprobado formalmente por un compañero de rol técnico inverso (Frontend vs. Backend).

#### 3.2.2. Auditoría y Frecuencia de Commits Semánticos por Integrante
Con el fin de mantener un historial transparente y auditable, se impuso el uso de commits semánticos y descriptivos, clasificando cada aporte mediante prefijos estandarizados (por ejemplo, `feat:` para nuevas funcionalidades, `fix:` para la corrección de errores, `docs:` para modificaciones en la documentación y `test:` para adición de pruebas).

La métrica de coorganización establecida en las normas de convivencia técnica exigió un ritmo mínimo de **5 commits semanales por integrante**. El Scrum Master realizó un monitoreo semanal para verificar la carga equitativa de trabajo y el desarrollo incremental. El resultado final de la auditoría del repositorio demostró consistencia en el flujo de contribuciones, sumando un historial transparente que sirvió como evidencia del trabajo colaborativo real y equilibrado del equipo.

---

### 3.3. Gestión de Cambios Adaptativa

#### 3.3.1. Variaciones en Reglas de Negocio Durante el Desarrollo
La naturaleza adaptativa del proyecto se puso a prueba al enfrentar variaciones críticas en las reglas de negocio académicas a mitad del ciclo de desarrollo. Originalmente, el alcance del motor CSP contemplaba una validación lineal y uniforme de créditos y prerrequisitos. Sin embargo, durante las reuniones de sincronización se introdujeron nuevos requerimientos de alta complejidad:

*   Inclusión de excepciones administrativas para cargas mínimas inferiores a 12 créditos si el alumno justifica que es para culminar sus estudios.
*   Restricciones severas por rendimiento académico (*RF-04*), limitando la matrícula a un máximo de 16 créditos ante una segunda desaprobación o el bloqueo total del acceso por separación definitiva.
*   La necesidad de registrar y bloquear la modalid de asistencia (física o remota) al momento de la matrícula en asignaturas híbridas.
*   Configuraciones específicas de 16 semanas continuas para las asignaturas de Taller de Investigación 1 y 2, prohibiendo su apertura en ciclos de verano.

#### 3.3.2. Impacto en el Diseño del Software y Acciones de Mitigación
Estas variaciones impactaron directamente el diseño arquitectónico de Planner-UC, amenazando con elevar drásticamente los tiempos de procesamiento en el servidor y generar inconsistencias en los datos JSON compartidos entre React y Express.

Para mitigar estos impactos de manera adaptativa, el equipo ejecutó acciones técnicas inmediatas que se detallan en la siguiente matriz de trazabilidad de cambios:

| Regla de Negocio Sometida a Cambio | Componente Técnico Afectado | Riesgo o Impacto en el Diseño | Acción de Mitigación Implementada |
| :--- | :--- | :--- | :--- |
| **RF-04:** Restricciones por bajo rendimiento académico. | Motor de Optimización (`genetic.js` y `fitness.js`). | Incremento exponencial del uso de CPU y degradación de la eficiencia de rendimiento. | Se implementó una lógica de poda algorítmica previa que descarta combinaciones inválidas antes del cálculo de la función de Fitness. |
| **RF-05:** Selección obligatoria de modalidad (híbrido/remoto). | API REST (Backend Express) e Interfaz React. | Inconsistencia de datos en las estructuras JSON compartidas entre las capas. | Se establecieron contratos de datos fijos utilizando Postman y Swagger desde el Sprint 1 antes de codificar los controladores. |
| **RF-06 / RNF-03:** Reglas complejas para Taller de Investigación. | Base de datos MongoDB y lógica de validación de Node.js. | Saturación del servidor en el plan de alojamiento en la nube (Tier Free). | Se limitaron los bucles internos del motor heurístico a un máximo de 300 iteraciones estables, manteniendo el tiempo medio en **0.8 segundos**. |

## 4. Diseño y Desarrollo de la Solución Técnica

### 4.1. Modelado Abstracto del Sistema

#### 4.1.1. Especificación Formal de Variables (X) y Dominios (D)
El núcleo del sistema Planner-UC modela la planificación de horarios académicos bajo la estructura de un Problema de Satisfacción de Restricciones (Constraint Satisfaction Problem - CSP), definido formalmente por la relación lógica entre Variables (X), Dominios (D) y Restricciones (C).

*   **Conjunto de Variables (X):** Representa las asignaturas seleccionadas libremente por el estudiante durante su matrícula adaptativa. Corresponde a la lista completa de cursos únicos dentro de la carga académica solicitada para el ciclo.
*   **Conjunto de Dominios (D):** Cada asignatura variable está ligada a un dominio compuesto por todas las secciones programadas y disponibles para dicho curso en el periodo académico. Cada sección elegible constituye una estructura indivisible que encapsula tres recursos críticos: la matriz de franjas horarias asignadas (días y horas), el docente a cargo y el espacio físico o laboratorio especializado reservado.

#### 4.1.2. Formalización de las Restricciones (C)
El conjunto de restricciones regula la validez de las asignaciones de secciones a las variables del sistema. Para asegurar una lectura correcta en cualquier previsualizador de Markdown estándar, se omite la notación matemática compleja y se detalla su comportamiento lógico formal:

##### 1. Restricciones Duras (C-hard) - Obligatorias
*   **No solapamiento del Alumno (C-h1):** Para cada asignatura elegida por el estudiante, las franjas horarias de las secciones seleccionadas no deben cruzarse en ningún punto de la ventana horaria de la universidad. Un alumno no puede estar matriculado en dos asignaturas distintas a la misma hora.
*   **No solapamiento del Docente (C-h2):** Un profesor no puede dictar más de una sección o materia simultáneamente. Si el sistema detecta que un mismo docente está asignado a dos cursos diferentes, sus horarios deben ser completamente excluyentes (cero cruces).
*   **No solapamiento de Infraestructura (C-h3):** Un aula física, salón teórico o laboratorio especializado no puede albergar dos secciones a la vez. Si dos asignaturas requieren el uso del mismo salón, la coincidencia horaria entre ellas debe ser nula.
*   **Límites de Creditaje (C-h4):** La carga de créditos acumulada por la suma de las asignaturas seleccionadas debe ceñirse al rango administrativo estricto de la Universidad Continental. El sistema bloquea de manera absoluta cualquier combinación que sume menos de 20 créditos o más de 22 créditos académicos.

##### 2. Restricciones Blandas (C-soft) - Optimizables
*   **Minimización de Ventanas Libres (C-s1):** Reducir al mínimo los bloques de tiempo vacíos o "huecos" en la jornada diaria del alumno, promoviendo bloques continuos para mejorar la continuidad pedagógica.
*   **Evitar Extremos Horarios (C-s2):** Restringir a nivel probabilístico y de puntuación la asignación de clases consecutivas en las primeras franjas de la mañana (07:00 AM) o en las últimas franjas de la noche (10:00 PM).

---

### 4.2. Arquitectura de Software e Infraestructura Web

#### 4.2.1. Estructura de Monorepositorio y API REST en Node.js/Express
El software se organizó bajo un esquema de Monorepositorio, unificando el frontend y el backend en un único espacio de trabajo para asegurar el control de versiones y simplificar los contratos de datos JSON. La API REST se desarrolló en Node.js v22.20.0 y Express.js, aprovechando su naturaleza asíncrona para procesar peticiones intensivas de manera no bloqueante.

```text
📂 planner-uc (Monorepositorio)
├── 📂 backend
│   ├── 📂 controllers   # Endpoints de negocio (adminController.js, horarioController.js)
│   ├── 📂 models        # Modelos Mongoose (User.js, Curso.js, Section.js)
│   ├── 📂 genetic       # Algoritmo de optimización (genetic.js, fitness.js)
│   └── server.js        # Archivo raíz del servidor Express
└── 📂 frontend
    ├── 📂 src
    │   ├── 📂 components # Componentes de interfaz (CourseSelector, ScheduleGrid)
    │   └── App.jsx       # Raíz reactiva del cliente React
    └── vite.config.js    # Entorno de compilación ágil en Vite v6.0.10
```

#### 4.2.2. Persistencia Documental Flexibilizada en MongoDB Atlas
Debido a la alta variabilidad del currículo flexible, donde las estructuras de los cursos cambian constantemente en créditos y requisitos, se implementó MongoDB Atlas en su capa gratuita. Su almacenamiento basado en documentos flexibles evitó las restricciones de esquemas rígidos de bases de datos relacionales tradicionales. El backend optimizó el consumo de memoria indexando campos críticos y aplicando proyecciones estrictas mediante el método `.select('nombre codigo creditos')` de Mongoose para acelerar la extracción de datos sin realizar costosas operaciones de unión.

#### 4.2.3. Interfaz de Visualización Reactiva y CSS Grid en React
El cliente se desarrolló como una Single Page Application (SPA) utilizando React.js y Vite v6.0.10. Para estructurar la representación gráfica del calendario académico de forma fluida y responsiva, la grilla interactiva se diseñó puramente con CSS Grid. Esta propiedad permite mapear las coordenadas temporales (filas de horas y columnas de días) de las secciones generadas de manera directa, controlando dinámicamente la interfaz mediante estados reactivos (`useState`) que bloquean el envío al servidor si el alumno no cumple el rango de 20-22 créditos.

---

### 4.3. Arquitectura del Motor de Optimización Inteligente

#### 4.3.1. Función de Evaluación (Fitness) y Penalizaciones Duras/Blandas
El algoritmo evolutivo implementado en `genetic.js` evalúa la viabilidad de los horarios mediante una función de Fitness formulada con un esquema de penalización negativa acumulativa. Una solución perfecta (libre de conflictos) converge hacia un puntaje de cero. El motor procesa el balance de restricciones asignando pesos ponderados estrictos en la lógica del código:

| Tipo de Restricción | Peso Asignado | Propósito Técnico en el Algoritmo | Impacto en la Solución |
| :--- | :--- | :--- | :--- |
| **Restricciones Duras** | Peso: 1000 | Penalizar drásticamente cualquier cruce de horario, aula o docente, así como la violación del rango de créditos. | Genera un descarte inmediato del individuo en la selección, garantizando la viabilidad institucional. |
| **Restricciones Blandas** | Peso: 10 | Restar puntaje de forma moderada ante la presencia de ventanas libres o huecos en la agenda del alumno. | Actúa como un criterio de optimización secundaria para seleccionar el horario más compacto y eficiente. |

#### 4.3.2. Operadores Genéticos (Selección por Torneo, Cruce y Mutación)
Para asegurar que el sistema converja hacia un horario válido en un tiempo promedio de 0.8 segundos, el motor ejecuta un flujo evolutivo cíclico detallado en la siguiente matriz operativa:

| Etapa del Algoritmo | Operador Implementado | Configuración / Tasa | Comportamiento e Impacto en la Evolución |
| :--- | :--- | :--- | :--- |
| **1. Selección** | Torneo Probabilístico | Tamaño de torneo: 3 | Se extraen 3 individuos al azar de la población y compiten entre sí; el que posee mejor Fitness (menor penalización) es elegido como progenitor. |
| **2. Recombinación** | Cruce de Un Solo Punto | Probabilidad del 90% | Los horarios padres intercambian bloques completos de asignación a partir de un punto de corte aleatorio, preservando secuencias horarias exitosas. |
| **3. Variabilidad** | Mutación Uniforme | Probabilidad del 5% | Se modifica aleatoriamente la sección de una asignatura por otra válida de su dominio, evitando que el algoritmo quede atrapado en óptimos locales. |
| **4. Finalización** | Criterio de Parada | Máximo 300 iteraciones | El bucle se detiene al alcanzar el límite de generaciones estables o al converger en una solución óptima, optimizando los ciclos de CPU. |

## 5. Requerimientos, Estándares y Aseguramiento de la Calidad

### 5.1. Cumplimiento de Estándares Internacionales

#### 5.1.1. Calidad del Producto bajo la Norma ISO/IEC 25010
El desarrollo de Planner-UC integró criterios de evaluación basados en el estándar internacional de calidad de software ISO/IEC 25010, priorizando tres características fundamentales del producto:

*   **Mantenibilidad:** Se implementó una arquitectura limpia con separación de responsabilidades en el monorepositorio. Esto asegura que la lógica de optimización (`genetic.js`) funcione de manera independiente a las rutas de Express y a los esquemas de Mongoose, facilitando modificaciones futuras sin efectos secundarios.
*   **Eficiencia de Rendimiento:** El sistema demostró una alta velocidad de respuesta al converger en un tiempo medio de procesamiento de 0.8 segundos para la generación de horarios válidos. Esto supera la meta de diseño inicial (< 2s) y minimiza el consumo de recursos en el backend.
*   **Usabilidad:** La interfaz web fue diseñada para ser intuitiva y reactiva. Permite la selección interactiva de asignaturas y actualiza de manera dinámica la disponibilidad de recursos y la carga de créditos del alumno en tiempo real.

#### 5.1.2. Mitigación de Vulnerabilidades Críticas mediante OWASP Top 10
Para proteger la integridad de los datos académicos y asegurar los endpoints de la API REST, el equipo aplicó directrices del estándar OWASP Top 10 para mitigar fallos críticos de seguridad:

| Categoría OWASP | Riesgo Identificado | Mecanismo de Control e Implementación en Planner-UC |
| :--- | :--- | :--- |
| **Control de Acceso Quebrado** | Acceso no autorizado a rutas administrativas o endpoints de generación de horarios. | Restricción estricta de rutas en el servidor Express mediante middlewares de validación de roles y tokens JWT. |
| **Fallas Criptográficas** | Almacenamiento de contraseñas de estudiantes y docentes en texto plano dentro de la base de datos. | Encriptación unidireccional y robusta de credenciales utilizando la librería `bcrypt` antes de la persistencia en MongoDB Atlas. |
| **Inyección** | Manipulación de consultas a través de los campos de entrada de la interfaz de usuario. | Uso de Mongoose ORM que implementa consultas parametrizadas automáticas, evitando la inyección de código NoSQL. |

#### 5.1.3. Accesibilidad Web (WCAG 2.1) y Estándares W3C en Interfaces
La interfaz de usuario construida en React.js se alineó con las pautas de accesibilidad WCAG 2.1 (Nivel AA) y los estándares del consorcio W3C para garantizar una plataforma inclusiva:

*   **Semántica HTML Estricta:** Uso de etiquetas estructurales nativas (como `main`, `nav`, `section`, `header`) para asegurar que los lectores de pantalla puedan interpretar correctamente la jerarquía del Dashboard.
*   **Diseño Adaptable y Contraste:** Implementación de hojas de estilo que respetan las relaciones de contraste de color mínimas para usuarios con discapacidad visual moderada, manteniendo la responsividad de la grilla de CSS Grid.
*   **Navegación por Teclado:** Configuración de índices de tabulación (`tabIndex`) y focos interactivos para permitir que personas con discapacidades motrices puedan seleccionar cursos y generar sus horarios sin depender de un ratón.

---

### 5.2. Análisis de Cobertura y Aseguramiento de Calidad (QA)

#### 5.2.1. Resultados del Plan de Pruebas Unitarias e Integrales con Jest
El control de calidad interno del monorepositorio se ejecutó mediante la suite de pruebas automatizadas **Jest**, dando soporte nativo a ES Modules. Estas pruebas validaron de forma aislada e integral el comportamiento matemático del motor evolutivo y la correcta comunicación entre los componentes del backend:

```text
📊 Reporte de Cobertura de Pruebas (Jest)
├── Cobertura Global del Monorepositorio: 89.4% (Promedio)
└── Cobertura de Lógica Crítica del Motor: 92.3% (Módulos Base)
```

Las pruebas unitarias emplearon *mocks* para aislar las interacciones con MongoDB Atlas, garantizando que los ciclos de decisión del algoritmo genético arrojaran resultados deterministas ante las mismas entradas. Se logró verificar al 100% el comportamiento óptimo de los controladores clave `adminController.js` y `horarioController.js`.

#### 5.2.2. Pruebas de Extremo a Extremo (E2E) con Cypress
Para asegurar la confiabilidad del sistema desde la perspectiva del usuario final y validar los flujos de integración complejos, se implementó **Cypress** para pruebas E2E. Estas pruebas simularon de forma automática las acciones reales en el navegador web, cubriendo los siguientes escenarios:

*   Flujo completo de autenticación de usuarios según su rol (Administrador, Docente y Estudiante).
*   Proceso de selección adaptativa de asignaturas, validando el bloqueo reactivo del frontend ante intentos de superar el límite de créditos.
*   Simulación de concurrencia multiusuario para verificar la persistencia y la sincronización correcta de los estados del servidor durante el periodo de simulación de matrícula.

#### 5.2.3. Registro y Mitigación de Defectos y Bugs Corregidos
Durante las fases de control de calidad y pruebas de integración (QA), el equipo identificó y solucionó tres puntos críticos de error antes de la liberación final del software:

| ID Defecto | Descripción del Bug Detectado | Impacto en el Sistema | Acción de Mitigación y Solución Técnica |
| :--- | :--- | :--- | :--- |
| **BUG-01** | Falla en la redirección asíncrona hacia la ruta de administrador tras recargar la página web. | Bug de Persistencia de sesión en el cliente React. | Implementación de una limpieza explícita de `localStorage` y manejo seguro de estados de sesión globales. |
| **BUG-02** | Desalineación de los estados y cargas horarias al procesar múltiples peticiones concurrentes. | Inconsistencia multiusuario en la asignación de recursos. | Refactorización de la capa de acceso a datos de Mongoose para asegurar transacciones atómicas entre perfiles. |
| **BUG-03** | Errores de sintaxis e incompatibilidad al integrar herramientas de aserción en el entorno de pruebas. | Conflictos de entorno de desarrollo entre Jest y Vitest. | Estandarización estricta de módulos de importación y aislamiento de un archivo de configuración `jest.config.js` externo. |

## 6. Análisis de Impacto Multidisciplinario y Ciudadanía Glocal

### 6.1. Contexto de Implementación y Grupos de Interés

#### 6.1.1. Factores Sociales y Culturales de los Usuarios del Sistema
El despliegue de Planner-UC en la Universidad Continental responde a un ecosistema universitario diverso y geográficamente distribuido en varias regiones del Perú (Huancayo, Lima, Arequipa y Cusco). Esta distribución introduce variables culturales, socioeconómicas y geográficas que impactan directamente el uso de las tecnologías de la información:

*   **Diversidad de Modalidades y Brecha Digital:** La comunidad estudiantil se divide en tres modalidades con perfiles marcadamente diferentes: Presencial (estudiantes jóvenes con alta presencialidad), Semipresencial y a Distancia (adultos que trabajan, con responsabilidades familiares y acceso variable a conectividad de banda ancha). El sistema mitiga estas diferencias culturales mediante un diseño web responsivo de baja carga que permite la selección de horarios desde redes móviles limitadas (4G/5G).
*   **Gestión del Tiempo y Ritmos Culturales:** Los coordinadores académicos dedican semanas de trabajo manual y de alta carga mental a resolver conflictos de horarios antes de cada ciclo. Planner-UC cambia esta cultura laboral al reducir el proceso a solo 0.8 segundos. Esto permite reorientar los recursos humanos hacia tareas de asesoría personalizada, mejorando el clima organizacional y la satisfacción del usuario interno.

---

### 6.2. Aspectos Éticos, Legales y de Seguridad de la Información

#### 6.2.1. Resguardo y Privacidad de Datos Académicos Sensibles
La automatización de la matrícula y la planificación de horarios exige la manipulación de datos sensibles (identidad de estudiantes, récords de notas, historias de desaprobación y agendas de docentes). El diseño y despliegue del software se estructuró bajo principios éticos e ingeniería legal estricta para garantizar los siguientes pilares de protección:

*   **Cumplimiento Legal (Ley N° 29733 - Ley de Protección de Datos Personales):** El sistema cumple con la normativa peruana al aislar los datos confidenciales mediante mecanismos de anonimización en los bancos de datos de MongoDB Atlas. El motor genético no requiere nombres de usuario ni identidades reales para ejecutar la optimización; solo procesa identificadores alfanuméricos correlativos anonimizados.
*   **Resguardo Ético de la Información de Rendimiento:** Las restricciones asociadas al bajo rendimiento académico (como el límite de 16 créditos por la regla RF-04) se validan de manera interna y silenciosa en el backend. Esto evita la exposición de la condición académica de los estudiantes frente a terceros y previene sesgos, discriminación o afectaciones éticas a la privacidad del alumno.
*   **Gobernanza Tecnológica:** Se garantiza la inmutabilidad y la trazabilidad de las auditorías de acceso mediante el uso de tokens JSON Web Tokens (JWT) firmados criptográficamente. Ningún usuario puede consultar información que no corresponda estrictamente a su rol asignado en la matriz Scrum de negocio.

---

### 6.3. Impacto de los Procesos de Globalización

#### 6.3.1. Alineamiento de Planner-UC con Tendencias Globales de Ingeniería
El proyecto Planner-UC no opera de manera aislada; su diseño está alineado con las tendencias contemporáneas y los procesos de globalización que rigen la Ingeniería de Software a nivel internacional:

*   **Adopción de Tecnologías de Ecosistema Global:** El uso del Stack MERN (MongoDB, Express, React, Node.js) y herramientas de construcción ágiles como Vite v6.0.10 conecta el proyecto con las prácticas de desarrollo más utilizadas en Silicon Valley y Europa. Esto garantiza que el software sea compatible con estándares modernos de interoperabilidad y esté listo para una eventual transición hacia arquitecturas basadas en microservicios o contenedores (Docker/Kubernetes).
*   **Conciencia Ambiental Global (Green Computing):** La reducción de la huella de carbono digital es una exigencia internacional para mitigar el cambio climático. Al incorporar auditorías automatizadas bajo el modelo Sustainable Web Design (SWD) y alcanzar una reducción del 94.7% en emisiones de dióxido de carbono por petición, Planner-UC demuestra cómo la ingeniería local en el Perú puede alinearse activamente con los Objetivos de Desarrollo Sostenible (ODS) de las Naciones Unidas.
*   **Heurísticas de Optimización Inteligente:** El traslado del problema CSP a un Algoritmo Genético (`GeneticEngine`) posiciona la solución dentro de la tendencia global de aplicar inteligencia computacional y algoritmos bioinspirados para resolver problemas de logística y asignación de recursos complejos en entornos corporativos globales.

## 7. Reporte Económico y Costo del Ciclo de Vida

### 7.1. Presupuesto Inicial versus Ejecución Financiera Real

#### 7.1.1. Análisis del Esfuerzo en Horas-Hombre y Costo por Tareas
Para cuantificar el esfuerzo invertido en el proyecto Planner-UC, se estableció un control estricto de horas por cada hito de desarrollo (Sprints). Los cálculos económicos consideran una tarifa plana referencial de ingeniería de S/. 35.00 por hora-hombre para los cuatro integrantes del equipo Scrum. 

La ejecución financiera real demostró una desviación controlada del 3.5% sobre el presupuesto inicial debido a la refactorización adaptativa del motor CSP durante el Sprint 4:

| Fase / Sprint de Desarrollo | Horas Estimadas | Horas Reales | Costo Planificado (S/.) | Costo Real Ejecutado (S/.) | Estado de Desviación |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Sprint 1:** Cimientos y CRUD MERN | 80 | 80 | S/. 2,800.00 | S/. 2,800.00 | Ejecutado conforme a lo previsto. |
| **Sprint 2:** Motor Genético Base | 100 | 96 | S/. 3,500.00 | S/. 3,360.00 | Eficiencia de tiempo (-4h). |
| **Sprint 3:** Interfaz React y CSS Grid | 80 | 84 | S/. 2,800.00 | S/. 2,940.00 | Complejidad en maquetación (+4h). |
| **Sprint 4:** Calidad, Seguridad y QA | 60 | 72 | S/. 2,100.00 | S/. 2,520.00 | Ajustes por cambios en reglas (+12h). |
| **Totales Acumulados** | **320** | **332** | **S/. 11,200.00** | **S/. 11,620.00** | **Desviación neta de +S/. 420.00** |

#### 7.1.2. Costos de Licenciamiento e Infraestructura Cloud
El despliegue y control de calidad del Producto Mínimo Viable (PMV) priorizó la eficiencia presupuestaria, aprovechando los niveles gratuitos (*Tier Free*) provistos por los proveedores globales de infraestructura para software moderno:

*   **MongoDB Atlas:** S/. 0.00 (Capa gratuita compartida, clúster M0, suficiente para las consultas indexadas optimizadas con el método `.select()`).
*   **Alojamiento del Servidor Backend (Node.js/Express):** S/. 0.00 (Despliegue en planes base de plataformas en la nube con arranque en frío).
*   **Alojamiento del Cliente Frontend (React/Vite):** S/. 0.00 (Despliegue estático en redes de distribución de contenido optimizadas).
*   **Licenciamiento de Herramientas de Desarrollo:** S/. 0.00 (Uso de Git, GitHub, VS Code y suites de pruebas de código abierto como Jest y Cypress).
*   **Costo Total de Infraestructura Física Inicial:** S/. 0.00 (Inversión inicial completamente mitigada).

---

### 7.2. Análisis del Costo del Ciclo de Vida del Software (TCO)

#### 7.2.1. Proyección Financiera de Operación y Mantenimiento Técnico
Para garantizar la sostenibilidad de Planner-UC a largo plazo dentro de la Universidad Continental, se estructuró el Costo Total de Propiedad (Total Cost of Ownership - TCO) proyectado a un año horizonte. Esta proyección contempla la transición obligatoria a servicios de nube comerciales para soportar la concurrencia real y la carga de datos institucionales:

*   **Infraestructura de Nube Comercial Proyectada:**
    *   *Base de Datos Comprometida (MongoDB Atlas M10):* S/. 180.00 mensuales (S/. 2,160.00 anuales).
    *   *Servidor de Producción Escalable (Backend Express):* S/. 120.00 mensuales (S/. 1,440.00 anuales).
    *   *Red de Distribución de Contenido (Frontend React):* S/. 30.00 mensuales (S/. 360.00 anuales).
*   **Mantenimiento Técnico Preventivo y Correctivo:**
    *   Asignación de un fondo de soporte de 10 horas de ingeniería mensuales (S/. 350.00 al mes) para atender actualizaciones críticas de dependencias de Node.js, mitigación de nuevas vulnerabilidades OWASP y optimizaciones de rendimiento del motor genético (S/. 4,200.00 anuales).
*   **Subtotal Costo de Operación Año 1:** S/. 8,160.00.

#### 7.2.2. Estimación de Costos de Soporte Continuo y Retiro del Sistema
El ciclo de vida del software concluye con la planificación del soporte al usuario y las acciones finales de disposición del sistema tras su ventana de amortización estimada en 3 años:

*   **Soporte Continuo y Capacitación:** Se presupuesta un pago único de S/. 1,050.00 (30 horas de ingeniería) al inicio del despliegue institucional para la capacitación de coordinadores académicos y la redacción de guías técnicas de usuario bajo estándares de accesibilidad.
*   **Retiro del Sistema y Migración de Datos:** Llegado el fin del ciclo de vida del producto (por obsolescencia tecnológica o reemplazo por un sistema ERP unificado corporativo), se estima un esfuerzo de cierre de 20 horas de ingeniería (S/. 700.00) destinado a las siguientes tareas técnicas obligatorias:
    *   Extracción y exportación segura de los históricos de horarios y configuraciones de Fitness en formatos abiertos (JSON/CSV).
    *   Eliminación definitiva y borrado seguro de los bancos de datos confidenciales en MongoDB Atlas, cumpliendo con las políticas éticas y legales de la Ley N° 29733.
    *   Dar de baja los servicios e infraestructura en la nube para congelar la facturación de manera definitiva.

*   **Resumen del TCO Total del Ciclo de Vida (Desarrollo + Año 1 Operación + Soporte + Retiro):** S/. 21,530.00.

## 8. Reporte de Medio Ambiente y Sostenibilidad (Green Software)

### 8.1. Sensibilización del Impacto Ambiental del Software Moderno

#### 8.1.1. Huella de Carbono en Servidores, Redes y Dispositivos Cliente
La industria global del software y los centros de datos genera un impacto ambiental equivalente o superior al del sector de la aviación comercial debido al consumo incesante de energía eléctrica. En la arquitectura web moderna de Planner-UC, la huella de carbono digital se distribuye de manera invisible en tres segmentos críticos del ecosistema tecnológico:

*   **Servidores de Cómputo (Backend y Base de Datos):** El procesamiento intensivo de los bucles iterativos del algoritmo genético en Node.js y las consultas recurrentes a MongoDB Atlas exigen un trabajo constante de las unidades de procesamiento (CPU), demandando energía de los centros de datos que a menudo dependen de fuentes no renovables.
*   **Redes de Transmisión:** Cada payload o transferencia de datos JSON pesada y sin comprimir viaja a través de enrutadores, cables submarinos y antenas de telecomunicaciones, consumiendo electricidad por cada gigabyte transferido en la red.
*   **Dispositivos Cliente (Frontend):** La renderización de interfaces complejas y el procesamiento de scripts en el navegador del estudiante o coordinador consumen la energía de la batería o la red eléctrica de sus computadoras y teléfonos móviles, impactando directamente en la huella de carbono del consumidor final.

---

### 8.2. Métrica y Auditoría Ecológica de la Aplicación

#### 8.2.1. Sistema de Medición Implementado con la Librería CO2.js
Para cuantificar y auditar de forma científica el impacto ecológico de Planner-UC, el equipo integró la librería de código abierto **CO2.js** (desarrollada por *The Green Web Foundation* bajo el paquete `@tgwf/co2`). El software emplea el modelo matemático de diseño web sostenible (*Sustainable Web Design - SWD*), el cual calcula los gramos de dióxido de carbono ($CO_2$) equivalentes generados por cada visita basándose en los bytes transferidos por la red y la intensidad de carbono promedio de la red eléctrica. 

Esta auditoría se automatizó mediante un script de telemetría durante las fases de control de calidad, midiendo los bytes de datos transmitidos en un ciclo completo de navegación (autenticación, selección de 22 créditos de asignaturas, ejecución del motor de optimización y renderizado de la grilla de horarios).

#### 8.2.2. Cuadro Comparativo de Emisiones "Antes versus Después" de Optimizar
A lo largo de las iteraciones, el equipo aplicó técnicas avanzadas de ecoeficiencia de software (*Green IT*) para optimizar el rendimiento y mitigar la contaminación digital. Las estrategias implementadas incluyeron la activación de compresión Gzip en la API de Express, la configuración de cabeceras de caché HTTP (evitando llamadas repetitivas al clúster de MongoDB), proyecciones estrictas de atributos mediante el método `.select()` y la división de código mediante *Lazy Loading* (`React.lazy` y `Suspense`) en el cliente React.

A continuación, se presenta la matriz analítica que detalla el ahorro de carbono real alcanzado tras las optimizaciones, validando formalmente una **reducción del 94.7% de las emisiones estimadas**:

| Métrica de Auditoría Ambiental | Estado Inicial (Sin Optimizar) | Estado Final Liberado (Optimizado) | Impacto / Ahorro Ecológico Logrado |
| :--- | :---: | :---: | :--- |
| **Peso total de datos transferidos** | 1,510.42 KB | 79.25 KB | Reducción drástica del 94.75% en tráfico de red. |
| **Emisión de CO2 por solicitud única** | 0.001049 gramos | 0.000055 gramos | Mitigación inmediata de la huella de carbono digital. |
| **Emisión estimada por 10,000 estudiantes** | 10.49 gramos | 0.55 gramos | Ahorro neto de 9.94 gramos de CO2 por ciclo masivo. |
| **Tiempo medio de respuesta del servidor** | 2.4 segundos | 0.8 segundos | Poda algorítmica y reducción de ciclos de uso de CPU. |

## 9. Conclusiones y Criterios de Salida del Proyecto

### 9.1. Verificación de Criterios de Salida y Cumplimiento del PMV
El desarrollo de Planner-UC concluye con la validación exitosa del 100% de los requerimientos establecidos para el Producto Mínimo Viable (PMV). El sistema responde de manera eficiente a las necesidades operativas de la Universidad Continental dentro de su modelo de currículo flexible. 

A continuación, se detalla la matriz de verificación de los criterios de salida del proyecto:

| Criterio de Salida Evaluado | Indicador de Éxito Planificado | Resultado Real Alcanzado | Estado de Cumplimiento |
| :--- | :--- | :--- | :--- |
| **Resolución del Problema CSP** | Generación de horarios con cero cruces de docentes, alumnos y aulas. | El motor genético resuelve los solapamientos espaciotemporales en todas las simulaciones. | **Cumplido al 100%** |
| **Control Administrativo** | Validación estricta del rango de 20 a 22 créditos y prerrequisitos. | El backend bloquea solicitudes fuera de rango y el frontend lo restringe de forma reactiva. | **Cumplido al 100%** |
| **Eficiencia de Rendimiento** | Tiempo de procesamiento menor a 2.0 segundos en el servidor. | El algoritmo converge y entrega el JSON de horarios en un tiempo medio de **0.8 segundos**. | **Superado con Éxito** |
| **Aseguramiento de Calidad (QA)** | Cobertura global de pruebas unitarias e integrales mayor al 85%. | Suite automatizada en Jest y Cypress certifica un **89.4% de cobertura de código**. | **Superado con Éxito** |
| **Sostenibilidad Ambiental** | Reducción medible del consumo y emisiones de carbono de la aplicación. | Auditoría ecológica con CO2.js demuestra una **reducción del 94.7% de CO2**. | **Superado con Éxito** |

---

### 9.2. Estado Final del Repositorio de Código y Línea Base Técnica
El proyecto se declara cerrado técnicamente bajo un estado de alta madurez de ingeniería y congelamiento de configuración. La línea base del software ha sido consolidada bajo las siguientes especificaciones definitivas:

*   **Estado del Repositorio en GitHub:** Todas las ramas de características (*Feature Branches*) han sido revisadas, aprobadas mediante Pull Requests cruzados y fusionadas de manera limpia a la rama principal. La rama `main` se encuentra bloqueada, libre de errores (*bugs* críticos corregidos) y con un historial de commits semánticos transparente que evidencia la coorganización equitativa de **Miguel, Alain, Erick y Tony**.
*   **Línea Base Tecnológica Homologada (Versión 3.0.0):**
    *   *Frontend:* Desarrollado en React.js v18 sobre el entorno de construcción Vite v6.0.10, utilizando CSS Grid nativo para el renderizado responsivo.
    *   *Backend:* Servidor asíncrono estructurado en Node.js v22.20.0 y Express.js con middlewares de compresión Gzip, seguridad JWT y validaciones criptográficas.
    *   *Base de Datos:* Modelo de persistencia documental optimizado e indexado en MongoDB Atlas de almacenamiento flexible.
*   **Criterio de Salida de Configuración:** Toda la documentación técnica interna, scripts de inicialización, variables de entorno de ejemplo y manuales de despliegue han sido versionados en el archivo `README.md` del repositorio. El código fuente es completamente auditable, reproducible y se encuentra listo para la sustentación oral final del Consolidado 2.

