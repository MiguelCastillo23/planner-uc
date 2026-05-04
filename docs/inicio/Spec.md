# 📘 Especificación Formal del Sistema
## Planner-UC – Generador Óptimo de Horarios Académicos

---

## 1. Descripción General del Sistema

Planner-UC es un sistema que genera horarios académicos óptimos para estudiantes en entornos de currículo flexible.

El problema se caracteriza por:
- Alta complejidad combinatoria
- Restricciones múltiples e interdependientes
- Necesidad de optimización multi-criterio

Por ello, el sistema modela el problema como un **Constraint Satisfaction Problem (CSP)** y lo resuelve mediante un **Algoritmo Genético (GeneticEngine)**.

---

## 2. Especificación Formal del Problema

### 2.1 Modelo CSP

El problema se define como:

CSP = (X, D, C)

Donde:

- X: conjunto de variables (cursos seleccionados)
- D: dominios (secciones disponibles por curso)
- C: restricciones (académicas, temporales y de recursos)

---

### 2.2 Variables (X)

Cada variable representa un curso seleccionado por el estudiante:

X = {Curso₁, Curso₂, ..., Cursoₙ}

---

### 2.3 Dominios (D)

Cada variable toma valores de:

D(Cursoᵢ) = conjunto de secciones disponibles

Cada sección contiene:
- Horario
- Docente
- Aula

---

### 2.4 Restricciones (C)

Las restricciones se dividen en:

- Restricciones duras (obligatorias)
- Restricciones blandas (optimizables)

Estas son evaluadas mediante la función de fitness del algoritmo genético.

---

## 3. Entradas del Sistema

El sistema requiere los siguientes datos:

### 3.1 Datos Académicos
- Lista de cursos disponibles
- Créditos por curso
- Secciones por curso

### 3.2 Datos de Horario
- Horarios de cada sección
- Días de dictado
- Duración de sesiones

### 3.3 Datos de Recursos
- Docentes asignados por sección
- Aulas asignadas por sección

### 3.4 Datos del Usuario
- Cursos seleccionados
- Validación de carga académica (20–22 créditos)

---

## 4. Salidas del Sistema

El sistema produce:

### 4.1 Horario Óptimo
- Asignación de una sección por curso
- Representación visual del horario (grid)

### 4.2 Métrica de Calidad
- Valor de fitness del horario generado

### 4.3 Estado de Resultado
- Éxito: horario válido generado
- Error: imposibilidad de generar horario válido

---

## 5. Reglas de Negocio

### 5.1 Reglas Académicas
- La carga académica debe estar entre 20 y 22 créditos
- Cada curso debe tener exactamente una sección asignada

---

### 5.2 Reglas Temporales
- No debe existir solapamiento entre sesiones
- Debe existir un intervalo mínimo de 11 minutos entre clases
- Todas las sesiones deben estar dentro del rango:
  - 07:00 AM – 10:00 PM

---

### 5.3 Reglas de Estructura de Cursos
- Cursos de 3 créditos:
  - Sesión continua de 3 horas
- Cursos de 4 créditos:
  - Un bloque de 3 horas + un bloque de 1.5 horas en días distintos

---

### 5.4 Reglas de Recursos
- Un aula no puede ser usada simultáneamente por más de un curso
- Un docente no puede dictar más de una clase al mismo tiempo

---

### 5.5 Reglas de Generación
- El sistema solo genera horarios si se cumple el rango de créditos
- Las soluciones son evaluadas mediante función de fitness
- Se priorizan soluciones sin conflictos

---

## 6. Función de Evaluación (Fitness)

El sistema evalúa cada solución mediante penalización:

Fitness = − (conflictos + penalizaciones)

Donde se penaliza:

- Solapamientos de horarios
- Conflictos de aula
- Conflictos de docente
- Violaciones de estructura de curso
- Ineficiencia en distribución del tiempo

Objetivo:
Maximizar el fitness (minimizar conflictos)

---

## 7. Casos Límite

### 7.1 No existe solución válida
- Cursos incompatibles entre sí
- Restricciones demasiado estrictas

---

### 7.2 Carga académica inválida
- Créditos menores a 20 o mayores a 22
- El sistema bloquea la generación

---

### 7.3 Datos incompletos
- Cursos sin secciones
- Secciones sin horarios definidos

---

### 7.4 Alta complejidad combinatoria
- Muchas secciones por curso
- Puede afectar tiempo de convergencia

---

### 7.5 Convergencia no óptima
- El algoritmo genético puede no encontrar la mejor solución absoluta
- Se retorna la mejor solución encontrada

---

## 8. Validaciones del Sistema

- Validación de créditos antes de ejecución
- Validación de integridad de datos
- Verificación de conflictos antes de mostrar resultados

---

## 9. Supuestos

- Los datos ingresados son correctos
- No hay cambios en tiempo real durante la ejecución
- Las secciones están previamente definidas

---

## 10. Criterios de Aceptación

- No existen conflictos en restricciones duras
- Se genera un horario en tiempo < 2 segundos
- El resultado cumple con la estructura académica definida
- Se minimizan penalizaciones en restricciones blandas
