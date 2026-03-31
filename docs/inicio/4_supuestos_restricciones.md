# REGISTRO DE SUPUESTOS Y RESTRICCIONES

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (Stack MERN)

**Equipo:** Miguel Angel Castillo Rojas / Alain Aliaga Eulogio

**Fecha:** 30 de marzo de 2026

---

## 1. Supuestos del Proyecto
Los supuestos son factores que consideramos como ciertos para garantizar el avance del diseño y desarrollo:

| ID | Categoría | Descripción del Supuesto |
| :--- | :--- | :--- |
| **S01** | Datos | La universidad proveerá la malla curricular completa y las reglas de prerrequisitos en formato digital. |
| **S02** | Tecnología | Las capas gratuitas de MongoDB Atlas y Vercel/Render soportarán la carga de datos del PMV. |
| **S03** | Usuario | Los coordinadores y alumnos tienen acceso a internet y conocimientos básicos de navegación web. |
| **S04** | Equipo | Se mantendrá un flujo de trabajo constante en GitHub con al menos 5 commits por integrante. |
| **S05** | Desarrollo | El motor de optimización (CSP) podrá ejecutarse en el entorno de Node.js sin requerir servidores de cómputo de alto rendimiento. |

---

## 2. Restricciones del Proyecto
Las restricciones son limitaciones obligatorias que el equipo debe respetar estrictamente:

| ID | Categoría | Detalle de la Restricción |
| :--- | :--- | :--- |
| **R01** | Tiempo | La entrega final y sustentación debe realizarse en la **primera semana de julio de 2026** (Ciclo 2026-01). |
| **R02** | Negocio | El sistema debe validar obligatoriamente que el alumno se matricule entre **20 y 22 créditos**. |
| **R03** | Algorítmica | Ningún horario generado puede tener solapamientos de docente, aula o estudiante (Restricción Dura). |
| **R04** | Seguridad | Implementación obligatoria de validaciones basadas en el estándar **OWASP Top 10**. |
| **R05** | Calidad | El software debe alinearse a los criterios de mantenibilidad de la norma **ISO/IEC 25010**. |
| **R06** | Sostenibilidad | Uso de principios de **Green Software** para optimizar el consumo de CPU en el backend de Node.js. |
| **R07** | Accesibilidad | La interfaz en React debe cumplir con las pautas de accesibilidad **WCAG**. |

---

## 3. Matriz de Priorización de Restricciones
En caso de conflictos durante el modelado del problema complejo, se seguirá este orden de prioridad:

| Prioridad | Restricción | Impacto en el Proyecto |
| :--- | :--- | :--- |
| **1 (Alta)** | No Solapamiento e Integridad | Esencial para que el horario sea funcional y válido. |
| **2 (Alta)** | Rango de Créditos (20-22) | Requisito administrativo crítico para la Universidad Continental. |
| **3 (Media)** | Seguridad y Privacidad | Protección de datos sensibles en el stack MERN. |
| **4 (Baja)** | Preferencias Horarias | Deseable, pero se puede sacrificar para cumplir con la validez del horario. |