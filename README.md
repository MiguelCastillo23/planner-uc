# 🧠 Sistema de Generación Óptima de Horarios Académicos - Planner-UC

Este proyecto corresponde al **Proyecto de Fin de Asignatura (PFA)** del curso *Taller de Proyectos 2* de la Universidad Continental. El sistema aborda un problema complejo de ingeniería: la generación de horarios en entornos de currículo flexible, caracterizado por alta combinatoria y múltiples restricciones.

---

## 👥 Integrantes del Equipo
- Miguel Angel Castillo Rojas  
- Alain Aliaga Eulogio  
- Erick Sanchez Vicente  
- Ulloa Alvinagorta Tony  

---

## 🎯 Descripción del Sistema
Planner-UC es un sistema que genera horarios académicos óptimos garantizando el cumplimiento de restricciones académicas, la eliminación de conflictos y la optimización del tiempo.

El problema se modela formalmente como un:
👉 **Constraint Satisfaction Problem (CSP)**  

Y se resuelve mediante un motor evolutivo:
👉 **Algoritmo Genético (GeneticEngine)**  

---

## 🧠 Enfoque de Resolución

### 🔹 Modelado del Problema (CSP)
El sistema implementa el modelo **CSP = (X, D, C)** de forma dinámica:
- **X (Variables):** Cursos seleccionados por el usuario en el Frontend.
- **D (Dominios):** Secciones disponibles recuperadas en tiempo real desde **MongoDB Atlas**.
- **C (Restricciones):** Reglas académicas, temporales y de recursos que actúan como la función de fitness.

### 🔄 Flujo de Datos (Arquitectura de Información)
1. **Captura (X):** El usuario selecciona cursos; React valida el rango de **20-22 créditos**.
2. **Inyección (D):** Node.js extrae de la base de datos los horarios y aulas (A101-M202) de cada sección.
3. **Procesamiento (C):** El **GeneticEngine** aplica la lógica de penalización para encontrar el individuo con **Fitness = 0**.
4. **Renderizado:** Los datos fluyen al componente `ScheduleGrid.jsx` para mostrar el calendario interactivo.

### 🔹 Algoritmo Genético
*   **Representación:** Cada individuo es un horario completo (*Curso → Sección*).
*   **Función de Fitness:** Maximizar fitness minimizando solapamientos, conflictos de aula/docente y violaciones de margen.
*   **Operadores:** Selección por Torneo, Cruce de soluciones y Mutación aleatoria.
*   **Criterio de Parada:** Máximo **2000 generaciones** o convergencia total (**Green Software**).

---

## 📜 Reglas del Sistema

### 🔴 Restricciones Duras (Obligatorias)
- **Margen de Transición:** Intervalo mínimo de **11 minutos** entre sesiones.
- **Estructura de Bloques:** Sesiones estándar de **90 minutos**.
- **Carga Académica:** Rango estricto de **20–22 créditos**.
- **Ventana Operativa:** De 07:00 AM a 10:00 PM.
- **Exclusividad:** No solapamiento de Horario, Docente o Aula.

### 🟡 Restricciones Blandas (Deseables)
- Minimizar "huecos" o ventanas entre clases.
- Evitar horarios extremos y agrupar sesiones en días contiguos.

---

## 🏗️ Arquitectura del Sistema (MERN Stack)
- **Frontend:** React (Vite) + CSS Grid para el calendario.
- **Backend:** Node.js + Express.
- **Base de Datos:** MongoDB Atlas.
- **Infraestructura:** Despliegue en la nube optimizado para bajo consumo de recursos.

---

## ⚙️ Instalación y Ejecución

### 🔹 Requisitos
- Node.js v22+
- MongoDB Atlas (Configurar `.env` con `MONGO_URI`)

### 🔹 Backend
```bash
cd backend
npm install
npm run dev
```

### 🔹 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing y Métricas
Se implementaron pruebas unitarias con **Jest** para validar la función de fitness y el cumplimiento de los 11 minutos de margen.

```bash
npm test
```

*   **⏱️ Tiempo Promedio:** 0.8 - 1.5 segundos.
*   **🎯 Meta:** < 2 segundos.
*   **♻️ Optimización:** Límite de 2000 iteraciones para reducir huella de carbono (**Green Software**).

---

## 📂 Documentación del Proyecto

<details>
<summary><b>🛠️ Inicio y desarrollo del proyecto</b></summary>

<blockquote>
<details>
<summary><b>📦 V 1.0.0</b></summary>

### Gestión Inicial (Sprint 0)
1. 📑 [Selección del Enfoque](./docs/inicio/v1.0.0/1_seleccion_enfoque.md)
2. 👁️ [Visión del Proyecto](./docs/inicio/v1.0.0/2_vision_proyecto.md)
3. 📜 [Project Charter](./docs/inicio/v1.0.0/3_project_charter.md)
4. 📌 [Supuestos y Restricciones](./docs/inicio/v1.0.0/4_supuestos_restricciones.md)
5. 🤝 [Declaración del Equipo](./docs/inicio/v1.0.0/5_equipo_proyecto.md)
6. 🎯 [Product Backlog](./docs/inicio/v1.0.0/6_product_backlog.md)
7. 📋 [Requerimientos (RF/RNF)](./docs/inicio/v1.0.0/7_lista_requerimientos.md)
8. 💵 [Presupuesto del Proyecto](./docs/inicio/v1.0.0/8_presupuesto_del_proyecto.md)
9. ⚠️ [Registro de Riesgos](./docs/inicio/v1.0.0/9_registro_riesgos.md)
10. 📑 [Informe Técnico Final](./docs/inicio/v1.0.0/10_informe_tecnico.md)

### Documentación Técnica (SDD)
- 📘 [Especificación Formal (Spec.md)](./docs/inicio/v1.0.0/Spec.md)
- 🧠 [Constitución y Reglas (Constitution.md)](./docs/inicio/v1.0.0/constitution.md)

</details>
</blockquote>

<blockquote>
<details>
<summary><b>🚀 V 2.0.0</b></summary>

### Gestión de Nuevas Versiones
1. 📑 [Nuevos Requerimientos](./docs/inicio/v2.0.0/1_nuevos_req.md)
2. 🌱 [Reporte de Sostenibilidad y Green MERN](./docs/inicio/v2.0.0/2_green_software.md)
3. 📋 [Reporte de Pruebas Aplicadas](./docs/inicio/v2.0.0/3_reporte_pruebas.md)

</details>
</blockquote>

</details>

<details>
<summary><b>🎓 Cierre del proyecto</b></summary>

### Documentos Finales de Entrega
1. 📑 [Informe Final del Proyecto](./docs/cierre/1_Informe_Final.md)
2. 🧠 [Informe Final de Lecciones Aprendidas](./docs/cierre/2_Lecciones_Aprendidas.md)
3. ⚠️ [Registro de Riesgos](./docs/cierre/3_Registros_Riesgos.md)
4. 💥 [Registro de Incidentes o Problemas](./docs/cierre/4_Incidentes.md)
5. 🚧 [Registro de Impedimentos](./docs/cierre/5_Impedimentos.md)
6. 🐛 [Registro de Defectos](./docs/cierre/6_Registro_Defectos.md)
7. 📋 [Registro de Supuestos](./docs/cierre/7_Supuestos.md)
8. 📜 [Acta de Constitución del Proyecto](./docs/cierre/8_Constitucion.md)
9. 📢 [Declaración de Trabajo (SOW)](./docs/cierre/9_Declaracion.md)
10. 🎓[Documentación de Capacitación](./docs/cierre/91_Capacitacion.md)

</details>


## 🔗 Herramientas de Gestión
*   **Jira Software:** [Tablero de Control y Backlog](https://atlassian.net)

---
📅 **Ciclo Académico 2026-01**  
🏫 **Universidad Continental – Huancayo**
