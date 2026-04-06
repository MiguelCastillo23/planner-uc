# Documento de Selección de Enfoque del Proyecto

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible

**Equipo:** 
* Miguel Angel Castillo Rojas
* Alain Aliaga Eulogio

**Fecha:** 30 de marzo de 2026

---

## 1. Identificación del Problema Complejo
El proyecto aborda la planificación de horarios en universidades con currículo flexible, un problema caracterizado por una alta variabilidad y múltiples restricciones interdependientes. Se clasifica como un problema complejo de ingeniería debido a:
* **Requisitos cambiantes:** La matrícula estudiantil y la disponibilidad docente fluctúan constantemente.
* **Conflictos de recursos:** Cruce de disponibilidad entre docentes, aulas especializadas y estudiantes.
* **Optimización combinatoria:** No existe una solución única trivial; se requiere un modelado algorítmico para encontrar resultados válidos y óptimos (Problema de Satisfacción de Restricciones - CSP).

## 2. Selección del Enfoque Metodológico
Para la gestión del proyecto, se ha seleccionado el marco de trabajo **Scrum**.

### Comparativa de Metodologías
| Criterio | Scrum | Cascada  |
| :--- | :--- | :--- |
| **Adaptabilidad** | Alta; ideal para requisitos parcialmente definidos. | Baja; rígida ante cambios. |
| **Entrega de Valor** | Incremental mediante Sprints. | Única al final del proyecto. |
| **Riesgos** | Identificación temprana de impedimentos. | Los fallos se detectan al final. |

**Justificación:** Dado que el desarrollo del motor de horarios requiere ajustes constantes y validaciones con los stakeholders, Scrum permite realizar entregas funcionales y ajustar la lógica de optimización de forma iterativa.

---

## 3. Selección del Enfoque Tecnológico
Se ha optado por una arquitectura de Aplicación Web Moderna basada en el **Stack MERN**, garantizando un desarrollo homogéneo utilizando JavaScript en todas las capas.

### 3.1. Frontend
* **Tecnología:** **React.js**
* **Justificación:** Permite crear una interfaz de usuario dinámica y reactiva para la visualización de horarios. Facilita la implementación de estándares de usabilidad ISO/IEC 25010 y accesibilidad WCAG.

### 3.2. Backend
* **Tecnología:** **Node.js y Express.js**
* **Justificación:** Express proporciona una estructura ligera para construir la API REST que procesará las peticiones del motor de horarios, aprovechando la naturaleza no bloqueante de Node.js para manejar múltiples consultas simultáneas.

### 3.3. Base de Datos
* **Tecnología:** **MongoDB**
* **Justificación:** Su modelo de documentos flexible es ideal para manejar estructuras de horarios que pueden variar en atributos, además de facilitar el escalamiento horizontal durante las pruebas del PMV.

---

## 4. Estrategia de Resolución del Problema (CSP)
El núcleo del sistema se modelará como un **Problema de Satisfacción de Restricciones (CSP)**.
* **Variables:** Cursos, docentes, estudiantes, aulas y franjas horarias.
* **Estrategia:** Implementación de algoritmos de búsqueda y validación lógica para asegurar el **no solapamiento** y el respeto estricto al rango de **20 a 22 créditos** por estudiante.

## 5. Estándares y Calidad
1.  **Seguridad:** Aplicación de **OWASP Top 10** para proteger la integridad de los datos académicos.
2.  **Sostenibilidad:** Principios de **Green Software**, optimizando el código en Node.js para reducir la carga computacional del servidor.
3.  **Calidad:** Evaluación continua bajo la norma **ISO/IEC 25010** para asegurar mantenibilidad y eficiencia.