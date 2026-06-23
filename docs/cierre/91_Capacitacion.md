# 📖 Documentación de Capacitación y Transferencia Técnica
## Proyecto: Planner-UC (Sistema de Horarios Académicos)

Este documento sirve como manual de capacitación para usuarios finales (estudiantes) y guía de operaciones/mantenimiento técnico para el equipo de TI que heredará la administración y el soporte del sistema **Planner-UC**.

---

## 👨‍🎓 1. Manual del Usuario Final (Estudiante)

El sistema **Planner-UC** permite a los estudiantes de la Universidad Continental generar un horario académico libre de conflictos de forma rápida y sencilla.

### Paso 1: Selección de Cursos
1. Ingrese a la aplicación web. En la sección superior verá el panel **"Selección de Asignaturas"**.
2. Seleccione las casillas de los cursos que desea matricularse.
3. Observe el contador de créditos en la esquina superior derecha:
   *   El texto estará en **rojo** si tiene menos de 20 créditos o más de 22 créditos.
   *   El texto cambiará a **verde** cuando cumpla con el rango estricto de **20 a 22 créditos** (Regla de Negocio).
   *   El botón **"Generar Horario Óptimo"** se habilitará solo cuando la suma de créditos sea válida.

### Paso 2: Generación del Horario
1. Haga clic en **"Generar Horario Óptimo"**.
2. El sistema enviará la selección al motor evolutivo en el backend y, en menos de un segundo, renderizará la grilla de horarios.
3. Verá el valor de **Fitness** en pantalla (por ejemplo, *Fitness: 1.0000* indica un horario perfecto libre de conflictos).

### Paso 3: Lectura de la Grilla de Calendario
*   Las clases se muestran distribuidas de Lunes a Sábado en las franjas institucionales estándar.
*   Si una materia tiene un bloque continuo (como los cursos de 3 créditos que duran 3 horas continuas), verá que las celdas se **fusionan visualmente** con un borde izquierdo azul, mostrando el NRC, el nombre de la asignatura, el aula asignada y el docente.
*   El sistema respeta estrictamente los **11 minutos de transición** entre bloques de clases.

---

## 🛠️ 2. Guía de Instalación y Despliegue Técnico

Esta sección está destinada al personal de infraestructura de TI para el despliegue del sistema localmente o en un entorno de servidor.

### Requisitos del Sistema
*   **Node.js:** Versión 22.0.0 o superior.
*   **Base de datos:** MongoDB Atlas (o instancia de MongoDB local).

### Configuración del Backend
1. Navegue al directorio `backend/`.
2. Cree un archivo `.env` en la raíz del backend con los siguientes parámetros:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/planner-uc
   ```
3. Instale las dependencias de red:
   ```bash
   npm install
   ```
4. Realice la siembra inicial de cursos de prueba en la base de datos:
   ```bash
   node seed.js
   ```
5. Inicie el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   *El backend estará disponible en `http://localhost:3000`.*

### Configuración del Frontend
1. Navegue al directorio `frontend/`.
2. Instale las dependencias del cliente React:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en `http://localhost:5173`.*

---

## 📈 3. Guía de Operaciones y Mantenimiento (Green Dashboard)

Planner-UC implementa un panel de control ecológico para auditar la huella de carbono del software en tiempo real.

```
       Módulos del Sistema y Flujo de Medición Ecológica
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Frontend Cliente] ────Petición HTTP (Gzip)───> [Backend]   │
│                                                     │       │
│  [Métricas en BD] <──Guardado CO2.js── [Express Middleware] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Acceso al Dashboard de Impacto Ambiental
1. Abra su navegador e ingrese a: `http://localhost:3000/environmental-impact`.
2. El panel mostrará las siguientes métricas clave:
   *   **Total de Solicitudes:** Cantidad de consultas de red procesadas.
   *   **CO₂ Total Generado:** Consumo acumulado expresado en gramos de CO₂ (calculado en base al peso de las respuestas HTTP comprimidas).
   *   **CO₂ Promedio:** Eficiencia por solicitud.
   *   **Tabla de Auditoría:** Lista histórica detallando Fecha, Método, Ruta, Estado HTTP, Tiempo de respuesta (ms) y Bytes transferidos.

### Mantenimiento de Aulas y Datos
*   Si requiere agregar o modificar las aulas disponibles para la generación aleatoria, edite el constructor de la clase `GeneticEngine` en el archivo [genetic.js](../../../backend/src/engine/genetic.js#L3-L4):
    ```javascript
    this.aulas = ['A101', 'B202', 'J205', 'M202', 'L105', 'K302', 'NUEVA_AULA'];
    ```
*   Para actualizar el catálogo de cursos, agregue registros en la base de datos de MongoDB Atlas bajo la colección `cursos` siguiendo el esquema definido en `Schemas.js`.
