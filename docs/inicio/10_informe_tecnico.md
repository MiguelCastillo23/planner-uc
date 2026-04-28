# Informe Técnico: Prototipo de Generación Óptima de Horarios

**Proyecto:** Planner-UC   
**Stack Tecnológico:** MERN (MongoDB, Express, React, Node.js)

---

## 1. Organización del Entorno y Estructura
El proyecto se ha estructurado bajo un esquema de **Monorepositorio** con separación clara de responsabilidades, facilitando la integración fluida entre el backend y el frontend.

- **/backend**: API REST en Node.js v22.20.0 con arquitectura de controladores y modelos.
- **/frontend**: Aplicación SPA en React con Vite v6.0.10.

> **url imagen estructura: https://i.ibb.co/ccr6pxfQ/Estructura.png**

---

## 2. Modelado del Problema y Restricciones
Se han formalizado las siguientes restricciones académicas dentro del motor genético para garantizar coherencia con el contexto universitario:

1. **Carga Académica:** Restricción estricta de **20 a 22 créditos** por horario.
2. **Estructura de Sesiones:** 
   - Cursos de 3 créditos: Bloque continuo de 3 horas.
   - Cursos de 4 créditos: Bloque de 3 horas + bloque de 1.5 horas en días distintos.
3. **Intervalo de Transición:** Margen obligatorio de **11 minutos** entre sesiones.
4. **Ventana Horaria:** Operación exclusiva entre las 07:00 AM y 10:00 PM.

---

## 3. Especificación Técnica y TDD (Test Driven Development)
Siguiendo un enfoque de **Spec-Driven Development**, se desarrollaron pruebas unitarias antes de la lógica final para asegurar la trazabilidad de los requisitos.

### Evidencia de Pruebas Unitarias
Se utilizó **Jest** con soporte para ES Modules para validar la lógica de fitness y la generación de sub-bloques.

```bash
npm test
```
> **url imagen test: https://i.ibb.co/Z6VS0TMj/image.png**

---

## 4. Implementación del Algoritmo Genético (Motor)
El motor genético (`GeneticEngine`) utiliza una función de **Fitness** que penaliza solapamientos de aulas, docentes y desbordamientos horarios.

### Características de Optimización:
- **Green Software:** Algoritmo optimizado para converger en un máximo de 500 iteraciones, reduciendo ciclos de CPU innecesarios.
- **Eficiencia:** Uso de métodos de selección por torneo para mejorar la velocidad de procesamiento.

> **url imagen logs: https://i.ibb.co/21TRvdhG/Fitness.jpg**             
> **url imagen logs: https://i.ibb.co/LXgwmZcc/Logs.png**

---

## 5. Prototipo Funcional y Visualización
La interfaz permite una interacción humana con el algoritmo, validando los créditos antes de proceder a la generación.

### Selección de Cursos
El usuario elige las asignaturas; el sistema bloquea la generación si no se cumple el rango de 20-22 créditos.
> **url imagen creditos: https://i.ibb.co/dwxx2LD4/Contador-Creditos.jpg**

### Grid de Horario
Visualización final mediante CSS Grid que une sesiones consecutivas para representar la continuidad pedagógica.
> **url imagen vista final: https://i.ibb.co/Mqy8FyR/Horario.png**

---

## 6. Requisitos No Funcionales y Métricas
- **Rendimiento:** Generación de horario óptimo en un tiempo medio de **0.8s**, superando la meta de <2s.
- **Escalabilidad:** Conexión a MongoDB Atlas mediante pool de conexiones para soportar múltiples usuarios concurrentes.
- **Eficiencia:** Implementación de `.lean()` en consultas para minimizar el consumo de memoria en el servidor.



