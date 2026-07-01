# Reporte de Implementación y Aseguramiento de Calidad - Exposición

Este documento recopila de manera detallada todos los desarrollos de aseguramiento de calidad realizados sobre la rama `tests` de **Planner-UC** (SonarQube, OWASP Top 10, WCAG 2.1 y SUS).

---

## 1. Estructura General de la Documentación en el Proyecto

Todos los archivos generados y configurados se encuentran organizados dentro de las carpetas del proyecto para facilitar su revisión:

```
planner-uc/
├── .github/workflows/
│   └── sonar.yml                       <-- Pipeline automatizado de CI para SonarQube
├── docs/
│   └── calidad/
│       ├── analisis_completo.md        <-- Diagnóstico inicial de calidad y brechas
│       ├── SUS_Instrumento.md          <-- Instrumento SUS oficial y resultados simulados
│       └── reporte_implementacion.md   <-- Este documento
├── backend/
│   ├── middlewares/
│   │   └── security.js                 <-- Middleware contra NoSQL Injection y Manejo Seguro de Errores
│   ├── tests/
│   │   └── security.test.js            <-- Pruebas de seguridad automatizadas (Jest)
│   └── server.js                       <-- Integración de Helmet, Rate-Limit, Sanitización y Errores
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AccessibilityToolbar.jsx <-- Barra de Accesibilidad WCAG (Flotante)
│   │   ├── index.css                   <-- Reglas CSS para Accesibilidad WCAG
│   │   └── App.jsx                     <-- Integración de la Barra de Accesibilidad
│   └── tests/
│       └── AccessibilityToolbar.test.jsx <-- Pruebas de interfaz de accesibilidad (Vitest)
└── sonar-project.properties             <-- Propiedades de análisis estático para SonarQube
```

---

## 2. Resumen Técnico por Pilar para la Exposición

### 🛡️ Pilar 1: Seguridad (OWASP Top 10 2025)
*   **Vulnerabilidades Mitigadas:**
    *   *A1: Control de Acceso Roto / DoS:* Se implementó `express-rate-limit` regulando las peticiones a la API (máximo 200 peticiones en 15 minutos por IP).
    *   *A3: Inyección (NoSQL):* Mongoose es seguro contra parámetros simples, pero vulnerable si se envían objetos de consulta MongoDB (ej. `{ "$ne": "" }`). Se desarrolló un sanitizador recursivo en [security.js](file:///c:/Users/USUARIO/Documents/TALLER%20DE%20PROYECTOS%202/PROYECTO/planner-uc/backend/middlewares/security.js) que intercepta el cuerpo, parámetros y consultas, y elimina cualquier clave que comience con `$` o contenga `.`.
    *   *A5: Configuración de Seguridad Incorrecta / Exposición de Información:*
        *   Se integró `helmet` para inyectar cabeceras seguras (XSS protection, X-Frame-Options para evitar Clickjacking y ocultamiento de cabeceras de Express como `X-Powered-By`).
        *   Se implementó un manejador seguro de errores globales que oculta los detalles técnicos de la base de datos (stack trace) cuando el entorno es de producción (`NODE_ENV === 'production'`).

### ♿ Pilar 2: Accesibilidad (WCAG 2.1 / 2.2)
*   **Cumplimiento de Pautas:**
    *   *Diseño Adaptativo y Accesible:* Se creó una **Barra de Accesibilidad Flotante** interactiva.
    *   *Alto Contraste (Criterio 1.4.3):* Toca una clase global CSS que cambia los colores a fondo negro y texto amarillo de alto contraste (ideal para personas con visión disminuida o daltonismo).
    *   *Escala de Fuente (Criterio 1.4.4):* Botones interactivos `A`, `A+`, `A++` que escalan tipográficamente toda la UI para usuarios con presbicia o dificultades de lectura.
    *   *Fuente Disléxica (Accesibilidad Cognitiva):* Alterna la tipografía de toda la aplicación a una fuente de fácil lectura para dislexia.
    *   *Resaltado de Enlaces (Criterio 2.4.7):* Inyecta contornos e indicadores de foco gruesos sobre todos los botones, enlaces y campos de formulario para navegación por teclado pura.
    *   *Lector de Voz Integrado (Text-to-Speech):* Simulación de lector de pantalla usando el sintetizador de voz nativo del navegador, leyendo en voz alta los elementos sobre los que pasa el cursor del mouse.

### 📐 Pilar 3: Usabilidad (System Usability Scale - SUS)
*   **Método de Medición:**
    *   Se documentó la aplicación del cuestionario estándar SUS de 10 preguntas.
    *   Se calculó el resultado a partir de 5 usuarios evaluadores simulados (Estudiantes, Docente y Administrador).
    *   **Puntaje SUS Promedio obtenido:** **86.5 / 100** (Clasificado en rango de **Aceptable / Excelente - Clase A**, correlacionado como **Promotor** en NPS).

### 🔍 Pilar 4: Calidad y Cobertura (SonarQube & Testing)
*   **SonarQube:**
    *   Se definió [sonar-project.properties](file:///c:/Users/USUARIO/Documents/TALLER%20DE%20PROYECTOS%202/PROYECTO/planner-uc/sonar-project.properties) configurando las fuentes a analizar y excluyendo librerías externas o archivos compilados.
    *   Se configuró el workflow [.github/workflows/sonar.yml](file:///c:/Users/USUARIO/Documents/TALLER%20DE%20PROYECTOS%202/PROYECTO/planner-uc/.github/workflows/sonar.yml) para automatizar el escaneo automático.
*   **Testing Automatizado:**
    *   *Backend:* 5 pruebas en [security.test.js](file:///c:/Users/USUARIO/Documents/TALLER%20DE%20PROYECTOS%202/PROYECTO/planner-uc/backend/tests/security.test.js) que validan el sanitizador, rate limiter y manejador de errores.
    *   *Frontend:* 7 pruebas en [AccessibilityToolbar.test.jsx](file:///c:/Users/USUARIO/Documents/TALLER%20DE%20PROYECTOS%202/PROYECTO/planner-uc/frontend/tests/AccessibilityToolbar.test.jsx) que validan el renderizado e inyección de clases visuales en el DOM.

---

## 3. Demo en Vivo para la Exposición

Durante la exposición, puedes demostrar el funcionamiento del sistema en vivo con las siguientes acciones:

1.  **Demostración de Accesibilidad (WCAG):**
    *   Entra a la aplicación y haz clic en el botón flotante azul de accesibilidad (`♿`).
    *   Activa el **Alto Contraste** y muestra cómo toda la pantalla pasa a fondo negro y texto amarillo.
    *   Activa la **Escala de Letra** (clic en `A+` o `A++`) y muestra cómo crece el tamaño del texto sin romper el maquetado.
    *   Activa el **Lector de Voz**, pasa el cursor sobre los botones o títulos y deja que el navegador lea el texto en español para el público.
2.  **Pruebas Automatizadas (Consola):**
    *   Abre una consola y ejecuta las pruebas del backend:
        ```bash
        cd backend
        node --experimental-vm-modules node_modules/jest/bin/jest.js tests/security.test.js --config=jest.unit.config.js
        ```
    *   Ejecuta las pruebas del frontend en otra pestaña:
        ```bash
        cd frontend
        npx vitest run tests/AccessibilityToolbar.test.jsx
        ```
    *   Muestra cómo todas las pruebas se ejecutan rápidamente y pasan en verde (`PASS`).
