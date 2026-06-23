# REGISTRO DE IMPEDIMENTOS (BLOCKERS LOG)
**Proyecto:** Sistema de Optimización y Gestión Académica  
**Estado Actual de los Ítems:** Solucionados / Removidos

---

## 1. Definición y Alcance
Este registro detalla los impedimentos críticos (factores externos, limitaciones técnicas o bloqueos de lógica de negocio) que detuvieron temporalmente el flujo de desarrollo, afectaron el rendimiento del sistema o pusieron en riesgo el cumplimiento de las metas del sprint. Todos los puntos listados a continuación han sido levantados con éxito.

---

## 2. Matriz de Impedimentos y Obstáculos

| ID | Tipo de Impedimento | Descripción del Obstáculo | Impacto en el Proyecto | Estrategia de Resolución / Estado |
| :--- | :--- | :--- | :--- | :--- |
| **IMP-01** | **Técnico / QA** | Falla crítica en la redirección asíncrona hacia la ruta de administración tras recargar la página por pérdida de persistencia de sesión. | Bloqueo en las pruebas de flujo de usuario del Administrador y fallos en la experiencia de usuario (UX). | **Removido.** Se implementó limpieza explícita de `localStorage` y manejo reactivo de estados de sesión. |
| **IMP-02** | **Lógica de Negocio** | Desalineación y discrepancia en los datos de los estados financieros evaluados de forma simultánea entre los roles de Administrador y Estudiante. | Inconsistencia de datos en reportes financieros y bloqueos en las pruebas de integración multiusuario. | **Removido.** Refactorización de la capa de acceso a datos (DAL) para garantizar consistencia en tiempo real. |
| **IMP-03** | **Herramientas de Entorno** | Conflicto de sintaxis y dependencias cruzadas al intentar integrar la suite de pruebas de `Jest` con el entorno de `Vitest`. | Detención completa de las pruebas automatizadas y del reporte de cobertura de código (Code Coverage). | **Removido.** Estandarización de importaciones y aislamiento de entornos mediante un archivo `jest.config.js` externo. |
| **IMP-04** | **Rendimiento / Red** | Saturación de peticiones innecesarias al servidor por consultas redundantes a `/api/cursos` y peticiones huérfanas al `/favicon.ico`. | Degradación del rendimiento del servidor backend, consumo innecesario de ancho de banda y ruido en los logs de auditoría. | **Removido.** Implementación de caché (cabeceras `Cache-Control` / 304) y endpoint dedicado `204 No Content` para silenciar el favicon. |
| **IMP-05** | **Algorítmico / Arquitectura** | Complejidad combinatoria exponencial del algoritmo genético (CSP) que provocaba picos de uso del 100% de CPU en Node.js al cruzar aulas, docentes y cursos. | Congelamiento del backend bajo escenarios de carga real, bloqueando el proceso de generación de horarios. | **Removido.** Aplicación de poda algorítmica, selección por torneo y límite estricto a 500 iteraciones siguiendo principios de *Green Software*. |
| **IMP-06** | **Información de Entrada** | Falta de definición clara y contradicciones en la lógica de las reglas institucionales para la malla de prerrequisitos de la matrícula flexible. | Imposibilidad de diseñar un motor algorítmico con resultados 100% válidos o aplicables a la realidad. | **Removido.** Relevamiento formal de reglas y creación de una matriz de validación obligatoria previa a la ejecución del motor. |
| **IMP-07** | **Infraestructura / Presupuesto** | Limitaciones físicas de memoria y peticiones concurrentes debido al uso de capas gratuitas (*Cloud Tiers*) en Vercel, Render y MongoDB Atlas. | Riesgo inminente de suspensión del servicio por superar las cuotas y caídas del servidor por falta de optimización. | **Removido.** Optimización de persistencia usando `.lean()`, indexación avanzada en la base de datos y paginación obligatoria de endpoints. |

---

## 3. Conclusión e Indicadores de Cierre
*   **Impedimentos Totales Detectados:** 7
*   **Impedimentos Resueltos:** 7 (100% de efectividad)
*   **Estado del Sprint:** Desbloqueado. El equipo de desarrollo ha recuperado la velocidad planificada tras el despliegue de las medidas de mitigación y refactorización técnica.