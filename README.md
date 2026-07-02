# 🧠 Sistema de Generación Óptima de Horarios Académicos - Planner-UC

Este proyecto corresponde al **Proyecto de Fin de Asignatura (PFA)** del curso *Taller de Proyectos 2* de la Universidad Continental. El sistema aborda un problema complejo de ingeniería: la generación de horarios en entornos de currículo flexible, caracterizado por una alta combinatoria y múltiples restricciones.

---

## 👥 Integrantes del Equipo
- **Miguel Angel Castillo Rojas**
- **Alain Aliaga Eulogio**
- **Ulloa Alvinagorta Tony**

---

## 📝 Tabla de Contenido
1. [Descripción del Sistema](#-descripción-del-sistema)
2. [Problemática Abordada](#-problemática-abordada)
3. [Justificación del PMV](#-justificación-del-pmv)
4. [Enfoque de Resolución](#-enfoque-de-resolución)
5. [Reglas del Sistema](#-reglas-del-sistema)
6. [Arquitectura del Sistema](#-arquitectura-del-sistema-mern-stack)
7. [Instalación y Ejecución](#%EF%B8%8F-instalación-y-ejecución)
8. [Instrucciones de Build y Despliegue](#-instrucciones-de-build-y-despliegue)
9. [Testing y Métricas Cuantitativas](#-testing-y-métricas-cuantitativas)
10. [Video Explicativo](#-video-explicativo)
11. [Documentación Completa del Proyecto](#-documentación-completa-del-proyecto)
12. [Entregables Finales del Proyecto](#-entregables-finales-del-proyecto)

---

## Descripción del Sistema
Planner-UC es un sistema web reactivo que genera horarios académicos óptimos garantizando el cumplimiento de restricciones académicas, la eliminación de conflictos de infraestructura y la optimización del tiempo de los estudiantes.

El problema se modela formalmente como un:
**Constraint Satisfaction Problem (CSP)**

Y se resuelve mediante un motor evolutivo de contingencia:
**Algoritmo Genético (GeneticEngine)**

---

## 🔍 Problemática Abordada
La planificación manual de horarios en entornos curriculares flexibles genera una alta complejidad debido a la gran cantidad de restricciones físicas y lógicas. Los estudiantes se enfrentan frecuentemente a cruces de asignaturas, traslados físicos apresurados entre bloques de clase sin márgenes de tiempo adecuados y una oferta horaria atomizada, lo que genera ineficiencia administrativa en la ocupación de aulas y pérdida de autonomía en la autogestión de las matrículas estudiantiles.

---

## 💡 Justificación del PMV
Planner-UC se construye como un Producto Mínimo Viable (PMV) de software web moderno para resolver este problema de optimización mediante un motor computacional adaptativo. La solución automatiza la búsqueda de combinaciones perfectas de horarios, asegurando un tiempo de respuesta menor a un segundo. El sistema elimina los solapamientos de clases de manera predictiva, respeta el intervalo de descanso obligatorio entre asignaturas y maximiza el uso eficiente del espacio físico de la infraestructura universitaria.

---

## Enfoque de Resolución

### Modelado del Problema (CSP)
El sistema implementa el modelo matemático **CSP = (X, D, C)** de forma dinámica:
*   **X (Variables):** Cursos seleccionados por el usuario desde la interfaz del Frontend.
*   **D (Dominios):** Secciones y horarios disponibles recuperados en tiempo real desde **MongoDB Atlas**.
*   **C (Restricciones):** Reglas académicas, temporales y de recursos que actúan directamente sobre la función de fitness.

### Flujo de Datos (Arquitectura de Información)
1. **Captura (X):** El estudiante selecciona los cursos; React valida en tiempo real el rango permitido de créditos.
2. **Inyección (D):** Node.js extrae de la base de datos distribuida los horarios, docentes y las 17 aulas asignadas a cada sección.
3. **Procesamiento (C):** El **GeneticEngine** aplica la lógica de penalización heurística para encontrar el individuo con **Fitness = 0** (solución perfecta).
4. **Renderizado:** Los datos optimizados fluyen al componente `ScheduleGrid.jsx` para plasmar el calendario interactivo con celdas fusionadas visualmente.

### Algoritmo Genético
*   **Representación:** Cada individuo dentro de la población representa un horario completo (*Curso -> Sección*).
*   **Función de Fitness:** Maximizar la viabilidad del horario minimizando solapamientos, conflictos de aula/docente y violaciones de márgenes de tiempo.
*   **Operadores:** Selección por Torneo, Cruce de soluciones (Crossover) y Mutación aleatoria de secciones.
*   **Criterio de Parada:** Alcance máximo de **2000 generaciones** o convergencia total previa (**Green Software**).

---

## Reglas del Sistema

### Restricciones Duras (Obligatorias)
*   **Margen de Transición:** Intervalo mínimo obligatorio de **11 minutos** entre sesiones de clase consecutivas.
*   **Estructura de Bloques:** Sesiones estándar estructuradas en módulos de **90 minutos**.
*   **Carga Académica Regular:** Rango estricto de **20-22 créditos** para la auto-matrícula por asistente genético.
*   **Ventana Operativa Campus:** Franja horaria institucional de 07:00 AM a 10:00 PM.
*   **Exclusividad:** Cero solapamiento de Horario, Docente o Aula física en simultáneo.

### Restricciones Blandas (Deseables)
*   Minimizar "huecos" o ventanas muertas de tiempo entre clases para el estudiante.
*   Evitar horarios extremos y agrupar sesiones didácticas en días contiguos.

---

## Arquitectura del Sistema (MERN Stack)
*   **Frontend (Cliente):** React.js (Vite) + CSS Grid nativo para el renderizado del calendario.
*   **Backend (Servidor de API):** Node.js + Express.js con middlewares de compresión Gzip.
*   **Base de Datos:** MongoDB Atlas utilizando Mongoose ODM para el control estricto de esquemas.
*   **Infraestructura:** Despliegue optimizado para bajo consumo de recursos en transferencia de red.

---

## Instalación y Ejecución

### Requisitos Previos
*   Node.js v22.20.0 (LTS) o superior.
*   Instancia o clúster activo en MongoDB Atlas.

### Backend
```bash
cd backend
npm install
npm run dev
```
*EL servidor backend Levantará en la red en `http://Localhost:3000`.*

### Frontend
```bash
cd frontend
npm install
npm run dev
```
*La interfaz gráfica de usuario estará disponible en `http://Localhost:5173`.*

---

## 🚀 Instrucciones de Build y Despliegue

### Construcción del Proyecto (Build)
Para compilar y empaquetar el frontend optimizado para producción con Vite:
```bash
cd frontend
npm run build
```
Los archivos optimizados se generarán dentro de la carpeta `frontend/dist`.

### Despliegue Técnico
El directorio estático `/dist` se puede desplegar en plataformas de alojamiento web (Vercel, Netlify). El servidor de Express en la carpeta `backend/` se despliega en servicios en la nube (Render, Railway), asegurando la configuración de la variable de entorno para `MONGO_URI`.

---

## Testing y Métricas Cuantitativas
Se implementaron suites de pruebas automatizadas unitarias con **Jest** e integrales con **Cypress** para validar la función de fitness y el cumplimiento de las restricciones lógicas.

```bash
# Ejecución de pruebas unitarias
npm test
```

*   **Tiempo Promedio de Respuesta:** 0.8 1.5 segundos por simulación.
*   **Meta del Sistema:** $< 2$ segundos bajo máxima carga combinatoria.
*   **Optimización Green IT:** Middleware con CO2.js para auditar el peso de respuestas HTTP y límite estricto de 2000 iteraciones genéticas para reducir el consumo de CPU.

---

## 🎥 Video Explicativo
Demostración funcional, técnica y de flujo del Producto Mínimo Viable:
*   [🎬 Ver Video ](https://youtube.com)

---


## 📂 Documentación Completa del Proyecto

Índice integral de la documentación del proyecto estructurado bajo los estándares del PMBOK y organizado mediante módulos desplegables interactivos:

<details>
<summary><b>🟢 Inicio</b></summary>
<br>

*Procesos de autorización, bases de la arquitectura y acuerdos del equipo de ingeniería.*

1. 📑 [Selección del Enfoque Metodológico](./docs/01_inicio/1_seleccion_enfoque.md)
2. 👁️ [Visión General del Proyecto PMV](./docs/01_inicio/2_vision_proyecto.md)
3. 📜 [Project Charter (Acta de Constitución)](./docs/01_inicio/3_project_charter.md)
4. 📌 [Declaración del Equipo de Trabajo](./docs/01_inicio/5_equipo_proyecto.md)
5. ⚖️ [Acta de Constitución del Equipo (Normas y Reglas)](./docs/01_inicio/8_Constitucion.md)
6. 📢 [Declaración de Trabajo (SOW Inicial)](./docs/01_inicio/9_Declaracion.md)
</details>

<details>
<summary><b>🟡 Planificación</b></summary>
<br>

*Gestión formal del alcance de la ingeniería, cronogramas, presupuestos y reglas de negocio.*

1. 📋 [Registro de Supuestos y Restricciones](./docs/02_planificacion/4_supuestos_restricciones.md)
2. 🎯 [Product Backlog (Historias de Usuario)](./docs/02_planificacion/6_product_backlog.md)
3. 📑 [Lista de Requerimientos Iniciales (RF/RNF)](./docs/02_planificacion/7_lista_requerimientos.md)
4. 🚀 [Nuevos Requerimientos](./docs/02_planificacion/7.1_nuevos_requerimientos_v2.md)
5. 💵 [Plan de Presupuesto del Proyecto](./docs/02_planificacion/8_presupuesto_del_proyecto.md)
6. ⚠️ [Registro Estático de Riesgos Iniciales](./docs/02_planificacion/9_registro_riesgos.md)
</details>

<details>
<summary><b>🔵 Ejecución</b></summary>
<br>

*Informes técnicos de construcción, especificación de algoritmos y modelado de datos MERN.*

1. 🏗️ [Informe Técnico Base del Prototipo](./docs/03_ejecucion/10_informe_tecnico.md)
2. 🧠 [Documentación del Motor Heurístico y Agentes](./docs/03_ejecucion/Agents.md)
3. 💻 [Reporte de Arquitectura e Implementación del Sistema](./docs/03_ejecucion/reporte_implementacion.md)
4. 📘 [Especificación Formal del Problema CSP (Spec)](./docs/03_ejecucion/Spec.md)
</details>

<details>
<summary><b>🟠 Seguimiento y Control</b></summary>
<br>

*Métricas cuantitativas verificables de control de código, QA ágil y auditoría Green IT.*

1. 🌱 [Reporte de Sostenibilidad Ecológica (CO2.js)](./docs/04_seguimiento_control/2_green_software.md)
2. 🚨 [Matriz de Monitoreo Activo de Riesgos](./docs/04_seguimiento_control/3_Registros_Riesgos.md)
3. 📊 [Reporte Cuantitativo de Pruebas (Jest & Cypress)](./docs/04_seguimiento_control/3_reporte_pruebas.md)
4. 💥 [Bitácora de Control de Incidentes y Cambios](./docs/04_seguimiento_control/4_Incidentes.md)
5. 🚧 [Registro Ágil de Impedimentos y Bloqueos](./docs/04_seguimiento_control/5_Impedimentos.md)
6. 🐛 [Registro de Defectos y Bugs de Testing](./docs/04_seguimiento_control/6_Registro_Defectos.md)
7. 📉 [Análisis Completo de Calidad y Cobertura de Código](./docs/04_seguimiento_control/analis_completo.md)
8. 👥 [Evaluación de Usabilidad mediante Instrumento SUS](./docs/04_seguimiento_control/SUS_Instrumento.md)
</details>

<details>
<summary><b>🔴 Cierre</b></summary>
<br>

*Manuales organizados por destinatario, guías operativas e informe final de lecciones aprendidas.*

1. 🏁 [Informe Final de Cierre del Proyecto](./docs/05_cierre/1_Informe_Final.md)
2. 🧠 [Informe Final de Lecciones Aprendidas del Equipo](./docs/05_cierre/2_Lecciones_Aprendidas.md)
3. 🎓 [Documentación de Capacitación y Manuales por Perfil](./docs/05_cierre/91_Capacitacion.md)
</details>

---

### 🎓 Entregables Finales del Proyecto

Acceso directo a los componentes clave que consolidan el cierre de gestión y transferencia técnica del sistema:

1. 📑 [Informe Final del Proyecto](./docs/05_cierre/1_Informe_Final.md)
2. 🧠 [Informe Final de Lecciones Aprendidas](./docs/05_cierre/2_Lecciones_Aprendidas.md)
3. ⚠️ [Registro de Riesgos](./docs/04_seguimiento_control/3_Registros_Riesgos.md)
4. 💥 [Registro de Incidentes o Problemas](./docs/04_seguimiento_control/4_Incidentes.md)
5. 🚧 [Registro de Impedimentos](./docs/04_seguimiento_control/5_Impedimentos.md)
6. 🐛 [Registro de Defectos](./docs/04_seguimiento_control/6_Registro_Defectos.md)
7. 📋 [Registro de Supuestos y Restricciones](./docs/02_planificacion/4_supuestos_restricciones.md)
8. 📜 [Acta de Constitución del Equipo](./docs/01_inicio/8_Constitucion.md)
9. 📢 [Declaración de Trabajo](./docs/01_inicio/9_Declaracion.md)
10. 🎓 [Documentación de Capacitación](./docs/05_cierre/91_Capacitacion.md)

---

📊 **Herramientas de Gestión:** [Tablero Jira Software](https://atlassian.net)  
🏫 **Taller de Proyectos 2 - Universidad Continental**
