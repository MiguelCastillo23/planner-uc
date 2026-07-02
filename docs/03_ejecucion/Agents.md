# 🧠 Agents & System Constitution
## Planner-UC – Generador Óptimo de Horarios Académicos

---

## 1. Principios del Sistema

1. **Validez sobre optimización**
   - Ningún horario con conflictos (solapamientos o inconsistencias) será aceptado, independientemente de su puntaje de fitness.

2. **Optimización multi-criterio**
   - El sistema busca minimizar conflictos y penalizaciones mediante una función de fitness que integra múltiples restricciones.

3. **Consistencia determinística bajo mismas condiciones**
   - Dadas las mismas entradas y parámetros del algoritmo genético, el sistema debe producir resultados comparables.

4. **Eficiencia computacional (Green Software)**
   - El sistema limita el número de iteraciones (máx. 500 generaciones) para reducir consumo de CPU y garantizar tiempos de respuesta aceptables.

5. **Escalabilidad**
   - El sistema debe soportar incrementos en el número de cursos, secciones y usuarios sin degradación significativa del rendimiento.

6. **Transparencia de decisiones**
   - Las soluciones generadas deben poder explicarse en términos de penalizaciones aplicadas en la función de fitness.

---

## 2. Reglas Globales del Sistema

1. Toda solución generada debe pasar por la evaluación de la función de fitness antes de ser considerada válida.

2. Las restricciones duras tienen prioridad absoluta:
   - Cualquier individuo que viole una restricción dura recibe penalización máxima o es descartado.

3. El algoritmo genético opera bajo:
   - Selección por torneo
   - Evolución iterativa de soluciones
   - Poda implícita mediante penalización

4. El sistema no garantiza óptimo global, pero sí soluciones cercanas al óptimo en tiempo eficiente.

5. La generación de horarios solo se habilita si:
   - El estudiante selecciona entre 20 y 22 créditos

6. Todas las soluciones deben respetar la ventana horaria institucional:
   - 07:00 AM – 10:00 PM

7. Se debe mantener un intervalo mínimo de transición entre sesiones:
   - 11 minutos obligatorios

---

## 3. Restricciones del Sistema

---

### 3.1 Restricciones Duras (Hard Constraints)

Estas restricciones son obligatorias y no pueden violarse:

#### Académicas
- La carga académica debe estar entre 20 y 22 créditos
- Cada curso debe tener exactamente una sección asignada

#### Temporales
- No puede existir solapamiento de horarios entre cursos
- Se debe respetar el intervalo mínimo de 11 minutos entre sesiones
- Todas las clases deben estar dentro de la ventana 07:00 AM – 10:00 PM

#### Estructura de cursos
- Cursos de 3 créditos:
  - Bloque continuo de 3 horas
- Cursos de 4 créditos:
  - Un bloque de 3 horas + un bloque de 1.5 horas en días distintos

#### Recursos
- Un aula no puede ser asignada a más de un curso en el mismo horario
- Un docente no puede dictar más de una clase simultáneamente

---

### 3.2 Restricciones Blandas (Soft Constraints)

Estas restricciones no invalidan la solución, pero afectan el fitness:

- Minimizar huecos entre clases
- Evitar horarios extremos (muy temprano o muy tarde)
- Agrupar clases en bloques continuos
- Minimizar tiempos muertos entre sesiones
- Priorizar combinaciones más compactas

---

## 4. Políticas de Evaluación

- La calidad de un horario se determina mediante una función de fitness
- Se penalizan:
  - Solapamientos
  - Conflictos de recursos (aulas, docentes)
  - Violaciones de estructura de cursos
  - Ineficiencia en distribución del tiempo

---

## 5. Estrategia de Resolución

El sistema utiliza un **Algoritmo Genético (GeneticEngine)** para aproximar la solución del problema.

Proceso:

1. Generación de población inicial
2. Evaluación mediante función de fitness
3. Selección por torneo
4. Aplicación de operadores genéticos:
   - Cruce (crossover)
   - Mutación
5. Evolución iterativa hasta:
   - 500 generaciones
   - o convergencia a solución válida

---

## 6. Manejo de Errores

- Si no se encuentra solución válida:
  - El sistema informa inconsistencia en restricciones
  - Se recomienda reducir carga o ajustar selección de cursos

---

## 7. Gobernanza del Sistema

- Toda modificación en reglas o restricciones debe reflejarse en:
  - Este documento (Agents.md)
  - Spec.md

- Los cambios deben ser versionados en el repositorio GitHub

- La coherencia entre:
  - Requerimientos
  - Restricciones
  - Implementación
  es obligatoria
