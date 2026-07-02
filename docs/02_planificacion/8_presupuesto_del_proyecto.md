# 8. PRESUPUESTO DETALLADO DEL PROYECTO (PFA)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible
**Equipo de Desarrollo:** Miguel Angel Castillo Rojas, Alain Aliaga Eulogio, Erick Sanchez Vicente, Tony Ulloa Alvinagorta
**Fecha:** 30 de marzo de 2026
**Versión:** 1.1.0
**Moneda:** Soles Peruanos (S/.)
**Tarifa Referencial:** S/ 35.00 por hora/hombre

---

## 1. FUENTES DE COSTO DEL PROYECTO
Este cuadro detalla el esfuerzo técnico y de gestión para la construcción del PMV. Se ha incluido la partida de **Gerencia del Proyecto** para reflejar el esfuerzo de liderazgo y coordinación bajo el marco Scrum.

| ID | Tarea del Proyecto | Horas Hombre | Costo por Hora (S/.) | Costo Material (S/.) | Otros Costos (S/.) | Total por Tarea (S/.) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.0** | **Diseño del Proyecto** | **80** | | | | **S/ 2,800.00** |
| 1.1 | Desarrollo de Especificaciones Funcionales | 20 | 35.00 | 0.00 | 0.00 | 700.00 |
| 1.2 | Arquitectura del Desarrollo del Sistema | 15 | 35.00 | 0.00 | 0.00 | 525.00 |
| 1.3 | Especificaciones de Diseño Preliminar | 15 | 35.00 | 0.00 | 0.00 | 525.00 |
| 1.4 | Especificaciones Detalladas del Diseño | 20 | 35.00 | 0.00 | 0.00 | 700.00 |
| 1.5 | Desarrollo del Plan de Pruebas de Aceptación | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| **2.0** | **Desarrollo del Proyecto** | **175** | | | | **S/ 6,375.00** |
| 2.1 | Desarrollar Componentes (MERN Stack) | 120 | 35.00 | 0.00 | 0.00 | 4,200.00 |
| 2.2 | Adquirir Software (Licencias/Cloud Tiers) | 0 | 0.00 | 100.00 | 0.00 | 100.00 |
| 2.3 | Adquirir Hardware (Servidor/Infraestructura) | 0 | 0.00 | 150.00 | 0.00 | 150.00 |
| 2.4 | Paquete de Pruebas de Aceptación | 25 | 35.00 | 0.00 | 0.00 | 875.00 |
| 2.5 | Ejecución de Pruebas Unitarias / Integración | 30 | 35.00 | 0.00 | 0.00 | 1,050.00 |
| **3.0** | **Entregas del Proyecto** | **50** | | | | **S/ 1,750.00** |
| 3.1 | Instalar Sistema (Despliegue) | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| 3.2 | Entrenar Clientes (Manuales/Capacitación) | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| 3.3 | Pruebas de Aceptación del Desempeño | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| 3.4 | Revisión del Desempeño Post Proyecto | 5 | 35.00 | 0.00 | 0.00 | 175.00 |
| 3.5 | Proveer Garantía de Soporte | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| 3.6 | Archivar Materiales (Documentación Final) | 5 | 35.00 | 0.00 | 0.00 | 175.00 |
| **4.0** | **Gerencia del Proyecto** | **40** | | | | **S/ 1,400.00** |
| 4.1 | Planificación y Control de Sprints (Daily/Backlog) | 15 | 35.00 | 0.00 | 0.00 | 525.00 |
| 4.2 | Gestión de Stakeholders y Comunicación | 15 | 35.00 | 0.00 | 0.00 | 525.00 |
| 4.3 | Aseguramiento de Calidad y Gestión de Riesgos | 10 | 35.00 | 0.00 | 0.00 | 350.00 |
| | **TOTAL PRESUPUESTO ESTIMADO** | **345** | | **S/ 250.00** | **S/ 0.00** | **S/ 12,325.00** |

---

## 2. COSTOS POR SPRINT (METODOLOGÍA ÁGIL)
## 2.1. SPRINT 1: CIMIENTOS Y GESTIÓN DE DATOS (MERN)
**Épica:** E01 - Infraestructura y Gestión de Datos
**Fecha Estimada:** 20/04/2026

| Item / Historia de Usuario | Costo (S/.) | Razón y Entregable Clave |
| :--- | :--- | :--- |
| **HU-001: Gestión de Recursos Académicos** | S/ 1,050.00 | Desarrollo Backend para registro (CRUD) de aulas y cursos en MongoDB. |
| **HU-002: Asignación de Carga Académica** | S/ 875.00 | Relación lógica Docente-Curso en la base de datos. |
| **Infraestructura Inicial** | S/ 50.00 | Provisión y configuración inicial de Atlas/Vercel. |
| **Gerencia Scrum (Sprint 1)** | S/ 525.00 | Planificación del Sprint, Daily Scrums y configuración del repositorio. |
| **TOTAL SPRINT 1** | **S/ 2,500.00** | **Entregable:** Base de datos y API REST funcional para entidades base. |

---

## 2.2. SPRINT 2: EL MOTOR DE OPTIMIZACIÓN (Algoritmo Genetico)
**Épica:** E02 - Motor de Reglas y Optimización
**Fecha Estimada:** 11/05/2026

| Item / Historia de Usuario | Costo (S/.) | Razón y Entregable Clave |
| :--- | :--- | :--- |
| **HU-003: Generación Automatizada** | S/ 1,750.00 | Diseño y programación del algoritmo genetico para evitar cruces de horarios. |
| **HU-004: Control de Reglas y Créditos** | S/ 875.00 | Desarrollo del validador de límites de créditos [20-22] y prerrequisitos. |
| **Gerencia y Stakeholders (Sprint 2)** | S/ 525.00 | Validación de reglas de negocio con Coordinación Académica. |
| **TOTAL SPRINT 2** | **S/ 3,150.00** | **Entregable:** Motor algorítmico capaz de generar horarios válidos. |

---

## 2.3. SPRINT 3: INTERFAZ DE USUARIO Y EXPERIENCIA (UX/UI)
**Épica:** E03 - Interfaz de Usuario y Flujos
**Fecha Estimada:** 01/06/2026

| Item / Historia de Usuario | Costo (S/.) | Razón y Entregable Clave |
| :--- | :--- | :--- |
| **HU-005: Registro de Disponibilidad** | S/ 875.00 | Desarrollo de formularios en React para ingreso de franjas horarias docentes. |
| **HU-006: Visualización de Horario** | S/ 1,225.00 | Programación de la tabla/grid interactiva para la consulta de estudiantes. |
| **Licencias y Herramientas UI** | S/ 100.00 | Adquisición de componentes o utilidades de software para la interfaz. |
| **Aseguramiento Calidad (WCAG)** | S/ 600.00 | Pruebas de usabilidad y accesibilidad + Gerencia del Sprint. |
| **TOTAL SPRINT 3** | **S/ 2,800.00** | **Entregable:** Frontend SPA interactivo conectado al motor de horarios. |

---

## 2.4. SPRINT 4: SEGURIDAD, SOSTENIBILIDAD Y DESPLIEGUE FINAL
**Épica:** E04 - Calidad, Seguridad y Sostenibilidad
**Fecha Estimada:** 22/06/2026

| Item / Historia de Usuario | Costo (S/.) | Razón y Entregable Clave |
| :--- | :--- | :--- |
| **HU-007: Acceso Seguro al Perfil** | S/ 875.00 | Implementación de Login JWT y protección contra vulnerabilidades (OWASP). |
| **HU-008: Reporte de Uso de Espacios** | S/ 700.00 | Dashboard para visualizar la eficiencia de aulas (Green IT / Sostenibilidad). |
| **Pruebas de Integración y Unitarias** | S/ 1,050.00 | Cobertura de código >=70% y pruebas del sistema completo (ISO 25010). |
| **Despliegue y Escalabilidad Cloud** | S/ 200.00 | Pase a producción final y escalamiento de servidores gratuitos. |
| **Cierre (Manuales y Video Demo)** | S/ 1,050.00 | Capacitación, grabación del video de 5 min y consolidación de la documentación. |
| **TOTAL SPRINT 4** | **S/ 3,875.00** | **Entregable:** PMV 1.0.0 liberado, seguro y optimizado energéticamente. |

---

## RESUMEN DE PRESUPUESTO

| Fases de Entrega | Inversión Estimada (S/.) |
| :--- | :--- |
| **Versión 1.0.0 (MVP Core - Sprints 1, 2 y 3)** | S/ 8,450.00 |
| **Versión 2.0.0 (Seguridad y Cierre - Sprint 4)** | S/ 3,875.00 |
| **PRESUPUESTO TOTAL (100%)** | **S/ 12,325.00** |

---

## 3. COSTOS A LO LARGO DEL TIEMPO (ETAPAS PMBOK)

| Item | Etapa PMBOK | Fecha Estimada | Costo (S/.) | Razón del Gasto |
| :--- | :--- | :--- | :--- | :--- |
| **1.0** | **INICIO** | **30/03/2026 - 05/04/2026** | **S/ 1,050.00** | **Formalización y Estructura** |
| 1.1 | Gerencia de Proyecto: Planificación inicial | 30/03/2026 | 525.00 | Elaboración del Project Charter y Visión del Proyecto. |
| 1.2 | Gerencia de Proyecto: Gestión de Stakeholders | 02/04/2026 | 525.00 | Alineación con coordinadores académicos y formación del equipo. |
| | **Subtotal Inicio** | | **S/ 1,050.00** | |
| | | | | |
| **2.0** | **PLANIFICACIÓN** | **06/04/2026 - 19/04/2026** | **S/ 2,800.00** | **Arquitectura y Diseño Detallado** |
| 2.1 | Especificaciones Funcionales | 06/04/2026 | 700.00 | Definición de requerimientos (RF y RNF) y Product Backlog. |
| 2.2 | Arquitectura del Sistema | 09/04/2026 | 525.00 | Diseño de arquitectura SPA + API REST y Stack MERN. |
| 2.3 | Diseño Preliminar y de Datos | 12/04/2026 | 525.00 | Modelado de base de datos MongoDB y esquemas de persistencia. |
| 2.4 | Diseño Detallado del Algoritmo | 15/04/2026 | 700.00 | Modelado formal del problema de satisfacción de restricciones. |
| 2.5 | Plan de Pruebas de Aceptación | 18/04/2026 | 350.00 | Estrategia de validación para el motor de horarios. |
| | **Subtotal Planificación** | | **S/ 2,800.00** | |
| | | | | |
| **3.0** | **EJECUCIÓN** | **20/04/2026 - 07/06/2026** | **S/ 4,450.00** | **Construcción del Producto (PMV)** |
| 3.1 | Desarrollo de Componentes (Code) | 20/04/2026 | 4,200.00 | Programación Backend (Node/Express) y Frontend (React). |
| 3.2 | Adquisición de Licencias/Software | 01/05/2026 | 100.00 | Herramientas de desarrollo y utilidades de terceros. |
| 3.3 | Infraestructura y Servidores | 15/05/2026 | 150.00 | Provisión de recursos Cloud (Atlas, Vercel, Render). |
| | **Subtotal Ejecución** | | **S/ 4,450.00** | |
| | | | | |
| **4.0** | **SEGUIMIENTO Y CONTROL** | **Permanente** | **S/ 2,275.00** | **Calidad y Verificación** |
| 4.1 | Paquete de Pruebas de Aceptación | 08/06/2026 | 875.00 | Validación de requerimientos funcionales del sistema. |
| 4.2 | Pruebas Unitarias e Integración | 15/06/2026 | 1,050.00 | Aseguramiento de cobertura de código y lógica algorítmica. |
| 4.3 | Aseguramiento de Calidad y Riesgos | 20/06/2026 | 350.00 | Gestión de la calidad ISO/IEC 25010 y auditoría OWASP. |
| | **Subtotal Seg. y Control** | | **S/ 2,275.00** | |
| | | | | |
| **5.0** | **CIERRE** | **22/06/2026 - 05/07/2026** | **S/ 1,750.00** | **Entrega Final y Post-Proyecto** |
| 5.1 | Instalación y Despliegue Final | 22/06/2026 | 350.00 | Paso a producción del sistema de generación de horarios. |
| 5.2 | Entrenamiento de Usuarios | 25/06/2026 | 350.00 | Capacitación a coordinadores y elaboración de manuales. |
| 5.3 | Pruebas de Desempeño Final | 28/06/2026 | 350.00 | Validación final del motor de optimización en vivo. |
| 5.4 | Revisión Post-Proyecto y Green SW | 30/06/2026 | 175.00 | Informe de eficiencia energética y lecciones aprendidas. |
| 5.5 | Garantía y Soporte Inicial | 02/07/2026 | 350.00 | Acompañamiento en el primer proceso de matrícula. |
| 5.6 | Cierre Administrativo y Archivo | 05/07/2026 | 175.00 | Consolidación del repositorio GitHub y documentación. |
| | **Subtotal Cierre** | | **S/ 1,750.00** | |
| | | | | |
| **TOTAL GENERAL** | | | **S/ 12,325.00** | **Inversión Total Consolidada** |
---

## 4. SUPUESTOS Y RESTRICCIONES FINANCIERAS
* **Recurso Humano:** La tarifa de S/ 35.00 es una valorización de mercado para un equipo de 5 ingenieros en formación.
* **Infraestructura:** Se prioriza el uso de capas gratuitas (Free Tiers) de MongoDB Atlas y Vercel, manteniendo un fondo de reserva de S/ 250.00 para contingencias.
* **Sostenibilidad:** La optimización del código bajo estándares de *Green Software* busca reducir costos operativos a largo plazo.

