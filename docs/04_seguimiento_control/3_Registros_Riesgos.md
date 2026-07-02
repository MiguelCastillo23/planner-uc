# REGISTRO DE RIESGOS Y OPORTUNIDADES (VERSIÓN 3.0.0)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible  
**Gerente del Proyecto / Scrum Master:** Miguel Angel Castillo Rojas  
**Equipo de Desarrollo:** Alain Aliaga Eulogio, Erick Sanchez Vicente, Tony Ulloa Alvinagorta  
**Fecha de Actualización:** 22 de junio de 2026 *(Hito 5 / Cierre de Sprint 4)*  
**Versión:** 3.0.0 (Consolidación de Calidad, Seguridad y Sostenibilidad)  

---

## 1. EVOLUCIÓN DE RIESGOS EXISTENTES (CIERRES Y DEGRADACIONES)

| ID | Descripción Original | Puntuación Anterior | Nuevo Estado | Nueva Puntuación | Justificación Técnica basada en Documentos |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **R-07** | Incumplimiento de pautas Green Software | 4 | **CERRADO** | **0** | **Superado con éxito.** El reporte evidencia una reducción del **94.7% en emisiones de CO2** (de 0.001049g a 0.000055g) y optimización de tiempos de respuesta a 16ms mediante compresión Gzip y Lazy Loading en React. |
| **R-12** | Baja cobertura de pruebas automatizadas | 6 | **CERRADO** | **0** | **Superado con éxito.** El informe técnico de QA demuestra que alcanzaron un **89.4% de cobertura global** y **92.3% en lógica crítica**, logrando el 100% en el motor genético (`genetic.js`). |
| **R-06** | Exceder límites del Tier Gratuito Cloud | 4 | **DEGRADADO** | **2** *(Verde)* | **Riesgo Controlado.** Al implementar cabeceras `Cache-Control` (respuestas 304) y reducir las peticiones en un 84.2%, las consultas de lectura a MongoDB Atlas cayeron drásticamente, protegiendo la capa gratuita. La probabilidad baja de 2 a 1. |

---

## 2. MATRIZ DE NUEVOS RIESGOS TÉCNICOS Y DE NEGOCIO (EFECTOS SECUNDARIOS)

| ID | Descripción del Nuevo Riesgo | Área de Impacto | Causa Principal (Origen en Documentación) | Impacto | Prob. | Puntuación | Det. | Estado | Estrategia y Plan de Acción Urgente | Dueño Asignado |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **R-13** | **Falso "Horario No Encontrado" por límite Green** | 1.3 Complejidad <br> 1.4 Desempeño | Para ahorrar energía, el reporte Green limitó `GeneticEngine` estrictamente a **300 iteraciones**. En mallas complejas con aforos rígidos y rango estricto de 20-22 créditos (**R02**), 300 iteraciones pueden ser insuficientes para que el CSP converja. | 3 | 2 | **6** *(Crítico)* | 2 | Activo | **Mitigar:** Implementar un mecanismo de *Fallback Dinámico*. Si a las 300 iteraciones no converge, permitir un segundo pase computacional de 200 iteraciones adicionales, notificando en la UI. | **Miguel Angel Castillo** *(Líder Algoritmo CSP)* |
| **R-14** | **Bypass de prerrequisitos o aforos por Caché** | 1.3 Interfaces <br> 2.4 Stakeholders | Aplicaron caché de 60s en `/api/cursos`. Si un coordinador actualiza un cupo o regla en MongoDB, durante 60 segundos el frontend servirá datos obsoletos (HTTP 304), permitiendo matrículas ilegales que violan el **RF-02** y **RF-03**. | 3 | 2 | **6** *(Crítico)* | 2 | Activo | **Evitar:** Implementar invalidación selectiva de caché (*Cache Purge* / ETags) en el backend cada vez que un administrador ejecute un `PUT/POST` sobre Cursos o Aulas. | **Alain Aliaga / Tony Ulloa** *(Frontend / Backend)* |
| **R-15** | **Quiebre del CI/CD por dualidad Jest-Vitest** | 4.2 Control <br> 1.2 Tecnología | El informe de QA revela que hubo errores de sintaxis al integrar Jest con Vitest, solucionados con un archivo de configuración externo. En el despliegue final en la nube (Hito 6), los pipelines automatizados pueden fallar por discrepancias de entorno. | 2 | 2 | **4** *(Moderado)* | 2 | Activo | **Mitigar:** Estandarizar el runner de pruebas del CI/CD exclusivamente a Vitest, bloqueando en el `package.json` las versiones exactas de las dependencias. | **Tony Ulloa** *(Seguridad / QA / Backend)* |
| **R-16** | **Corrupción de datos en Adecuación de Planes** | 1.1 Requerimientos <br> 3.1 Dependencias | El **RNF-05** exige que, al volver de una reserva, el alumno sea adecudo automáticamente al plan vigente. Programar equivalencias dinámicas de mallas en Node.js es altamente complejo y un error corrompería la historia académica del alumno. | 3 | 3 | **9** *(Crítico)* | 2 | Activo | **Mitigar:** Crear una colección intermedia de `EquivalenciasMalla` en MongoDB y forzar que la adecuación automática pase por un estado de "Pendiente de Aprobación" por el Coordinador. | **Erick Sanchez / Alain Aliaga** *(Product Owners)* |
| **R-17** | **Evasión de deudas por concurrencia extrema** | 1.4 Calidad <br> 3.1 Dependencias | Aunque arreglaron la desalineación de estados financieros, si un alumno moroso lanza peticiones concurrentes (múltiples pestañas) antes de que MongoDB persista el bloqueo del **RNF-01**, podría lograr formalizar su matrícula. | 3 | 2 | **6** *(Crítico)* | 2 | Activo | **Evitar:** Implementar transacciones ACID (*MongoDB Transactions*) y bloqueos de registro a nivel de base de datos durante la verificación financiera. | **Miguel Castillo / Tony Ulloa** *(Backend Developers)* |

---

## 3. ACTUALIZACIÓN DE LA MATRIZ DE OPORTUNIDADES

| ID | Descripción de la Oportunidad | Área de Impacto | Causa de la Oportunidad | Impacto | Prob. | Puntos | Estado | Estrategia y Plan de Acción | Dueño Asignado |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **O-07** | **Optimización radical Green Software** | 1.4 Desempeño | Refactorización del código completada. | 2 | 2 | **4** | **CAPITALIZADA** | **Ejecutada.** Tiempos reducidos a 16ms y payload comprimido en 87.1%. Se utilizará como métrica de éxito en la sustentación. | **Miguel Castillo** |
| **O-09** | **Distinción "Green IT" Académica y B2B** *(Nueva)* | 2.3 Mercado <br> 2.4 Stakeholders | El software cuenta con una auditoría real de huella de carbono (`CO2.js`) que supera los estándares de software universitario tradicional. | 3 | 3 | **9** | Activo | **Explotar:** Presentar el reporte de sostenibilidad a la Coordinación Académica como mérito de innovación e incluir el algoritmo de eficiencia energética en el portafolio comercial B2B de *Jstack Digital Solutions*. | **Alain Aliaga / Tony Ulloa** *(PO / Product Master)* |

***
*Documento de uso interno del equipo Scrum. Generado para auditoría de Hito 5 / Sustentación Final.*