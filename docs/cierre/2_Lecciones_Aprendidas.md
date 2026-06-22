# INFORME FINAL DE LECCIONES APRENDIDAS

## 1. Introducción y Marco de Trabajo de la Retrospectiva

### 1.1. Propósito del Informe de Cierre Ágil
El presente documento constituye el registro formal de la retrospectiva final del proyecto **Planner-UC**, elaborado tras la culminación del Producto Mínimo Viable (PMV) para la Universidad Continental. En el desarrollo de software moderno bajo metodologías ágiles, la entrega del producto técnico representa solo una dimensión del éxito; la otra dimensión crítica radica en la capitalización del conocimiento adquirido a través de la experiencia directa.

El propósito fundamental de este informe de cierre ágil es doble:
*   **Identificación de Patrones Técnicos y Operativos:** Analizar de forma crítica las decisiones de ingeniería, los cuellos de botella en el flujo de trabajo y las estrategias de mitigación implementadas para consolidar un marco de buenas prácticas transferibles a futuros proyectos.
*   **Evaluación del Factor Humano y Colaborativo:** Examinar la dinámica de autoorganización del equipo Scrum, la efectividad en la comunicación interregional y el manejo adaptativo ante los cambios en las reglas de negocio, transformando los errores detectados en activos de aprendizaje experiencial.

---

### 1.2. Metodología de Evaluación del Equipo (Scrum Retrospective)
Para extraer lecciones aprendidas objetivas y evitar sesgos individuales, el equipo (compuesto por **Miguel, Alain, Erick y Tony**) implementó la técnica estructurada de la **Estrella de Mar (*Starfish Retrospective*)**, adaptada al cierre definitivo del ciclo de vida del software. Esta dinámica divide el análisis en cinco cuadrantes operativos que evalúan tanto las prácticas técnicas como las de coorganización:

| Cuadrante de la Retrospectiva | Enfoque Evaluado en Planner-UC | Objetivo en la Ingeniería del Proyecto |
| :--- | :--- | :--- |
| **1. Comenzar a hacer (*Start Doing*)** | Prácticas que el equipo no realizó pero que se identificaron como necesarias en las fases críticas de QA. | Integrar contratos de API rígidos (Postman/Swagger) desde el día uno y automatizar la telemetría de CO2.js de forma continua. |
| **2. Dejar de hacer (*Stop Doing*)** | Actividades que generaron ineficiencia, retrasos en los Sprints o deuda técnica. | Detener la inserción de código con formatos complejos (como LaTeX) directos al previsualizador de Markdown y el testeo manual redundante. |
| **3. Hacer menos (*Less Of*)** | Prácticas que aportaron valor pero que se sobreutilizaron, consumiendo tiempo excesivo de desarrollo. | Reducir el debate prolongado sobre la parametrización inicial del algoritmo genético en reuniones diarias sin contar con datos empíricos. |
| **4. Hacer más (*More Of*)** | Acciones exitosas que demostraron alta eficiencia y que deben potenciarse. | Incrementar las revisiones cruzadas de código (*Pull Requests*) y la estandarización de commits semánticos en el repositorio de GitHub. |
| **5. Seguir haciendo (*Keep Doing*)** | Elementos centrales que funcionaron a la perfección y sostuvieron la calidad del PMV. | Mantener la persistencia flexible en MongoDB Atlas y el modelado responsivo modular con CSS Grid en la interfaz de React.js. |

## 2. Lecciones Aprendidas en la Gestión del Tiempo y Planificación (Scrum)

### 2.1. Gestión del Product Backlog e Historias de Usuario
La administración del Product Backlog de Planner-UC enseñó al equipo el valor de la granularidad y la definición estricta de las reglas de negocio desde las fases tempranas del ciclo de vida del software:

*   **El Riesgo de la Ambigüedad Inicial:** Durante el Sprint 1 y Sprint 2, algunas historias de usuario relacionadas con la selección de asignaturas se redactaron de forma muy general. Esto provocó malentendidos entre el equipo de Frontend (**Alain y Erick**) y el de Backend (**Miguel y Tony**), retrasando la integración de la carga de créditos del alumno.
*   **Lección Aprendida - Criterios de Aceptación Técnicos:** El equipo aprendió que una historia de usuario no está completa si no incluye criterios de aceptación técnicos y auditables. La inclusión explícita de reglas como la validación estricta de los 20-22 créditos o los 11 minutos de transición docente en el Backlog evitó que se desarrollaran funcionalidades fuera de los estándares institucionales de la Universidad Continental.
*   **Refinamiento Adaptativo (*Backlog Refinement*):** Ante la llegada de cambios drásticos en las reglas de negocio a mitad del proyecto (como las restricciones por bajo rendimiento académico de la regla RF-04), el equipo entendió que el Backlog debe ser un elemento vivo. El reordenar y descomponer historias complejas en tareas más pequeñas salvó el proyecto de un colapso en el alcance (*Scope Creep*).

---

### 2.2. Estimación del Esfuerzo versus Capacidad Real del Equipo (Velocity)
Uno de los aprendizajes más profundos en la gestión ágil del proyecto fue la estabilización de la velocidad de desarrollo (*Velocity*) frente a estimaciones inicialmente excesivamente optimistas:

| Métrica de Planificación Evaluada | Sprint 1 (Cimientos) | Sprint 2 (Motor CSP) | Sprint 3 (Interfaz) | Sprint 4 (QA y Cierre) |
| :--- | :---: | :---: | :---: | :---: |
| **Puntos de Historia Estimados** | 30 | 45 | 35 | 25 |
| **Puntos de Historia Completados**| 24 | 38 | 35 | 28 |
| **Velocidad Real del Equipo** | 80.0% | 84.4% | 100.0% | 112.0% |

*   **Subestimación de la Complejidad Algorítmica:** En las primeras iteraciones, el equipo pecó de optimismo al estimar el esfuerzo del motor genético. Se asumió que la función de Fitness se codificaría linealmente, lo que causó un retraso de 6 puntos de historia no terminados en el Sprint 1 que se arrastraron al Sprint 2.
*   **Maduración de la Estimación:** A partir del Sprint 3, utilizando la técnica de *Planning Poker*, el equipo aprendió a calibrar sus estimaciones basándose en datos empíricos de los sprints previos. Esto permitió que en la última fase (Sprint 4) se absorbieran de forma eficiente las 12 horas adicionales provocadas por los cambios adaptativos del software, logrando una velocidad real superior a la planificada.

---

### 2.3. Efectividad de las Ceremonias Ágiles (Daily, Sprint Planning y Review)
Las reuniones o ceremonias de Scrum demostraron ser el motor que sostuvo el ritmo de trabajo incremental, aunque sufrieron una evolución crítica a lo largo de las semanas:

*   **Sprint Planning (Planificación del Sprint):** Inicialmente, el equipo extendía estas reuniones por más de dos horas debatiendo sobre la lógica interna del algoritmo genético sin tener la base de datos configurada. La lección aprendida fue enfocar la reunión estrictamente en la selección de metas del sprint (*Sprint Goals*) y el desglose de tareas concretas, delegando los debates de arquitectura a sesiones técnicas específicas.
*   **Daily Standup (Reunión Diaria):** Al operar en un entorno interregional, las reuniones diarias corrieron el riesgo de volverse mecánicas o limitarse a un reporte de estado pasivo. El equipo corrigió esto enfocando la sesión exclusivamente en los impedimentos y cuellos de botella. Por ejemplo, la rápida detección de incompatibilidades de entorno entre Jest y Vitest en el Sprint 4 se mitigó en un par de días gracias a la alerta temprana en un Daily.
*   **Sprint Review y Retrospective (Revisión y Retrospectiva):** Estas reuniones fueron vitales para mantener la transparencia con respecto al Producto Mínimo Viable. Mostrar los incrementos funcionales al final de cada sprint (como el Dashboard con CSS Grid renderizado en el Sprint 3) permitió al Product Owner validar el cumplimiento de los estándares de accesibilidad e impacto de Green Software en tiempo real, garantizando un control de calidad constante antes del cierre definitivo.

## 3. Lecciones Aprendidas en el Desarrollo Técnico e Ingeniería de Software

### 3.1. Complejidad en el Modelado del Algoritmo Genético y Motor CSP
El diseño matemático e informático del motor de optimización inteligente en el archivo `genetic.js` representó el mayor desafío de abstracción para el equipo:

*   **El Fenómeno de la Explosión Combinatoria:** Al inicio se subestimó la densidad del problema CSP académico. Intentar validar las restricciones duras mediante un enfoque puramente iterativo lineal provocó bloqueos por consumo de memoria en el servidor Node.js. El algoritmo generaba soluciones inválidas que saturaban el bucle de ejecución.
*   **Lección Aprendida - Poda Heurística Temprana:** El equipo aprendió que no se debe delegar toda la presión selectiva a la función de Fitness. La solución técnica óptima fue inyectar un filtro lógico previo (*poda algorítmica*). Este filtro bloquea combinaciones inviables de créditos (fuera del rango de 20-22) y prerrequisitos antes de que entren a competir en el torneo genético.
*   **Sintonización de Parámetros Heurísticos:** Encontrar el equilibrio exacto entre la tasa de cruce (90%) y mutación (5%) requirió múltiples pruebas empíricas. Un exceso de mutación disolvía los horarios eficientes ya encontrados, mientras que una tasa muy baja estancaba al motor en óptimos locales inválidos. Limitar el ciclo de vida a un máximo de 300 iteraciones estables estabilizó el tiempo de cómputo en **0.8 segundos**.

---

### 3.2. Retos de Integración entre el Backend (Express) y el Frontend (React/CSS Grid)
La sincronización asíncrona de datos JSON entre el motor evolutivo en Node.js y la interfaz responsiva del estudiante en React generó fricciones técnicas críticas durante la integración:

*   **El Desafío de la Grilla Horaria Dinámica:** Mapear la matriz tridimensional devuelta por el backend hacia una grilla visual con CSS Grid provocó desajustes visuales severos en el Sprint 3. Los bloques de cursos con estructuras diferenciadas (como las asignaturas de 4 créditos divididas en 3h y 1.5h en días distintos) rompían las coordenadas de filas y columnas de la interfaz gráfica.
*   **Lección Aprendida - Normalización de Contratos JSON:** La integración exitosa exigió estandarizar un contrato de datos estricto. El backend tuvo que transformar las coordenadas complejas en identificadores de bloques estandarizados legibles por el navegador. Esto demostró al equipo que la UI de React debe ser lo más tonta y descriptiva posible, limitándose a pintar la grilla a través de estados reactivos (`useState`) sin recalcular lógica de negocio.

---

### 3.3. Dificultades en la Persistencia Flexible de Datos en MongoDB Atlas
Si bien el uso de una base de datos no relacional orientada a documentos agilizó el mapeo de mallas curriculares variables, introdujo retos severos de consistencia e integridad referencial:

*   **Pérdida de Consistencia Multiusuario:** La flexibilidad de MongoDB permitió registrar disponibilidades docentes dinámicas sin un esquema rígido. Sin embargo, en escenarios concurrentes simulados, esto generó inconsistencias asíncronas. Dos estudiantes lograban reservar la misma sección de laboratorio en milisegundos idénticos antes de que el servidor pudiera actualizar el aforo máximo en la nube.
*   **Lección Aprendida - Atomicidad e Indexación Eficiente:** El equipo descubrió que la flexibilidad documental no reemplaza la necesidad de atomicidad en transacciones críticas. La lección se consolidó al reestructurar los controladores de Mongoose, aplicando operaciones de actualización atómicas y agregando índices compuestos en los campos clave (docente, aula, franja horaria). Esto garantizó que el método `.select()` extrajera información consistente en un único viaje de red, optimizando los recursos del clúster en su tier gratuito.

## 4. Lecciones Aprendidas en el Aseguramiento de la Calidad (QA) y Estándares

### 4.1. Curva de Aprendizaje en la Suite de Pruebas Unitarias (Jest)
El proceso de implementación de pruebas unitarias en un entorno moderno basado en ES Modules y compilado con Vite introdujo complicaciones imprevistas en la configuración del entorno de desarrollo:

*   **Conflictos de Entorno y Sintaxis:** Al inicio del Sprint 4, el equipo experimentó fallas críticas al intentar ejecutar Jest en módulos que utilizaban palabras clave nativas de importación modernas (`import/export`). El entorno de pruebas arrojaba errores de sintaxis debido a la falta de un compilador intermedio configurado de forma explícita.
*   **Lección Aprendida - Estandarización de Herramientas:** Esta dificultad enseñó al equipo la importancia de aislar y documentar la infraestructura de QA. El problema se solucionó aislando un archivo `jest.config.js` independiente y configurando transformadores específicos. Gracias a esto, se estabilizaron las pruebas unitarias con simulación de datos (*mocks*), alcanzando un **89.4% de cobertura global** y demostrando que la suite de testing debe planificarse en paralelo a la arquitectura de carpetas.

---

### 4.2. Desafíos en la Implementación de Pruebas de Extremo a Extremo (Cypress)
Validar el comportamiento del sistema desde la experiencia interactiva del usuario final con Cypress requirió un esfuerzo de sincronización asíncrona avanzado:

*   **Pruebas Inestables (*Flaky Tests*):** Las primeras pruebas automatizadas de extremo a extremo fallaban de forma intermitente al simular la generación de horarios. Como el motor genético se ejecuta de manera asíncrona en el backend, Cypress intentaba evaluar la grilla visual de React antes de que el servidor Express terminara de procesar el algoritmo y devolver la respuesta JSON.
*   **Lección Aprendida - Gestión de Esperas Asíncronas:** El equipo aprendió a evitar el uso de esperas basadas en tiempos fijos en milisegundos (`cy.wait(3000)`), ya que esto introduce retrasos artificiales e ineficiencia en el pipeline de integración continua. La lección se consolidó al programar aserciones basadas en estados de carga (*spinners*) y detectar de forma reactiva la llegada del payload JSON, garantizando un entorno de pruebas robusto y determinista.

---

### 4.3. Experiencias en la Auditoría de Green Software (CO2.js) y Seguridad (OWASP)
La incorporación de estándares internacionales de ecoeficiencia y seguridad de la información cambió radicalmente la perspectiva del equipo sobre el ciclo de vida del software:

*   **Visualización de la Contaminación Digital Invisible:** Utilizar la librería CO2.js bajo el modelo *Sustainable Web Design (SWD)* sensibilizó al equipo sobre el impacto real de cada byte transmitido. El análisis base inicial arrojó que una sola petición sin optimizar transfería 1.5 MB de datos redundantes, consumiendo recursos de red innecesarios.
*   **Lección Aprendida - Optimización Sustentable y Segura:** El equipo asimiló que el rendimiento técnico está ligado a la sostenibilidad ambiental y a la seguridad informática. Al implementar compresión Gzip, proyecciones de Mongoose con el método `.select()` y carga perezosa (*Lazy Loading*), se redujo la huella de carbono en un **94.7%**. De manera simultánea, al aplicar las pautas de OWASP Top 10 para sanitizar entradas de datos y encriptar credenciales con `bcrypt`, el equipo aprendió que blindar el software contra inyecciones NoSQL también previene ciclos de CPU desperdiciados por ataques maliciosos, logrando una arquitectura limpia, sostenible y segura.

## 5. Lecciones Aprendidas en Trabajo Colaborativo y Comunicación

### 5.1. Sinergia del Equipo y Autoorganización de Roles Scrum
La adopción de una dinámica de responsabilidades Full-Stack cruzadas bajo el marco Scrum redefinió la forma en que el equipo distribuyó el esfuerzo de ingeniería:

*   **Superación de los Silos de Conocimiento:** Al inicio del proyecto, existía la tendencia natural de dividir al equipo rígidamente en dos desarrolladores para el frontend y dos para el backend. Esta separación generaba cuellos de botella cuando un integrante se retrasaba, deteniendo el avance de los demás.
*   **Lección Aprendida - Autoorganización y Apoyo Cruzado:** El equipo (compuesto por **Miguel, Alain, Erick y Tony**) descubrió que la verdadera sinergia se alcanza cuando los roles son flexibles pero las responsabilidades están claras. Aprender a asumir tareas fuera del área de especialización principal (como los desarrolladores frontend apoyando en el diseño de esquemas de MongoDB) aceleró la velocidad del equipo y garantizó un entendimiento unificado de la arquitectura del monorepositorio.

---

### 5.2. Gestión de Conflictos y Coordinación Interregional (Brecha Cultural)
Coordinar el desarrollo de Planner-UC atendiendo de forma simultánea los requerimientos de un entorno distribuido en múltiples sedes regionales introdujo retos de comunicación complejos:

*   **Desalineamiento por Asincronía:** Al operar con horarios de estudio y trabajo diferenciados entre los integrantes, las comunicaciones iniciales por canales informales eran dispersas. Esto generaba malentendidos respecto a las prioridades del Sprint, afectando el ritmo de codificación y la consistencia en el diseño de las interfaces accesibles.
*   **Lección Aprendida - Centralización y Respeto de Acuerdos:** La resolución del conflicto no requirió más reuniones, sino reuniones más efectivas. El equipo aprendió a centralizar la toma de decisiones exclusivamente en las ceremonias de Scrum (Daily, Planning y Review) y a documentar formalmente cada acuerdo en el Backlog. Esta disciplina operativa eliminó las suposiciones y unificó los criterios técnicos de aceptación, cerrando la brecha de coordinación interregional.

---

### 5.3. Buenas Prácticas y Errores en el Flujo de Trabajo de Git (GitHub Flow)
El uso de un monorepositorio expuso al equipo a situaciones de alto riesgo de pérdida de código debido a una gestión inicial deficiente de las ramas de desarrollo:

*   **Conflictos de Fusión Destructivos (*Merge Conflicts*):** Durante el Sprint 2, la falta de coordinación al subir cambios masivos en el motor genético provocó la sobrescritura Accidental de controladores en el backend. Trabajar en ramas de características de larga duración sin sincronizarlas diariamente con la rama principal `main` generaba horas de retrabajo manual para resolver conflictos de líneas de código.
*   **Lección Aprendida - Integración Temprana y Commits Semánticos:** El equipo asimiló a la fuerza que el código debe integrarse en porciones pequeñas, probadas y frecuentes. La adopción estricta de *GitHub Flow* (bloqueo de `main`, Pull Requests con revisión cruzada obligatoria de un compañero y cumplimiento de la regla de mínimo 5 commits semanales semánticos por integrante) eliminó las regresiones. Esta disciplina garantizó un historial limpio, auditable y libre de fallas en la línea base final (Versión 3.0.0).

## 6. Plan de Acción y Conclusiones

### 6.1. Matriz de Acciones de Mejora para Futuros Proyectos de Ingeniería
Como resultado de la retrospectiva final y con el objetivo de capitalizar los errores detectados para transformarlos en estándares de calidad en futuras iniciativas de desarrollo de software, el equipo consolidó la siguiente matriz de acciones concretas de mejora continua:

| Dimensión de Ingeniería | Hallazgo o Punto Crítico Detectado | Acción de Mejora Continua a Implementar | Indicador de Éxito / Meta Técnica |
| :--- | :--- | :--- | :--- |
| **Arquitectura de Software** | Inconsistencia de datos JSON al integrar capas sin un diseño de contratos previo. | Diseñar y congelar contratos de API utilizando herramientas de documentación técnica antes de codificar. | Cero incidencias por desalineación de payloads JSON en la fase de integración. |
| **Gestión de Configuración** | Retrabajo manual masivo debido a ramas de larga duración y conflictos de fusión en Git. | Implementar integraciones de código diarias e imponer revisiones cruzadas de Pull Requests en menos de 24 horas. | Reducción del tiempo de resolución de conflictos de ramas a menos de 10 minutos. |
| **Aseguramiento de Calidad (QA)** | Inestabilidad en pruebas E2E por evaluar interfaces antes de la respuesta asíncrona de la API. | Diseñar suites de testing basadas en el manejo de estados de carga dinámicos y eventos reactivos del frontend. | Eliminación completa de pruebas inestables (*Flaky Tests*) en el pipeline de ejecución. |
| **Ingeniería de Requerimientos** | Desviación del esfuerzo debido a la ambigüedad en los criterios de aceptación del Backlog. | Exigir la especificación detallada de reglas de negocio institucionales e hitos técnicos en cada historia de usuario. | Tasa de rechazo o retrabajo de funcionalidades menor al 5% por Sprint. |

---

### 6.2. Conclusión Final sobre la Adaptabilidad y el Aprendizaje Experiencial
La construcción de **Planner-UC** consolidó la madurez técnica y profesional de **Miguel, Alain, Erick y Tony**, demostrando que la ingeniería de software moderna en entornos de alta incertidumbre y complejidad combinatoria exige un equilibrio perfecto entre rigor técnico y adaptabilidad metodológica.

El mayor valor de este proyecto no residió en la codificación lineal de un algoritmo, sino en la capacidad del equipo para responder de manera ágil ante los cambios drásticos en las reglas de negocio académicas sin degradar las directrices internacionales de calidad ISO/IEC 25010, seguridad OWASP o accesibilidad WCAG. Haber logrado optimizar una aplicación web reduciendo en un **94.7% su huella de carbono digital** e incrementando la cobertura de pruebas al **89.4%** evidencia que la mentalidad ágil basada en el aprendizaje experiencial faculta al ingeniero de sistemas para transformar los conflictos técnicos en soluciones de software de alto impacto global, sostenibles y centradas en el usuario.
