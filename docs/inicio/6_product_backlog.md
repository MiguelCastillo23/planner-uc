# PRODUCT BACKLOG INICIAL (PBI)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

**Equipo:** 
* Miguel Angel Castillo Rojas
* Alain Aliaga Eulogio
* Erick Sanchez Vicente

---

## 1. Definición de Épicas
Para organizar el desarrollo del PMV, se han definido 4 épicas alineadas con los hitos:

*   **E01: Infraestructura y Gestión de Datos (MERN):** Configuración de la persistencia y entidades base (Docentes, Aulas, Cursos).
*   **E02: Motor de Reglas y Optimización (CSP):** El núcleo algorítmico para resolver la asignación y restricciones académicas.
*   **E03: Interfaz de Usuario y Flujos (UX/UI):** Experiencia para Estudiantes, Docentes y Coordinadores en React.
*   **E04: Calidad, Seguridad y Sostenibilidad:** Implementación de estándares ISO 25010, OWASP y Green Software.

---

## 2. Historias de Usuario y Tareas Técnicas (PBI)


| ID | Título | Descripción | Prioridad | Épica |
| :--- | :--- | :--- | :--- | :--- |
| **PBI-01** | Arquitectura Base MERN | Configurar el servidor Node/Express y la conexión a MongoDB Atlas siguiendo el diseño de arquitectura. | Alta | E01 |
| **PBI-02** | Registro de Entidades Base | Como **Administrador**, quiero registrar docentes, aulas y cursos para alimentar el modelo de datos. | Alta | E01 |
| **PBI-03** | Validación de Carga Académica | Como **Sistema**, debo restringir la matrícula a un rango de **[20-22] créditos** por estudiante. | Crítica | E02 |
| **PBI-04** | Algoritmo de No Solapamiento | Como **Coordinador**, quiero que el sistema garantice cero cruces de horario entre docentes y aulas mediante CSP. | Crítica | E02 |
| **PBI-05** | Gestión de Disponibilidad | Como **Docente**, quiero ingresar mis franjas horarias disponibles para ser considerado en la generación. | Alta | E03 |
| **PBI-06** | Dashboard de Visualización | Como **Estudiante**, quiero ver mi horario generado en una tabla interactiva para validar mis cursos. | Media | E03 |
| **PBI-07** | Seguridad y Autenticación | Implementar JWT y protección contra ataques (OWASP Top 10) para resguardar datos académicos. | Alta | E04 |
| **PBI-08** | Optimización de Recursos (Green SW) | Refactorizar el motor de búsqueda para reducir el consumo de CPU y mejorar la eficiencia energética. | Media | E04 |

---

## 3. Criterios de Aceptación
*   El motor no debe asignar un mismo docente a dos aulas diferentes en el mismo bloque horario.
*   El motor no debe asignar una misma aula a dos cursos diferentes simultáneamente.
*   El tiempo de respuesta del servidor no debe exceder los 30 segundos bajo carga moderada.

---

## 4. Planificación del Sprint 1
En el primer Sprint después del inicio, nos enfocaremos en:
1. Instalación de dependencias (React, Express, Mongoose).
2. Modelado de esquemas en MongoDB para Estudiantes, Docentes y Aulas.
3. Primer endpoint de validación de créditos
