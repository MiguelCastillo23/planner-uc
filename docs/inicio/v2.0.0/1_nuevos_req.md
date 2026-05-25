**REQUERIMIENTOS FUNCIONALES (RF)**

**[RF-01] Gestión de límites de creditaje**

- El sistema debe permitir una matrícula mínima de doce (12) créditos para estudiantes regulares. 
- El sistema debe permitir un máximo de veinticinco (25) créditos en periodos académicos regulares. 
- El sistema debe permitir excepciones de carga mínima inferior a 12 créditos si el alumno justifica que es para culminar sus estudios. 

**[RF-02] Validación de prerrequisitos y secuencia**

- El sistema debe bloquear la matrícula en asignaturas secuenciales si el estudiante no ha aprobado los prerrequisitos según su plan de estudios. 
- El sistema debe asegurar la secuencia de Taller de Investigación 1 y 2, impidiendo que sean cursadas de forma dirigida o aprobadas por examen de subsanación. 

**[RF-03] Control de cruce de horarios**

- El sistema debe impedir, sin excepción, la matrícula en asignaturas que presenten cruce de horarios. 

**[RF-04] Restricciones por rendimiento académico**

- El sistema debe limitar la matrícula a un máximo de dieciséis (16) créditos si el estudiante desaprueba una o más asignaturas por segunda vez. 
- El sistema debe restringir la matrícula únicamente a la asignatura desaprobada anteriormente si el estudiante fue separado temporalmente (3ra desaprobación). 
- El sistema debe bloquear el acceso a matrícula si el estudiante ha sido retirado definitivamente (4ta desaprobación). 

**[RF-05] Selección de modalidad y asistencia**

- Para asignaturas híbridas, el sistema debe permitir al estudiante seleccionar la forma de asistencia (física o remota) al momento de la matrícula. 
- El sistema debe registrar y bloquear la modalidad de asistencia seleccionada para que no sea variada durante el desarrollo del curso. 

**[RF-06] Gestión de asignaturas dirigidas**

- El sistema debe permitir la solicitud de asignaturas dirigidas a través del Portal del Estudiante. 
- El sistema debe validar que el estudiante no supere el máximo de tres (3) asignaturas dirigidas durante su permanencia. 
- El sistema debe impedir la matrícula dirigida en asignaturas que el estudiante haya desaprobado dos veces. 

**[RF-07] Retiros y reservas**

- El sistema debe permitir el retiro de asignatura(s) hasta la semana 14 (presencial) o semana 7 del bloque (semipresencial/distancia). 
- El sistema debe permitir la reserva de matrícula hasta la segunda semana de clases. 

**REQUERIMIENTOS NO FUNCIONALES (RNF)**

**[RNF-01] Integridad de datos y requisitos administrativos**

- El sistema debe verificar que el estudiante no tenga obligaciones pendientes (deudas) con la Universidad antes de habilitar la matrícula. 
- El sistema debe validar el pago de la tasa educativa y la vigencia del seguro universitario antes de formalizar el proceso. 

**[RNF-02] Disponibilidad y acceso**

- La matrícula debe realizarse exclusivamente de modo electrónico para acreditar la condición de estudiante. 
- El sistema debe estar sincronizado con la programación académica y oferta de la Universidad. 

**[RNF-03] Reglas de negocio para investigación**

- Las asignaturas de Taller de Investigación 1 y 2 no deben estar disponibles para matrícula en ciclos de verano. 
- Estas asignaturas deben tener una configuración de duración de dieciséis (16) semanas continuas en todas las modalidades. 

**[RNF-04] Estándares de seguridad y acceso**

- El sistema debe poseer controles de acceso para evitar que estudiantes no matriculados accedan a recursos académicos. 
- El sistema debe implementar técnicas para evitar la suplantación de participación o la burla de controles mediante programas informáticos. 

**[RNF-05] Adaptabilidad de planes de estudio**

- En caso de reserva de matrícula, el sistema debe adecuar automáticamente al estudiante al plan de estudios vigente al momento de su retorno. 
- El sistema debe impedir exámenes de subsanación si el plan de estudios del estudiante ya no se encuentra vigente. 

