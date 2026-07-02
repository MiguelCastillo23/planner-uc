# 11. REGISTRO DE RIESGOS Y OPORTUNIDADES (VERSIÓN EXTENDIDA)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible
**Gerente del Proyecto / Scrum Master:** Miguel Angel Castillo Rojas
**Equipo de Desarrollo:** Alain Aliaga Eulogio, Erick Sanchez Vicente, Tony Ulloa Alvinagorta
**Fecha de Actualización:** 30 de marzo de 2026
**Versión:** 2.0.0 (Súper Completa)

---

## 1. METODOLOGÍA DE EVALUACIÓN
* **Impacto y Probabilidad:** Escala del 1 al 3 (1=Bajo, 2=Medio, 3=Alto).
* **Puntuación:** `Impacto × Probabilidad` (Escala 1 a 9). 
  * *Rojo (Crítico): 6-9 | Amarillo (Moderado): 3-4 | Verde (Bajo): 1-2*
* **Detectabilidad:** 1 = Fácil, 2 = Moderado, 3 = Difícil.

---

## 2. ESTRUCTURA DE DESGLOSE (RBS) - ÁREAS DE IMPACTO
1. **Tecnológicos:** (1.1) Requerimientos, (1.2) Tecnología, (1.3) Complejidad e Interfaces, (1.4) Calidad y Desempeño.
2. **Externos:** (2.1) Proveedores (Cloud), (2.2) Regulaciones, (2.3) Mercado, (2.4) Stakeholders.
3. **Organización:** (3.1) Dependencias, (3.2) Recursos Humanos, (3.3) Presupuesto.
4. **Gerencia:** (4.1) Estimación, (4.2) Control (Git/Metodología).

---

## 3. MATRIZ DE RIESGOS (AMENAZAS)

| ID Riesgo | Descripción del Riesgo | Área de Impacto | Causa Principal | Impacto | Prob. | Puntuación | Det. | Estado | Estrategia y Plan de Acción | Dueño |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | **Cuello de botella en rendimiento del algoritmo** | 1.3 Complejidad | La alta complejidad combinatoria (aulas, docentes, cursos) satura el CPU de Node.js. | 3 | 3 | **9** | 2 | Activo | **Mitigar:** Aplicar técnicas de poda algorítmica y limitar el rango de búsqueda a 20-22 créditos estrictamente. | Miguel C. |
| **R-02** | **Incumplimiento de prácticas Git/GitHub** | 4.2 Control | Falta de costumbre en el uso de ramas, PRs o commits semánticos por parte del equipo. | 3 | 2 | **6** | 1 | Activo | **Evitar:** Implementar política de bloqueo en la rama `main`. Nadie sube código sin revisión. | Tony |
| **R-03** | **Desfase en la integración Frontend-Backend** | 1.3 Interfaces | Estructuras de datos JSON inconsistentes entre React y la API de Express. | 2 | 3 | **6** | 2 | Activo | **Mitigar:** Definir contratos de API (Swagger/Postman) desde el Sprint 1 antes de codificar. | Alain A. |
| **R-04** | **Documentación PMBOK rechazada** | 4.1 Estimación | No estructurar la carpeta `docs/` según las fases de inicio, planificación, ejecución, etc. | 3 | 2 | **6** | 1 | Activo | **Evitar:** Crear la estructura de carpetas y el README.md en el Sprint 0 de forma obligatoria. | Erick S. |
| **R-05** | **Vulnerabilidad de Datos Académicos** | 1.4 Calidad | Exposición de endpoints y falta de encriptación de contraseñas de estudiantes. | 3 | 1 | **3** | 2 | Activo | **Evitar:** Implementar JWT y seguir estrictamente el OWASP Top 10 para la validación de inputs. | Tony U. |
| **R-06** | **Exceder límites del Tier Gratuito Cloud** | 3.3 Presupuesto | Consultas ineficientes a MongoDB Atlas agotan los recursos del plan free. | 2 | 2 | **4** | 1 | Activo | **Mitigar:** Crear índices en MongoDB y paginar resultados en el backend. | Miguel C. |
| **R-07** | **Incumplimiento de pautas Green Software** | 1.4 Desempeño | Código ineficiente que consume demasiada energía en el servidor. | 2 | 2 | **4** | 3 | Activo | **Mitigar:** Optimizar bucles del motor CSP y documentar las decisiones de eficiencia energética. | Tony U. |
| **R-08** | **Baja accesibilidad de la interfaz web** | 1.1 Requerimientos | La UI en React no cumple con las normativas WCAG para usuarios con discapacidad visual. | 2 | 2 | **4** | 1 | Activo | **Mitigar:** Usar librerías de componentes pre-validadas y probar con lectores de pantalla. | Erick S. |
| **R-09** | **Curva de aprendizaje del Stack MERN** | 3.2 Recursos | Demoras por falta de dominio avanzado en Hooks de React o asincronía en Node. | 2 | 2 | **4** | 1 | Activo | **Aceptar:** Programar sesiones de "Pair Programming" para destrabar problemas complejos. | Tony |
| **R-10** | **Ambigüedad en reglas de prerrequisitos** | 2.4 Stakeholders | Información incompleta o contradictoria sobre la malla curricular flexible. | 3 | 2 | **6** | 2 | Activo | **Mitigar:** Relevar reglas reales y generar una matriz de validación antes del Sprint 2. | Alain A. |
| **R-11** | **Falta de evidencia colaborativa** | 3.1 Dependencias | Un miembro no sube commits al repositorio, penalizando a todo el equipo. | 3 | 1 | **3** | 1 | Activo | **Evitar:** Monitoreo semanal de la carga de commits por el Scrum Master. | Miguel C. |
| **R-12** | **Baja cobertura de pruebas automatizadas** | 1.4 Calidad | Falta de tiempo para llegar al >=70% de cobertura en Jest/Mocha. | 2 | 3 | **6** | 1 | Activo | **Mitigar:** Escribir las pruebas críticas del algoritmo CSP primero (TDD). | Tony U. |

---

## 4. MATRIZ DE OPORTUNIDADES (RIESGOS POSITIVOS)

| ID Oport. | Descripción de la Oportunidad | Área de Impacto | Causa de la Oportunidad | Impacto | Prob. | Puntos | Det. | Estado | Estrategia y Plan de Acción | Dueño |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **O-01** | **Implementación real en la Univ. Continental** | 2.4 Stakeholders | El PMV resuelve exactamente el dolor de la Coordinación Académica con el currículo flexible. | 3 | 2 | **6** | 2 | Activo | **Compartir:** Hacer una demo ejecutiva impecable (video 5 min) para presentarlo a los directores. | Alain A. |
| **O-02** | **Integración al Portafolio Comercial** | 2.3 Mercado | El sistema es lo suficientemente robusto para venderse como servicio B2B. | 3 | 2 | **6** | 1 | Activo | **Explotar:** Empaquetar el sistema como caso de éxito para añadirlo al portafolio de clientes y servicios de **Jstack Digital Solutions**. | Tony |
| **O-03** | **Uso de GenAI para Poblar Datos** | 1.2 Tecnología | Modelos LLM pueden generar cientos de registros simulados estructurados en JSON. | 2 | 3 | **6** | 1 | Activo | **Explotar:** Redactar prompts para generar listas de docentes, cursos y prerrequisitos en minutos, ahorrando horas de tipeo. | Erick S. |
| **O-04** | **Reutilización de Librerías Open Source** | 1.2 Tecnología | Existen librerías matemáticas en NPM que ya manejan grafos y satisfacción de restricciones. | 3 | 2 | **6** | 2 | Activo | **Mejorar:** Investigar paquetes pre-hechos para no reinventar la rueda y acelerar el Sprint 2. | Miguel C. |
| **O-05** | **Calificación "Sobresaliente" por control de versiones** | 4.2 Control | El equipo domina flujos complejos como *Git Flow* o *Feature Branch*. | 2 | 3 | **6** | 1 | Activo | **Explotar:** Etiquetar rigurosamente la versión `v1.0.0` y hacer Pull Requests ultra detallados. | Tony |
| **O-06** | **Base para Proyecto de Tesis** | 3.1 Dependencias | La complejidad algorítmica del proyecto es digna de una investigación académica. | 3 | 2 | **6** | 2 | Activo | **Explotar:** Documentar la arquitectura matemática del CSP para usarla como base de tesis de grado. | Tony U. |
| **O-07** | **Optimización radical (Green Software)** | 1.4 Desempeño | La refactorización del código reduce los tiempos de respuesta a milisegundos. | 2 | 2 | **4** | 3 | Activo | **Mejorar:** Documentar la baja huella de carbono del software como valor agregado de innovación. | Miguel C. |
| **O-08** | **Desarrollo acelerado de UI (React+Tailwind)** | 1.3 Interfaces | Uso de frameworks de CSS atómicos que agilizan el diseño responsivo. | 2 | 3 | **6** | 1 | Activo | **Explotar:** Configurar componentes base de Tailwind en el Sprint 1 para ensamblar vistas rápidamente. | Alain A. |

## 5. ANÁLISIS DE RIESGOS Y OPORTUNIDADES
### 5.1 Relación de riesgos con las restricciones del problema (CSP)

El sistema se basa en un problema de satisfacción de restricciones (CSP), lo cual introduce riesgos directamente asociados a su naturaleza combinatoria.

- El riesgo **R-01 (Cuello de botella del algoritmo CSP)** está directamente relacionado con la complejidad exponencial del problema, donde el número de combinaciones posibles crece rápidamente al aumentar cursos, docentes y aulas.
- El riesgo **R-10 (Ambigüedad en prerrequisitos)** impacta la definición de restricciones, pudiendo generar soluciones inválidas o inconsistentes.
- El riesgo **R-12 (Baja cobertura de pruebas)** afecta la validación de que las restricciones se cumplan correctamente en todos los escenarios.

👉 **Conclusión:**

El CSP es el núcleo del sistema, por lo que cualquier ambigüedad o ineficiencia impacta directamente en la calidad de la solución generada.

---
### 5.2 Relación con limitaciones técnicas

El proyecto presenta restricciones tecnológicas propias del stack utilizado:

- **Node.js (single-thread)** contribuye al riesgo **R-01**, ya que no está optimizado para cargas computacionales intensivas.
- La integración **React + Express (R-03)** introduce riesgos de inconsistencia en estructuras de datos.
- El uso de servicios gratuitos (MongoDB Atlas) genera el riesgo **R-06 (limitación de recursos)**.
- **La curva de aprendizaje (R-09)** afecta la velocidad de desarrollo y calidad del código.

👉 **Conclusión:**

Las decisiones tecnológicas impactan directamente en el rendimiento, escalabilidad y tiempos del proyecto.

---
### 5.3 Relación con dependencias externas

El proyecto depende de factores externos que pueden afectar su desarrollo:

- **Stakeholders académicos (R-10)** → fuente de ambigüedad en reglas del sistema.
- **Servicios cloud (R-06)**→ limitaciones operativas fuera del control del equipo.
- **Evaluación académica (R-04, R-11)**→ cumplimiento de estándares externos (docente/universidad).

👉 **Conclusión:**

Las dependencias externas representan riesgos no controlables totalmente, por lo que requieren estrategias de mitigación anticipadas.

---
### 5.4 Evaluación global del riesgo del proyecto
La mayoría de riesgos se concentran en:
- Complejidad algorítmica (CSP)
- Integración técnica
- Gestión del equipo

Se observa que:
- Predominan riesgos moderados y críticos (puntuación ≥6)
- Las estrategias se enfocan en mitigación más que eliminación

👉 **Conclusión general:**

El proyecto presenta un nivel de riesgo **medio-alto**, principalmente debido a la complejidad del problema CSP, pero es manejable mediante estrategias técnicas y de gestión adecuadas.
