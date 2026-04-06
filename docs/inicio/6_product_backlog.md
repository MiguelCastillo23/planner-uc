# PRODUCT BACKLOG

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

## 2. Historias de Usuario y Tareas Técnicas


| ID | Título | Historia de Usuario | Prioridad | Épica |
| :--- | :--- | :--- | :--- | :--- |
| **HU-001** | **Gestión de Recursos Académicos** | Como **Administrador**, quiero registrar aulas y cursos para centralizar la base de datos del semestre. | Alta | **E01** |
| **HU-002** | **Asignación de Carga Académica** | Como **Administrador**, quiero vincular a cada docente con sus materias para definir quién es apto para dictarlas. | Alta | **E01** |
| **HU-003** | **Generación Automatizada** | Como **Administrador**, quiero ejecutar el motor de optimización para obtener una propuesta de horario sin cruces. | Crítica | **E02** |
| **HU-004** | **Control de Reglas y Créditos** | Como **Administrador**, quiero establecer límites de créditos por alumno para cumplir la normativa académica. | Crítica | **E02** |
| **HU-005** | **Registro de Disponibilidad** | Como **Docente**, quiero ingresar mis franjas horarias disponibles para que el sistema las respete al generar el horario. | Alta | **E03** |
| **HU-006** | **Visualización de Horario** | Como **Alumno**, quiero consultar mi horario generado en una tabla interactiva para organizar mi semestre. | Media | **E03** |
| **HU-007** | **Acceso Seguro al Perfil** | Como **Usuario (Administrador/Docente/Alumno)**, quiero iniciar sesión con mis credenciales para proteger mi información. | Alta | **E04** |
| **HU-008** | **Reporte de Uso de Espacios** | Como **Administrador**, quiero ver un reporte de eficiencia de aulas para maximizar el uso de recursos y reducir el consumo energético. | Media | **E04** |


---

## 3. Criterios de Aceptación
*   El motor no debe asignar un mismo docente a dos aulas diferentes en el mismo bloque horario.
*   El motor no debe asignar una misma aula a dos cursos diferentes simultáneamente.
*   El tiempo de respuesta del servidor no debe exceder los 30 segundos bajo carga moderada.

---

## 4. Planificación de Sprints

### Versión 1.0.0 (MVP - Mínimo Producto Viable)

#### **Sprint 1: Cimientos y Gestión de Datos**

| ID | Historia de Usuario  | Entregable |
| :--- | :---  | :--- |
| **HU-001** | Gestión de Recursos Académicos  | CRUD de aulas y cursos en MongoDB. |
| **HU-002** | Asignación de Carga Académica  | Relación lógica Docente-Curso en la DB. |

#### **Sprint 2: El Motor de Optimización**

| ID | Historia de Usuario  | Entregable |
| :--- | :---  | :--- |
| **HU-003** | Generación Automatizada  | Algoritmo CSP con cero cruces horarios. |
| **HU-004** | Control de Reglas y Créditos  | Validador de límites de créditos [20-22]. |

#### **Sprint 3: Interfaz de Usuario y Experiencia**

| ID | Historia de Usuario | Entregable |
| :--- | :--- | :---  |
| **HU-005** | Registro de Disponibilidad  | Formulario de franjas horarias en React. |
| **HU-006** | Visualización de Horario  | Tabla interactiva de horarios generados. |

---

### Versión 2.0.0 (Calidad y Sostenibilidad)

#### **Sprint 4: Seguridad y Eficiencia**

| ID | Historia de Usuario  | Entregable |
| :--- | :---  | :--- |
| **HU-007** | Acceso Seguro al Perfil | Login con JWT y protección OWASP |
| **HU-008** | Reporte de Uso de Espacios | Dashboard de eficiencia energética (Green IT)|

---

## 5. Resumen de Entregas

| Versión | Sprint | Enfoque Principal |
| :--- | :--- | :--- |
| **1.0.0** | **S1** | Infraestructura y Datos|
| **1.0.0** | **S2** | Algoritmo y Lógica |
| **1.0.0** | **S3** | UX/UI y Flujos |
| **2.0.0** | **S4** | Seguridad y Sostenibilidad |
