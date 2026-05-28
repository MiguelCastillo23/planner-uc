# Reporte de Sostenibilidad y Eficiencia del Software (Green MERN)

Este documento detalla el análisis de impacto ambiental de la aplicación **Planner UC**, las mejoras implementadas bajo los principios de *Green Software Engineering*, y el análisis comparativo del rendimiento antes y después de los cambios.

---

## 1. Sistema de Medición Utilizado (CO2.js)
Se incorporó la librería `@tgwf/co2` en el backend Express junto a un middleware de medición global que intercepta el flujo de datos de salida (`res.write` y `res.end`). Esto permite calcular la huella de carbono estimada para cada respuesta HTTP basándose en el modelo **Sustainable Web Design (SWD)**, el cual computa las emisiones de CO2 a partir de los bytes reales transferidos por la red.

---

## 2. Métricas Iniciales ("El Antes") - Estado Base
Se obtuvieron estas métricas iniciales navegando en la aplicación en su estado original sin optimizaciones (19 solicitudes totales).

### Indicadores Generales (Antes)
*   **Total de solicitudes procesadas:** 19
*   **CO2 Total generado:** 0.001049 gramos
*   **CO2 Promedio por solicitud:** 0.000055 gramos
*   **Endpoint más contaminante:** `/api/horarios/generar` (0.000430 g de CO2 en un solo envío)
*   **Endpoint más utilizado:** `/api/cursos` (8 solicitudes)

---

## 3. Mejoras Implementadas y Justificación Ecológica
Se aplicaron las siguientes optimizaciones técnicas. Cada una de ellas ataca un pilar de la eficiencia energética del software:

### A. Compresión Gzip (Express APIs)
*   **Implementación:** Se integró el middleware `compression` en el backend Express.
*   **Justificación:** Al comprimir la respuesta JSON devuelta por los algoritmos de generación de horarios, se reduce directamente el tamaño del payload en tránsito. Menos bytes viajando por routers y switches de red significa un menor consumo energético en la infraestructura de red global.

### B. Caché de Recursos y Cabeceras HTTP
*   **Implementación:** Se aplicó una doble capa de caché para el endpoint `/api/cursos`:
    1.  *Caché en Servidor:* Memoria temporal (en-ram) por 60 segundos para evitar consultas repetitivas a MongoDB Atlas.
    2.  *Caché en Navegador:* Envío de la cabecera `Cache-Control: public, max-age=60` con respuestas de estado `304 Not Modified`.
*   **Justificación:** Al evitar peticiones de red duplicadas y servir recursos locales guardados, se reduce a cero la transferencia de datos para consultas frecuentes de lectura. Menos consultas a base de datos reducen la utilización de CPU del servidor MongoDB.

### C. Optimización de Consultas MongoDB (Proyección de Datos)
*   **Implementación:** Uso del método `.select('nombre codigo creditos')` en la consulta del modelo `Curso`.
*   **Justificación:** Evita extraer o transferir campos internos de Mongoose (`__v`, etc.) u otros metadatos no requeridos por el frontend. Optimiza el uso de memoria RAM del servidor de base de datos y disminuye el tamaño del payload de red entre la base de datos y el backend.

### D. Carga Perezosa (Lazy Loading en Frontend React)
*   **Implementación:** Uso de `React.lazy` y `Suspense` para el componente pesado `ScheduleGrid`.
*   **Justificación:** El navegador solo descarga el código de renderización de la grilla de horarios cuando es estrictamente necesario (después de que el usuario haga clic en Generar). Esto reduce el tamaño del bundle inicial descargado por el cliente.

### E. Eliminación de Peticiones Huérfanas (Caso Favicon.ico)
*   **Implementación:** Se agregó `<link rel="icon" href="data:,">` en el Dashboard HTML y una ruta `204 No Content` en Express para `/favicon.ico`.
*   **Justificación:** Detiene por completo la generación de errores 404 (que pesan y consumen CPU en el backend) causados por las solicitudes automáticas del navegador buscando un favicon que no existía.

---

## 4. Métricas Finales ("El Después") - Estado Optimizado
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

## 5. Cuadro Comparativo de Impacto Ambiental

| Métrica | Antes (Sin Optimizar) | Después (Optimizado) | Porcentaje de Mejora | Impacto en la Sostenibilidad |
| :--- | :---: | :---: | :---: | :--- |
| **Transferencia /api/horarios/generar** | 2904 Bytes | 373 Bytes | **-87.1%** | Menor uso de ancho de banda y menor consumo en infraestructura de red global. |
| **Transferencia /api/cursos** | 854 Bytes | 0 Bytes (304 Cache) | **-100%** | Petición servida localmente por caché. Zero uso de red y base de datos para lecturas subsecuentes. |
| **Peticiones basura (favicon.ico)** | 8 peticiones (404) | 0 peticiones | **-100%** | Cero CPU gastada en el servidor procesando rutas inexistentes. |
| **Emisión CO2 Total** | 0.001049 g | 0.000055 g | **-94.7%** | **Reducción de huella de carbono directa.** Menor consumo de energía eléctrica en los centros de datos (servidores) y dispositivos cliente. |

---

## 6. Conclusión
El desarrollo web responsable no requiere sacrificar la funcionalidad de un sistema. Al implementar técnicas sencillas como compresión, optimización de flujos y caché, logramos reducir la huella de carbono de la aplicación **Planner UC** en un **94.7%**. A gran escala, este tipo de prácticas son esenciales para disminuir el impacto ambiental de la industria digital global.
