# Reporte de Sostenibilidad y Eficiencia del Software (Green MERN)

Este documento detalla el análisis de impacto ambiental de la aplicación **Planner UC**, las mejoras implementadas bajo los principios de *Green Software Engineering*, y el análisis comparativo del rendimiento antes y después de los cambios.

---

## 1. Sensibilización: Impactos Ambientales en Aplicaciones Web (Punto 2.1.c)
El desarrollo, despliegue y uso de aplicaciones modernas MERN conllevan costos físicos invisibles sobre el medio ambiente. A continuación, se enumeran los principales impactos ambientales asociados al ciclo de vida del software:

1.  **Consumo Energético de Servidores e Infraestructura de Nube:**
    Los servidores que alojan bases de datos (MongoDB Atlas) y APIs (Express en Node.js) operan 24/7. Requieren energía constante tanto para el procesamiento como para los sistemas de refrigeración de los Centros de Datos.
2.  **Consumo Eléctrico de Dispositivos Cliente:**
    Una interfaz frontend ineficiente (con excesivo renderizado, scripts pesados o sin lazy loading) obliga a la CPU y GPU del dispositivo del usuario (móvil, laptop) a operar a frecuencias altas, agotando la batería más rápido e incrementando la demanda eléctrica local.
3.  **Huella de Carbono del Tránsito de Red:**
    Cada kilobyte transferido por la red (fibra óptica, routers, antenas 4G/5G) requiere electricidad para su modulación y transporte. Respuestas HTTP no optimizadas o peticiones duplicadas inflan este consumo de forma innecesaria.
4.  **Generación de Residuos Electrónicos (E-waste):**
    El software ineficiente exige hardware de servidor más potente a corto plazo. Esto acelera la obsolescencia y desecho de hardware físico, generando residuos con metales pesados altamente contaminantes.

---

## 2. Identificación de Oportunidades y Justificación (Punto 2.2.c)
En la arquitectura MERN de **Planner UC** se detectaron las siguientes oportunidades clave de optimización:

*   **Motor Evolutivo del Algoritmo Genético:**
    *   *Componente:* `GeneticEngine` (Backend).
    *   *Justificación:* El cálculo de fitness y la generación de poblaciones implican bucles iterativos intensivos. Si no se restringen las iteraciones o se envían estructuras de datos pesadas en cada iteración, el uso de CPU se mantiene al 100% durante la solicitud. Se justifica optimizar el payload que recibe y limitar la búsqueda a 300 iteraciones (suficientes para converger con fitness estable).
*   **Peticiones Redundantes en Cursos (`/api/cursos`):**
    *   *Componente:* Rutas de Express y Controlador del Frontend.
    *   *Justificación:* Los cursos académicos son datos estáticos que cambian rara vez por semestre. Hacer consultas continuas a la base de datos MongoDB Atlas consume recursos de red y computación redundantes. Se justifica la implementación de una caché.
*   **Errores de Rutas Inexistentes (`/favicon.ico`):**
    *   *Componente:* Servidor de Backend.
    *   *Justificación:* Las solicitudes huérfanas forzaban al backend a evaluar todos los middlewares antes de retornar un 404 pesado. Se justifica silenciarlo con un retorno limpio `204`.

---

## 3. Sistema de Medición Utilizado (CO2.js)
Se incorporó la librería `@tgwf/co2` en el backend Express junto a un middleware de medición global que intercepta el flujo de datos de salida (`res.write` y `res.end`). Esto permite calcular la huella de carbono estimada para cada respuesta HTTP basándose en el modelo **Sustainable Web Design (SWD)**, el cual computa las emisiones de CO2 a partir de los bytes reales transferidos por la red.

---

## 4. Métricas Iniciales ("El Antes") - Estado Base
Se obtuvieron estas métricas iniciales navegando en la aplicación en su estado original sin optimizaciones (19 solicitudes totales).

### Indicadores Generales (Antes)
*   **Total de solicitudes procesadas:** 19
*   **CO2 Total generado:** 0.001049 gramos
*   **CO2 Promedio por solicitud:** 0.000055 gramos
*   **Endpoint más contaminante:** `/api/horarios/generar` (0.000430 g de CO2 en un solo envío)
*   **Endpoint más utilizado:** `/api/cursos` (8 solicitudes)

---

## 5. Mejoras Implementadas
Se aplicaron las siguientes optimizaciones técnicas. Cada una de ellas ataca un pilar de la eficiencia energética del software:

*   **Compresión Gzip (Express APIs):** Integración del middleware `compression`.
*   **Caché de Recursos y Cabeceras HTTP:** Caché en servidor por 60s y envío de `Cache-Control: public, max-age=60` con respuestas de estado `304 Not Modified`.
*   **Optimización de Consultas MongoDB (Proyección de Datos):** Uso del método `.select('nombre codigo creditos')` en el modelo `Curso`.
*   **Carga Perezosa (Lazy Loading en Frontend React):** Uso de `React.lazy` y `Suspense` para el componente pesado `ScheduleGrid`.
*   **Eliminación de Peticiones Huérfanas (Caso Favicon.ico):** Tag `<link rel="icon" href="data:,">` en el Dashboard HTML y una ruta `204 No Content` en Express para `/favicon.ico`.

---

## 6. Métricas Finales ("El Después") - Estado Optimizado
Se reinició el servidor y se realizaron las mismas acciones de navegación para evaluar el impacto de las mejoras.

### Indicadores Generales (Después)
*   **Total de solicitudes procesadas:** 3 *(Reducción del 84.2%)*
*   **CO2 Total generado:** 0.000055 gramos *(Reducción del 94.7%)*
*   **CO2 Promedio por solicitud:** 0.000018 gramos *(Reducción del 67.2%)*
*   **Endpoint más contaminante:** `/api/horarios/generar` (0.000055 g de CO2 total)
*   **Endpoint más utilizado:** `/api/horarios/generar` (2 solicitudes, incluyendo la de pre-vuelo OPTIONS)

### Detalle de Peticiones en el Estado Optimizado
| Fecha y Hora | Método | Ruta | Estado HTTP | Tiempo (ms) | Bytes Transferidos | CO2 Estimado (g) |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| 28/5/2026, 16:03:08 | GET | `/api/cursos` | 304 | 102 | **0 B** | **0.000000** |
| 28/5/2026, 16:03:02 | POST | `/api/horarios/generar` | 200 | 16 | **373 B** | **0.000055** |
| 28/5/2026, 16:03:02 | OPTIONS | `/api/horarios/generar` | 204 | 0 | **0 B** | **0.000000** |

---

## 7. Cuadro Comparativo de Impacto Ambiental

| Métrica | Antes (Sin Optimizar) | Después (Optimizado) | Porcentaje de Mejora | Impacto en la Sostenibilidad |
| :--- | :---: | :---: | :---: | :--- |
| **Transferencia /api/horarios/generar** | 2904 Bytes | 373 Bytes | **-87.1%** | Menor uso de ancho de banda y menor consumo en infraestructura de red global. |
| **Transferencia /api/cursos** | 854 Bytes | 0 Bytes (304 Cache) | **-100%** | Petición servida localmente por caché. Zero uso de red y base de datos para lecturas subsecuentes. |
| **Peticiones basura (favicon.ico)** | 8 peticiones (404) | 0 peticiones | **-100%** | Cero CPU gastada en el servidor procesando rutas inexistentes. |
| **Emisión CO2 Total** | 0.001049 g | 0.000055 g | **-94.7%** | **Reducción de huella de carbono directa.** Menor consumo de energía eléctrica en los centros de datos (servidores) y dispositivos cliente. |

**Link imagen antes:** *https://i.ibb.co/gZ53tdrM/antes.jpg*

**Link imagen después:** *https://i.ibb.co/d4TqRvQD/despues.jpg*

---

## 8. Pruebas de Rendimiento Complementarias (Google Lighthouse) (Punto 2.4.b)
Para contrastar los resultados del dashboard, se sugiere medir el Frontend React con Google Lighthouse (auditoría en modo incógnito):

*   **Rendimiento Inicial (Antes):** Carga completa del bundle sin optimización perezosa de la grilla de horarios. Mayor transferencia inicial de scripts.
*   **Rendimiento Final (Después):** Reducción en la métrica *Total Blocking Time (TBT)* e incremento del puntaje general de Performance, gracias al Code Splitting (Lazy Loading) del bundle de React.

---

## 9. Conclusión
El desarrollo web responsable no requiere sacrificar la funcionalidad de un sistema. Al implementar técnicas sencillas como compresión, optimización de flujos y caché, logramos reducir la huella de carbono de la aplicación **Planner UC** en un **94.7%**. A gran escala, este tipo de prácticas son esenciales para disminuir el impacto ambiental de la industria digital global.
