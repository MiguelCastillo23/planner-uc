# Lista Preliminar de Requerimientos

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

**Equipo:** 
* Miguel Angel Castillo Rojas 
* Alain Aliaga Eulogio

**Fecha:** 30 de marzo de 2026

---

## 1. Requerimientos Funcionales (RF)
Los requerimientos funcionales definen las acciones específicas que el sistema debe ser capaz de realizar.

| ID | Nombre | Descripción | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-01** | Gestión de Usuarios | El sistema debe permitir el registro y autenticación de Estudiantes, Docentes y Administradores. | Alta |
| **RF-02** | Registro de Disponibilidad | Los docentes deben poder ingresar sus franjas horarias disponibles para el ciclo académico. | Alta |
| **RF-03** | Validación de Créditos | El sistema debe validar que la carga académica del estudiante esté en el rango de **20 a 22 créditos**. | Crítica |
| **RF-04** | Validación de Prerrequisitos | El sistema debe verificar que el estudiante haya aprobado los cursos previos necesarios antes de permitir la matrícula. | Crítica |
| **RF-05** | Motor de Generación | El sistema debe generar automáticamente propuestas de horarios libres de solapamientos entre aulas, docentes y alumnos. | Crítica |
| **RF-06** | Visualización de Horario | El sistema debe presentar el horario generado en una interfaz gráfica interactiva (Grid/Calendario). | Media |
| **RF-07** | Gestión de Infraestructura | El administrador debe poder registrar aulas, laboratorios y sus capacidades de aforo. | Alta |

---

## 2. Requerimientos No Funcionales (RNF)
Definen las propiedades del sistema y las restricciones de su funcionamiento.

| ID | Categoría | Descripción | Estándar |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Seguridad | Las contraseñas deben estar encriptadas y el acceso protegido mediante JWT (JSON Web Tokens). | OWASP Top 10 |
| **RNF-02** | Usabilidad | La interfaz debe ser intuitiva y accesible para personas con discapacidad visual o motriz. | WCAG 2.1 / W3C |
| **RNF-03** | Mantenibilidad | El código debe estar documentado y seguir una arquitectura limpia (Clean Architecture) en Node.js. | ISO/IEC 25010 |
| **RNF-04** | Rendimiento | La generación del horario óptimo no debe exceder los 5 minutos de procesamiento en el servidor. | Eficiencia |
| **RNF-05** | Sostenibilidad | El algoritmo debe optimizar el uso de CPU para reducir el consumo energético del servidor. | Green Software |
| **RNF-06** | Disponibilidad | La aplicación debe estar disponible en la nube el 99% del tiempo durante el periodo de matrícula. | Cloud (Vercel/Render) |