# 🧠 Sistema de Generación Óptima de Horarios Académicos  
## Planner-UC

Este proyecto corresponde al **Proyecto de Fin de Asignatura (PFA)** del curso *Taller de Proyectos 2* de la Universidad Continental.

El sistema aborda un problema complejo de ingeniería: la generación de horarios académicos en entornos de currículo flexible, caracterizado por alta combinatoria, múltiples restricciones y ausencia de soluciones triviales.

---

## 👥 Integrantes del Equipo

- Miguel Angel Castillo Rojas  
- Alain Aliaga Eulogio  
- Erick Sanchez Vicente  
- Ulloa Alvinagorta Tony  

---

## 🎯 Descripción del Sistema

Planner-UC es un sistema que genera horarios académicos óptimos para estudiantes, garantizando:

- Cumplimiento de restricciones académicas  
- Eliminación de conflictos de horarios  
- Optimización del uso del tiempo  

El problema se modela como un:

👉 **Constraint Satisfaction Problem (CSP)**  

Y se resuelve mediante:

👉 **Algoritmo Genético (GeneticEngine)**  

---

## 🧠 Enfoque de Resolución

### 🔹 Modelado del Problema

CSP = (X, D, C)

- **X:** Cursos seleccionados  
- **D:** Secciones disponibles  
- **C:** Restricciones académicas, temporales y de recursos  

---

### 🔹 Algoritmo Genético

El sistema utiliza un motor evolutivo para explorar soluciones:

#### Representación
Cada individuo representa un horario completo:

*Curso → Sección asignada*

#### Función de Fitness
Se penalizan:

- Solapamientos de horarios  
- Conflictos de aula  
- Conflictos de docente  
- Violaciones de reglas académicas  

Objetivo:

*Maximizar fitness → Minimizar conflictos*


#### Operadores Genéticos

- Selección: Torneo  
- Cruce: Combinación de soluciones  
- Mutación: Cambio aleatorio de sección  

#### Criterio de parada

- Máximo 500 generaciones  
- O convergencia a solución válida  

---

## 📜 Reglas del Sistema

### 🔴 Restricciones Duras

- No solapamiento de horarios  
- Docente único por horario  
- Aula única por horario  
- Rango de créditos: **20–22**  
- Ventana horaria: **07:00 – 22:00**  
- Intervalo mínimo: **11 minutos**  

---

### 🟡 Restricciones Blandas

- Minimizar huecos  
- Evitar horarios extremos  
- Agrupar clases  

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue el stack **MERN**:

- **Frontend:** React (Vite)  
- **Backend:** Node.js + Express  
- **Base de Datos:** MongoDB Atlas  

---

## ⚙️ Instalación y Ejecución

### 🔹 Requisitos

- Node.js v22+
- MongoDB

### 🔹 Backend
    cd backend
    npm install
    npm run dev

### 🔹 Backend
    cd frontend
    pm install
    npm run dev
---
## 🧪 Testing

Se implementaron pruebas unitarias con Jest para validar:

Función de fitness
Generación de bloques horarios

    npm test

## 📊 Métricas del Sistema

- ⏱️ Tiempo promedio: 0.8 segundos
- 🎯 Meta: < 2 segundos
- ♻️ Optimización: límite de 500 iteraciones (Green Software)
---
## 📂 Documentación del Inicio del Proyecto - Spring0

A continuación, se presenta el índice dinámico de los documentos de gestión y análisis inicial. Haz clic en cada uno para visualizar el detalle:

1. 📑 [Documento de Selección del Enfoque del Proyecto](./docs/inicio/1_seleccion_enfoque.md)
2. 👁️ [Declaración de la Visión del Proyecto](./docs/inicio/2_vision_proyecto.md)
3. 📜 [Acta de Constitución (Project Charter)](./docs/inicio/3_project_charter.md)
4. 📌 [Registro de Supuestos y Restricciones](./docs/inicio/4_supuestos_restricciones.md)
5. 🤝 [Declaración del Equipo del Proyecto](./docs/inicio/5_equipo_proyecto.md)
6. 🎯 [Product Backlog Inicial](./docs/inicio/6_product_backlog.md)
7. 📋 [Lista Preliminar de Requerimientos (RF y RNF)](./docs/inicio/7_lista_requerimientos.md)
8. 💵 [Presupuesto Proyecto](./docs/inicio/8_presupuesto_del_proyecto.md)
9. ⚠️ [Registro de Riesgos](./docs/inicio/9_registro_riesgos.md)
10. 📑 [Informe_Tecnico](./docs/inicio/10_informe_tecnico.md)
---
## 🧠 Documentación Técnica (SDD)
- 📘 [Especificación formal del sistema](./docs/inicio/Spec.md)
- 🧠 [Principios, reglas y restricciones](./docs/inicio/Agents.md)
---
## 🔗 Herramientas de Gestión
* **Jira** https://continental-poyectos2.atlassian.net/jira/software/projects/TC/boards/1/backlog?epics=visible&atlOrigin=eyJpIjoiZDI2ZDJjZGQ1OTJkNDZlZDllNWI4ODAxNjczMjE1ZDIiLCJwIjoiaiJ9
---
📅 Ciclo Académico 2026-01
🏫 Universidad Continental – Huancayo
