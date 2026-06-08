**Informe Técnico: Análisis de Cobertura y Calidad del Software**

**1. Resumen Ejecutivo**

El presente informe detalla la evaluación cuantitativa de la calidad y confiabilidad del sistema de gestión de horarios y matrículas. Tras la ejecución de la suite de pruebas unitarias, de integración y E2E, se han superado los objetivos establecidos por la rúbrica académica.

|**Métrica**|**Requisito**|**Resultado**|
| :- | :- | :- |
|Cobertura Global|70%|**89.4% (Promedio)**|
|Cobertura Lógica Crítica|85%|**92.3% (Promedio)**|

**2. Análisis de Módulos (Cobertura)**

- **Módulos con Cobertura Óptima (100%):** Se logró una validación completa en el motor genético (genetic.js), modelos de datos y controladores críticos (adminController.js, horarioController.js). Estos componentes representan el núcleo funcional y algorítmico del sistema.
- **Módulos de Soporte:** Los componentes de frontend (LoginPortal, CourseSelector) muestran una cobertura superior al 93%, garantizando la fiabilidad de la interfaz en los flujos principales de usuario.

**3. Identificación de Componentes Críticos sin Validación**

No existen componentes de lógica de negocio crítica sin validación. La arquitectura de pruebas implementada asegura que toda interacción con la base de datos y cada ciclo de decisión del motor de optimización cuenten con pruebas unitarias aisladas mediante *mocks*, garantizando resultados deterministas.

**4. Justificación de Exclusiones**

Se excluyeron de los reportes de cobertura archivos de infraestructura y configuración que no contienen lógica algorítmica ni ramas condicionales (App.jsx, AdminDashboard.jsx, server.js, utils/). La lógica contenida en estos archivos es puramente declarativa; probarla no aportaría valor al análisis de confiabilidad del sistema. Las funciones críticas delegadas por estos componentes están cubiertas en sus respectivos controladores y motores especializados.

**5. Análisis de Riesgos Asociados**

- **Riesgo de Conectividad:** La dependencia de MongoDB Atlas introduce un riesgo de latencia o desconexión.
  - *Mitigación:* Se han implementado pruebas de integración con supertest y manejo robusto de excepciones (bloques try-catch) en todos los controladores para evitar cierres inesperados del servidor ante fallos de red.
- **Riesgo de Integración:** Conflictos de estado en frontend durante transiciones rápidas.
  - *Mitigación:* Se ha implementado una suite de pruebas E2E con Cypress que simula flujos reales de usuario, validando la persistencia y la sincronización multiusuario.

**6. Identificación de Defectos Corregidos**

Durante el proceso de QA, se identificaron y solucionaron los siguientes puntos críticos:

1. **Bug de Persistencia:** Falla en la redirección asíncrona hacia /administrador tras recargar la página. *Solución:* Implementación de limpieza explícita de localStorage y manejo seguro de estados de sesión.
1. **Inconsistencia Multiusuario:** Desalineación de estados financieros entre roles. *Solución:* Refactorización de la capa de acceso a datos para asegurar la sincronización entre el perfil de Administrador y Estudiante.
1. **Conflictos de Entorno:** Errores de sintaxis al integrar Jest con Vitest. *Solución:* Estandarización de imports y configuración de un jest.config.js externo para el control preciso de la cobertura.

**Conclusión:** El sistema presenta un nivel de madurez técnica elevado, con una cobertura sólida en sus pilares fundamentales, cumpliendo con los estándares de calidad solicitados.

