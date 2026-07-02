# 📝 Registro de Defectos (Defect Log)
## Proyecto: Planner-UC (Sistema de Horarios Académicos)

Este registro técnico detalla los bugs y fallas de software encontrados durante las etapas de pruebas unitarias, de integración y de usuario, especificando su gravedad, la solución implementada y su verificación final.

---

### 📊 Tabla de Registro de Defectos

| ID | Defecto Encontrado | Componente | Severidad | Estado | Descripción y Causa Raíz | Solución Aplicada | Validación |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **DEF-01** | **Transferencia de datos pesada en `/api/cursos`.** La respuesta del endpoint enviaba campos internos de MongoDB (`__v`, IDs innecesarios) y no estaba comprimida, inflando los bytes transferidos (2904 Bytes). | Backend (API) | Alta | **Validado** | Se realizaba una consulta `Curso.find()` completa sin proyecciones y faltaba middleware de compresión Gzip. | Se aplicó `.select('nombre codigo creditos').lean()` en [server.js](../../../backend/server.js#L60) y se activó el middleware `compression()`. | Reducción del tamaño a **373 Bytes** (ahorro del 87.1%). |
| **DEF-02** | **Caída del servidor por cuerpo de petición vacío.** Si la petición POST a `/api/horarios/generar` no enviaba el arreglo de cursos, el servidor Express caía debido a una excepción no controlada (`cannot read properties of undefined`). | Backend (Controlador) | Crítica | **Validado** | Falta de control de guardas y validación de entrada en el controlador de generación. | Se implementó una verificación de existencia `if (!cursos \|\| cursos.length === 0)` en [horarioController.js](../../../backend/controllers/horarioController.js#L8) retornando un estado `400 Bad Request`. | Verificado en la suite de pruebas unitarias y manuales de Postman. |
| **DEF-03** | **Duplicación de celdas en fusión de horarios.** En cursos de 3 créditos (dictados en bloques de 3 horas seguidas), la vista del calendario en React renderizaba dos tarjetas de curso separadas en lugar de fusionarlas en un bloque visual continuo. | Frontend (UI) | Media | **Validado** | La lógica en `ScheduleGrid` no comprobaba si la celda anterior pertenecía a la misma asignatura antes de pintar el contenedor. | Se implementó una lógica de fusión que evalúa si la asignatura actual es continuación de la celda de la franja anterior en [ScheduleGrid.jsx](../../../frontend/src/components/ScheduleGrid.jsx#L103). | Validado visualmente en el navegador, fusionando los bloques de 3 horas correctamente. |
| **DEF-04** | **Excepciones no capturadas en el middleware de CO₂.** Si la ruta solicitada era `/environmental-impact`, el tracker ambiental intentaba guardar la métrica en MongoDB Atlas, generando un bucle infinito de escrituras/lecturas de red. | Backend (Middleware) | Crítica | **Validado** | El middleware no filtraba la ruta propia del dashboard de monitoreo ecológico. | Se agregó un condicional en [environmentalTracker.js](../../../backend/middlewares/environmentalTracker.js#L40) para ignorar mediciones en la ruta `/environmental-impact`. | Verificado mediante la prueba automatizada [environmental.test.js](../../../backend/tests/environmental.test.js#L59). |

---

### 🧪 Conclusión del Control de Calidad de Software

*   **Tasa de Resolución de Defectos:** **100%**. Todos los defectos críticos y de alta prioridad fueron corregidos, probados e integrados.
*   **Estándares de Calidad Aplicados:** Las soluciones aplicadas mitigaron vulnerabilidades y mejoraron el cumplimiento de **ISO/IEC 25010** (eficiencia de rendimiento y robustez de código) y **Green Software** (reducción drástica de transferencia de datos en red y CPU en BD).
