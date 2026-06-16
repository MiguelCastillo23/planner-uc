# Instrumento de Evaluación de Usabilidad - System Usability Scale (SUS)

Este documento contiene la especificación del cuestionario SUS (System Usability Scale) utilizado para medir la usabilidad percibida del sistema **Planner-UC**, la matriz de recolección de datos, la fórmula de cálculo del puntaje y la interpretación técnica de los resultados.

---

## 1. Cuestionario SUS (Versión Estándar en Español)

El cuestionario consta de 10 afirmaciones que los usuarios califican en una escala Likert de 1 (Muy en desacuerdo) a 5 (Muy de acuerdo).

| ID | Ítem / Pregunta |
| :---: | :--- |
| **P1** | Creo que me gustaría usar este sistema frecuentemente. |
| **P2** | Encontré el sistema innecesariamente complejo. |
| **P3** | Pensé que el sistema era fácil de usar. |
| **P4** | Creo que necesitaría el soporte de un técnico para poder usar este sistema. |
| **P5** | Encontré que las diversas funciones en este sistema estaban bien integradas. |
| **P6** | Pensé que había demasiada inconsistencia en este sistema. |
| **P7** | Imagino que la mayoría de la gente aprendería a usar este sistema muy rápidamente. |
| **P8** | Encontré el sistema muy engorroso / molesto de usar. |
| **P9** | Me sentí muy seguro al usar el sistema. |
| **P10** | Necesité aprender muchas cosas antes de poder seguir con este sistema. |

---

## 2. Metodología de Cálculo del Puntaje SUS

El cálculo del puntaje final SUS no es un promedio directo. Sigue un algoritmo de ponderación específico para normalizar el resultado en una escala de 0 a 100:

1. **Para ítems impares (P1, P3, P5, P7, P9):** Al valor de la respuesta dada por el usuario (escala 1 a 5), se le resta 1.
   ```text
   Puntaje del Ítem = Respuesta - 1
   ```
2. **Para ítems pares (P2, P4, P6, P8, P10):** Al valor 5, se le resta el valor de la respuesta dada por el usuario.
   ```text
   Puntaje del Ítem = 5 - Respuesta
   ```
3. **Suma y Multiplicación:** Se suman los puntajes individuales obtenidos en los 10 ítems (que dará un total bruto entre 0 y 40) y se multiplica ese resultado por **2.5** para obtener la puntuación final (escala de 0 a 100).
   ```text
   Puntaje SUS Final = (Suma de los 10 Puntajes Individuales) * 2.5
   ```

---

## 3. Matriz de Recolección de Datos y Cálculos

Para garantizar la objetividad del análisis y evitar sesgos de desarrollo, las pruebas de usabilidad fueron aplicadas a **evaluadores externos** (estudiantes, docentes y personal administrativo ajenos al equipo de desarrollo).

### Tabla A: Respuestas Brutas Recopiladas (Escala Likert de 1 a 5)

| Participante / Evaluador | Rol del Sistema | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Estudiante Evaluador 1** | Estudiante | 5 | 1 | 4 | 1 | 5 | 2 | 4 | 1 | 5 | 2 |
| **Estudiante Evaluador 2** | Estudiante | 4 | 2 | 5 | 1 | 4 | 1 | 5 | 2 | 4 | 1 |
| **Docente Evaluador**       | Docente | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 5 | 2 |
| **Administrador Evaluador** | Administrador | 5 | 1 | 5 | 2 | 5 | 1 | 5 | 1 | 4 | 2 |
| **Estudiante Evaluador 3** | Estudiante | 4 | 1 | 4 | 1 | 5 | 1 | 4 | 2 | 4 | 2 |
| **Promedio**                 | - | **4.4** | **1.4** | **4.4** | **1.4** | **4.6** | **1.4** | **4.4** | **1.6** | **4.4** | **1.8** |

### Tabla B: Conversión a Puntajes de Usabilidad y Calificación Final

*   **Puntaje Impares (A):** Suma de `(Respuesta - 1)` para P1, P3, P5, P7 y P9.
*   **Puntaje Pares (B):** Suma de `(5 - Respuesta)` para P2, P4, P6, P8 y P10.
*   **Total Bruto:** `Puntaje Impares (A) + Puntaje Pares (B)`.
*   **Puntaje SUS Final:** `Total Bruto * 2.5`.

| Participante / Evaluador | Suma Impares (A) | Suma Pares (B) | Total Bruto (A + B) | Puntaje SUS Final | Calificación |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Estudiante Evaluador 1** | 18 | 18 | 36 | **90.0** | Excelente (Excellent) |
| **Estudiante Evaluador 2** | 17 | 18 | 35 | **87.5** | Excelente (Excellent) |
| **Docente Evaluador**       | 16 | 15 | 31 | **77.5** | Bueno (Good) |
| **Administrador Evaluador** | 19 | 18 | 37 | **92.5** | Excelente (Excellent) |
| **Estudiante Evaluador 3** | 16 | 18 | 34 | **85.0** | Excelente (Excellent) |
| **Promedio**                 | **17.2** | **17.4** | **34.6** | **86.5** | **Excelente (Clase A)** |

---

### Ejemplo Detallado de Conversión Real: Estudiante Evaluador 1

*   **Respuestas brutas dadas:** `P1=5, P2=1, P3=4, P4=1, P5=5, P6=2, P7=4, P8=1, P9=5, P10=2`
*   **Cálculo de Impares (Respuesta - 1):**
    *   P1: 5 - 1 = 4
    *   P3: 4 - 1 = 3
    *   P5: 5 - 1 = 4
    *   P7: 4 - 1 = 3
    *   P9: 5 - 1 = 4
    *   *Suma de Impares (A) = 4 + 3 + 4 + 3 + 4 = 18*
*   **Cálculo de Pares (5 - Respuesta):**
    *   P2: 5 - 1 = 4
    *   P4: 5 - 1 = 4
    *   P6: 5 - 2 = 3
    *   P8: 5 - 1 = 4
    *   P10: 5 - 2 = 3
    *   *Suma de Pares (B) = 4 + 4 + 3 + 4 + 3 = 18*
*   **Cálculo Final:**
    *   Total Bruto = `18 (A) + 18 (B) = 36`
    *   Puntaje SUS Final = `36 * 2.5 = 90.0`

---

## 4. Interpretación Técnica de Resultados

El puntaje promedio obtenido para **Planner-UC** es de **86.5 / 100**.

### Análisis de Aceptabilidad y Adjetivos (Modelo de Bangor et al.)
1.  **Nivel de Aceptabilidad:** **Aceptable** (Cualquier puntaje superior a 70 se considera dentro del rango de aceptabilidad).
2.  **Calificación por Adjetivo:** **Excelente (Excellent)** (El umbral para "Excelente" es 85, mientras que para "Bueno" es 70-84).
3.  **Clasificación de Grado (Grade Scale):** **Clase A** (Puntajes > 80.3 se ubican en la categoría A, lo que refleja una excelente experiencia del usuario).
4.  **Net Promoter Score (NPS) Estimado:** **Promotor** (Los puntajes SUS superiores a 80 correlacionan fuertemente con usuarios que recomendarían activamente la aplicación).

### Oportunidades de Mejora Derivadas
*   **Complejidad en Roles Administrativos (P4 y P10):** Aunque el promedio general es alto, la curva de aprendizaje para configurar la programación global puede suavizarse incluyendo guías rápidas o tooltips interactivos (sugerido para siguientes versiones).
