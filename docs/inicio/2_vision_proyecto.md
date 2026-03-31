# Declaración de la Visión del Proyecto

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible

**Equipo:** 
* Miguel Angel Castillo Rojas
* Alain Aliaga Eulogio

**Versión:** 1.0.0

---

## 1. Resumen Ejecutivo
El propósito de este proyecto es transformar la gestión académica mediante una aplicación web inteligente capaz de resolver la complejidad de la planificación de horarios en entornos de currículo flexible. El sistema automatiza la asignación de recursos, garantizando el cumplimiento de restricciones académicas y operativas mediante modelos de optimización.

## 2. Definición del Problema
| Elemento | Descripción |
| :--- | :--- |
| **Problema** | Dificultades críticas en la planificación de horarios debido a alta variabilidad de matrícula y múltiples restricciones interdependientes. |
| **Afectados** | Estudiantes, docentes, coordinadores académicos y administradores. |
| **Impacto** | Conflictos de disponibilidad, subutilización de infraestructura y procesos manuales ineficientes. |
| **Solución Ideal** | Un sistema basado en CSP (Constraint Satisfaction Problem) que genere horarios válidos y óptimos de forma automática. |

## 3. Declaración de Valor (Enunciado de la Visión)
Para las instituciones de educación superior que operan con modelos curriculares flexibles, el **Sistema de Generación Óptima de Horarios** es una plataforma web desarrollada con el **Stack MERN (MongoDB, Express, React, Node.js)** que proporciona una solución algorítmica a la asignación de cursos, aulas y docentes. A diferencia de los métodos de planificación manual, nuestro sistema utiliza un motor de optimización que elimina los solapamientos de horarios y respeta estrictamente los prerrequisitos académicos y el rango de 20 a 22 créditos.

## 4. Alcance del Proyecto (PMV)
El Producto Mínimo Viable se centrará en las siguientes capacidades nucleares:
* **Gestión de Entidades:** Registro y administración de estudiantes, docentes, cursos y aulas usando MongoDB.
* **Motor de Reglas:** Validación automática de matrícula considerando créditos (20-22) y prerrequisitos mediante lógica en Node.js.
* **Algoritmo de Generación:** Creación de horarios sin conflictos de disponibilidad ni solapamientos.
* **Interfaz de Visualización:** Dashboard interactivo desarrollado en React para la consulta de horarios bajo estándares de usabilidad ISO/IEC 25010.

## 5. Objetivos Estratégicos y Metas Medibles
Para asegurar el éxito del proyecto, se definen los siguientes indicadores:
1. **Validez:** El 100% de los horarios generados deben estar libres de conflictos de espacio y tiempo.
2. **Eficiencia:** Reducción del tiempo de planificación manual mediante una arquitectura SPA eficiente.
3. **Accesibilidad:** Cumplimiento de estándares WCAG y W3C.
4. **Seguridad:** Protección de datos sensibles siguiendo las recomendaciones de OWASP Top 10.

## 6. Restricciones de la Visión
* El sistema operará bajo una capacidad computacional limitada (Tier gratuito de servicios Cloud).
* El diseño debe priorizar la eficiencia energética siguiendo los lineamientos de **Green Software**.