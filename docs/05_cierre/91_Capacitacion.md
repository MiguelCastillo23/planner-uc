# 📖 Documentación General de Capacitación, Perfiles de Usuario y Transferencia Técnica
## Proyecto: Planner-UC (Sistema de Generación Óptima de Horarios Académicos)

Este compendio documental ha sido reestructurado y clasificado por perfiles para satisfacer las necesidades específicas de capacitación de los diferentes usuarios del ecosistema de la Universidad Continental, complementándose con la guía de transferencia para el personal de TI.

---

## 👨‍🎓 1. MANUAL DE USUARIO: PERFIL ESTUDIANTE

El sistema **Planner-UC** te permite autogestionar tu progreso académico, dándote la autonomía de elegir tus asignaturas y generar un horario óptimo personalizado, libre de cruces y adaptado a tu disponibilidad.

### 🔄 Flujo Operativo para la Matrícula Adaptativa

#### Paso 1: Selección Interactiva de Asignaturas
1. Inicia sesión en la plataforma web con tus credenciales institucionales.
2. En la pantalla principal, ubica el panel **"Selección de Asignaturas"**.
3. Selecciona las casillas de los cursos en los que deseas matricularte según tu plan de estudios.
4. Monitorea el **Contador Dinámico de Créditos** en la esquina superior derecha:
   * 🔴 **Texto en Rojo:** Indica que tu carga actual está fuera del rango permitido (menos de 20 o más de 22 créditos). El botón de generación estará bloqueado.
   * 🟢 **Texto en Verde:** Se activará únicamente cuando cumplas con el rango administrativo estricto de **20 a 22 créditos**. El botón se desbloqueará automáticamente.

#### Paso 2: Ejecución del Motor de Optimización
1. Con el contador en verde, haz clic en el botón **"Generar Horario Óptimo"**.
2. El motor heurístico procesará tu solicitud en menos de un segundo ($<0.8s$) y desplegará tu propuesta de horario en pantalla.
3. Verifica la métrica de **Fitness** asignada a tu horario: un valor cercano a `0.0000` (o reflejado como *Perfecto*) certifica una solución óptima y funcional.

#### Paso 3: Interpretación del Calendario Gráfico
* Tu horario se renderizará en una grilla interactiva distribuida de Lunes a Sábado, desde las 07:00 AM hasta las 10:00 PM.
* Las asignaturas de 3 créditos se visualizarán en bloques consolidados continuos de 3 horas.
* Las asignaturas de 4 créditos aparecerán divididas de forma inteligente en un bloque de 3 horas y un sub-bloque de 1.5 horas en días totalmente distintos.
* Cada bloque mostrará el código NRC, nombre del curso, aula/laboratorio asignado, nombre del docente y contará con una **fusión visual** con borde azul que denota continuidad pedagógica.
* El sistema garantiza de forma obligatoria un **intervalo de 11 minutos de transición** entre el fin de una clase y el inicio de otra para tus traslados físicos o descansos.

---

## 👩‍🏫 2. MANUAL DE USUARIO: PERFIL DOCENTE

Este manual guía a los docentes en su rol como proveedores clave de disponibilidad horaria, permitiéndoles registrar sus franjas y consultar sus agendas asignadas sin conflictos.

### 📅 Gestión de Disponibilidad y Consulta de Carga

#### Paso 1: Registro de Disponibilidad Horaria (Inicio de Ciclo)
1. Accede al portal con tu perfil de Docente.
2. Ingresa al módulo **"Mi Disponibilidad Horaria"**.
3. Verás un calendario interactivo que representa la ventana institucional (07:00 AM - 10:00 PM).
4. Haz clic y arrastra sobre los bloques de horas y días en los que estás disponible para dictar clases según tu régimen contractual.
5. Haz clic en **"Guardar Disponibilidad"**. El sistema indexará tus datos inmediatamente en MongoDB Atlas para que el motor de optimización respete tus restricciones en las simulaciones de los estudiantes.

#### Paso 2: Control Extremo de No Solapamiento
* El sistema valida en tiempo real tus restricciones duras. 
* Bajo ninguna circunstancia el motor evolutivo te asignará a dictar clases en dos asignaturas o aulas diferentes dentro de un mismo bloque horario.

#### Paso 3: Visualización de tu Agenda de Dictado
1. Una vez cerrado el proceso de planificación, ingresa a **"Ver Agenda de Clases"**.
2. Consulta en la grilla interactiva las secciones definitivas que te fueron asignadas, detallando el bloque horario exacto, el código del curso y el aula o laboratorio teórico/práctico correspondiente.

---

## 💼 3. MANUAL DE USUARIO: PERFIL ADMINISTRADOR Y COORDINACIÓN ACADÉMICA

Destinado al personal responsable de supervisar la planificación académica, gestionar la infraestructura física de los campus (Huancayo, Lima, Arequipa, Cusco) y auditar el rendimiento y uso de recursos.

### 🏢 Módulo de Control de Recursos y Configuración de Reglas

#### Paso 1: Gestión de Infraestructura y Aforos (CRUD)
1. Dirígete al panel de **"Gestión de Infraestructura"**.
2. Para añadir una nueva instalación, haz clic en **"Registrar Espacio"**.
3. Introduce el identificador del aula o laboratorio especializado, define el tipo (Teórico/Práctico) y establece estrictamente su **capacidad máxima de aforo** para auditorías de seguridad.

#### Paso 2: Vinculación de Carga Académica y Docentes
1. Ingresa a **"Asignación de Carga Académica"**.
2. Vincula a cada docente con las materias específicas que está apto para dictar. Esto preconfigura los dominios válidos que el motor CSP tomará para generar las soluciones.

#### Paso 3: Gestión Adaptativa de Reglas y Excepciones
Como administrador, tienes la facultad de auditar las restricciones del sistema ante casos límite:
* **Excepciones de Créditos:** El sistema bloqueará de forma automática las matrículas inferiores a 12 créditos o superiores a 25 créditos en periodos regulares. Sin embargo, podrás aprobar excepciones a cargas menores de 12 créditos si el alumno presenta una justificación digital válida para culminar sus estudios.
* **Filtros de Rendimiento Académico (RF-04):** El sistema limitará la matrícula a un máximo de 16 créditos a aquellos estudiantes que reprueben una asignatura por segunda vez, restringirá el acceso a una única materia en su tercera desaprobación y bloqueará definitivamente el acceso si alcanzan una cuarta desaprobación.

#### Paso 4: Monitoreo de Eficiencia en el Uso de Espacios
1. Accede al **"Reporte de Uso de Espacios"**.
2. Evalúa las gráficas de eficiencia que analizan la tasa de ocupación de las aulas teóricas y laboratorios con el fin de maximizar la infraestructura y reducir el desperdicio energético.

---

## 🛠️ 4. GUÍA DE TRANSFERENCIA TÉCNICA, INSTALACIÓN Y MANTENIMIENTO (Para TI)

Esta sección está diseñada como una guía de ingeniería de software para el equipo de soporte técnico y administración de servidores de TI que heredará la custodia de **Planner-UC**.

### 💻 Requisitos y Configuración del Entorno
* **Entorno de Ejecución:** Node.js versión v22.20.0 (Long Term Support).
* **Motor de Persistencia:** MongoDB Atlas (Capa Gratuita - Clúster M0) o instancia local.
* **Arquitectura:** Monorepositorio con separación de Backend (Express) y Frontend (React + Vite v6.0.10).

### 🛠️ Pasos para el Despliegue Local

#### Configuración del Backend (API REST)
1. Abre una terminal y navega al directorio del servidor:
   ```bash
   cd planner-uc/backend
   ```
2. Crea un archivo de configuración de variables de entorno `.env` en la raíz de la carpeta con los siguientes campos obligatorios:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/planner-uc
   ```
3. Instala los módulos de dependencia e integra el middleware de compresión Gzip:
   ```bash
   npm install
   ```
4. Ejecuta el script de migración y siembra (*seeding*) de la base de datos para cargar el catálogo inicial de cursos, prerrequisitos, docentes y aulas:
   ```bash
   node seed.js
   ```
5. Inicia el servidor backend en modo de desarrollo:
   ```bash
   npm run dev
   ```
   *La API REST estará escuchando consultas en de red en `http://localhost:3000`.*

#### Configuración del Frontend (Single Page Application)
1. Abre una nueva pestaña en la terminal y dirígete al cliente:
   ```bash
   cd planner-uc/frontend
   ```
2. Descarga e instala los paquetes necesarios para la interfaz reactiva:
   ```bash
   npm install
   ```
3. Lanza el servidor de desarrollo ágil basado en Vite:
   ```bash
   npm run dev
   ```
   *La interfaz de usuario interactiva se desplegará en `http://localhost:5173`.*

---

### 📈 Mantenimiento del Motor CSP y Dashboard de Sostenibilidad (Green IT)

#### 🍃 Operación del Green Dashboard
El sistema incorpora la librería `@tgwf/co2` implementando el modelo matemático *Sustainable Web Design (SWD)* a través de un middleware global que intercepta las respuestas HTTP (`res.write` y `res.end`). El personal de TI puede auditar la telemetría ecológica ingresando a:
`http://localhost:3000/environmental-impact`

Este panel permite verificar la efectividad de las optimizaciones implementadas (Compresión Gzip, proyecciones estricta mediante `.select()` en Mongoose y almacenamiento en caché local por 60 segundos con estados `304 Not Modified`), las cuales lograron reducir las emisiones de carbono de **0.001049 gramos** a **0.000055 gramos** por solicitud.

#### 🎛️ Mantenimiento de Aulas en el Algoritmo Genético
Si se requiere dar de alta o baja un aula física o laboratorio dentro del motor heurístico evolutivo de contingencia, se debe editar directamente el constructor de la clase `GeneticEngine` ubicado en el archivo técnico principal:
`backend/src/engine/genetic.js`

Modifica el arreglo estático de recursos según las necesidades de la universidad:

```javascript
this.aulas = ['A101', 'B202', 'J205', 'M202', 'L105', 'K302', 'NUEVA_AULA'];
```

