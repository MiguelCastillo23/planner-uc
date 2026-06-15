# Análisis Completo del Proyecto Planner-UC - Aseguramiento de Calidad (Rúbrica)

Este documento contiene el análisis estructural del proyecto, la verificación de rama Git, la identificación de brechas respecto a la rúbrica de calidad y el orden secuencial para las nuevas implementaciones.

---

## 1. Arquitectura y Estructura Actual del Proyecto

El sistema está construido como una aplicación Web Full Stack con la pila **MERN** tradicional:

### A. Backend (`backend/`)
*   **Servidor:** Node.js con Express (`server.js`).
*   **Base de Datos:** MongoDB Atlas usando Mongoose como ORM (`models/Schemas.js`).
*   **Controladores:** Lógica modularizada para la administración, optimización horaria y trámites estudiantiles.
*   **Eficiencia Energética (Green Software):** Middleware `environmentalTracker.js` que mide la transferencia de datos y estima emisiones de CO2 usando la librería `@tgwf/co2`.
*   **Pruebas:** Jest (`tests/`) para lógica de fitness, restricciones duras/blandas y simulación.

### B. Frontend (`frontend/`)
*   **Framework:** React v19+ agrupado con Vite.
*   **Estilos:** CSS puro en `App.css` e `index.css` con enfoque responsivo.
*   **Componentes:**
    *   `App.jsx` (Contenedor de estado global y enrutamiento nativo).
    *   `LoginPortal.jsx` (Acceso multi-rol).
    *   `AdminDashboard.jsx` (Gestión académica y financiera).
    *   `CourseSelector.jsx` (Selección de asignaturas).
    *   `ScheduleGrid.jsx` (Grilla interactiva para renderizado de horarios).
*   **Pruebas:** Vitest, Testing Library, MSW para integración, y configuraciones listas para Playwright y Cypress.

---

## 2. Diagnóstico de Brechas respecto a la Rúbrica de Calidad

Revisando el código actual frente a los requerimientos de la consigna docente:

### 1. Calidad de Código (SonarQube)
*   **Estado actual:** No existen archivos de configuración de SonarQube.
*   **Solución:** Agregar `sonar-project.properties` para delimitar los scopes del frontend y backend, excluir `node_modules` y directorios de compilación, e indicar dónde encontrar los reportes de cobertura de pruebas (`lcov.info`). Agregar workflow de GitHub Actions.

### 2. Security (OWASP Top 10 2025)
*   **A1: Control de Acceso Roto:** Hay rutas expuestas sin rate-limiter, lo cual facilita ataques de denegación de servicio (DoS) o fuerza bruta.
*   **A3: Inyección (NoSQL):** Mongoose previene inyecciones básicas en campos simples, pero si un atacante envía un objeto `{ "$ne": null }` en el cuerpo de una petición JSON o query param, Mongoose podría interpretarlo directamente. Se requiere sanitización.
*   **A5: Configuración de Seguridad Incorrecta:** Cabeceras HTTP expuestas (ej. `X-Powered-By: Express`). Solución: Usar `helmet` para inyectar cabeceras seguras (HSTS, CSP, X-Frame-Options).
*   **Exposición de Información:** Si el servidor falla, el controlador retorna `res.status(500).json({ error: error.message })`. En producción, revelar el stack o mensaje interno expone vulnerabilidades.

### 3. Accesibilidad Web (WCAG 2.1 / 2.2)
*   **Estado actual:** La UI usa colores oscuros con diseño estático. No hay controles interactivos para usuarios con limitaciones visuales (baja visión) o cognitivas (dislexia).
*   **Solución:** Agregar un widget global flotante en React que aplique dinámicamente modificaciones sobre el DOM (a través de clases CSS del elemento raíz):
    *   *Contraste alto* (fondo negro y letras amarillas/blancas).
    *   *Escalabilidad tipográfica* (multiplicador de tamaño de texto `1.0x`, `1.25x`, `1.5x`).
    *   *Lectura disléxica* (tipografía de espaciado optimizado).
    *   *Foco aumentado* (resaltar con bordes de alta visibilidad los elementos cliqueables).
    *   *Texto a Voz* (lector de pantalla simulado para interactividad auditiva).

### 4. Usabilidad (System Usability Scale - SUS)
*   **Estado actual:** No hay registro de aplicación del método SUS.
*   **Solución:** Diseñar la encuesta estandarizada de 10 ítems de SUS y crear una plantilla técnica en `docs/calidad/SUS_Instrumento.md` con su base de datos y la fórmula matemática para obtener el puntaje (0 a 100).

---

## 3. Secuencia y Orden de Integración

Para asegurar que nada de lo desarrollado previamente se dañe, las tareas se ejecutarán en el siguiente orden secuencial:

1. **Confirmar Rama Git: tests** (Completado).
2. **Crear Documentación e Instrumento SUS** (`docs/calidad/SUS_Instrumento.md`).
3. **Implementar Middleware de Seguridad OWASP** (`backend/middlewares/security.js`).
4. **Integrar Helmet y Rate Limiting en server.js** (`backend/server.js`).
5. **Implementar Estilos CSS de Accesibilidad** (`frontend/src/index.css`).
6. **Crear e Integrar el Toolbar WCAG** (`frontend/src/components/AccessibilityToolbar.jsx` y `frontend/src/App.jsx`).
7. **Crear sonar-project.properties y pipeline GHA** (Raíz).
8. **Escribir Pruebas Automatizadas de Seguridad y Accesibilidad**.
9. **Ejecutar y Validar Pruebas Totales - Coverage**.
