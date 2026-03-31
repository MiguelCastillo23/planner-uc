# PRODUCT BACKLOG INICIAL (PBI)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

**Equipo:** Miguel Angel Castillo Rojas / Alain Aliaga Eulogio

---

## 1. Definición de Épicas
Para organizar el desarrollo del PMV en las 12 semanas disponibles, hemos dividido el proyecto en 4 Épicas principales:
1. **ÉPICA 01: Infraestructura y Gestión de Datos (MERN):** Configuración de la base de datos y CRUDs básicos.
2. **ÉPICA 02: Motor de Reglas y Optimización (CSP):** El núcleo algorítmico del proyecto.
3. **ÉPICA 03: Interfaz de Usuario y Visualización (UX/UI):** Experiencia en React.
4. **ÉPICA 04: Calidad, Seguridad y Despliegue:** ISO 25010, OWASP y Green Software.

---

## 2. Historias de Usuario y Tareas Técnicas
A continuación, se detallan los elementos del backlog priorizados:

| ID | Título | Descripción | Prioridad | Épica |
| :--- | :--- | :--- | :--- | :--- |
| **PBI-01** | Configuración del Entorno MERN | Configurar el servidor Node/Express y la conexión a MongoDB Atlas. | Alta | E01 |
| **PBI-02** | Gestión de Entidades Base | Como administrador, quiero registrar docentes, aulas y cursos para alimentar el sistema. | Alta | E01 |
| **PBI-03** | Motor de Validación de Créditos | Como sistema, debo impedir que un estudiante elija menos de 20 o más de 22 créditos. | Crítica | E02 |
| **PBI-04** | Algoritmo de No Solapamiento | Como sistema, debo garantizar que no existan cruces de horario entre docentes y aulas. | Crítica | E02 |
| **PBI-05** | Dashboard de Visualización | Como alumno, quiero ver mi horario generado en una tabla interactiva y clara. | Media | E03 |
| **PBI-06** | Módulo de Disponibilidad Docente | Como docente, quiero ingresar mis franjas horarias disponibles para ser considerado en el proceso. | Alta | E03 |
| **PBI-07** | Implementación de Seguridad | Aplicar JWT para autenticación y protección de rutas contra ataques según OWASP. | Alta | E04 |
| **PBI-08** | Optimización de Consultas | Refactorizar el código de Node.js para reducir el consumo de recursos (Green Software). | Media | E04 |

---

## 3. Criterios de Aceptación Generales (DoD - Definition of Done)
Para considerar un elemento del backlog como "Finalizado", debe cumplir:
* **Código:** Sin errores de sintaxis y siguiendo el estándar de codificación del equipo.
* **Pruebas:** Debe pasar pruebas unitarias básicas.
* **Documentación:** El código debe estar comentado y la funcionalidad descrita en el README.
* **Revisión:** Aprobado por el otro integrante del equipo mediante un Pull Request en GitHub.

---

## 4. Planificación del Sprint 1 (Próximo paso)
En el primer Sprint después del inicio (Semana 3 y 4), nos enfocaremos en:
1. Instalación de dependencias (React, Express, Mongoose).
2. Modelado de esquemas en MongoDB para Estudiantes, Docentes y Aulas.
3. Primer endpoint de validación de créditos (Regla 20-22).