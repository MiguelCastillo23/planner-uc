import { test, expect } from '@playwright/test';

test.describe('Fase 1.5 - Pruebas End-to-End (E2E) Planner-UC', () => {

  test.describe('1. Golden Path: Flujo Crítico de Negocio', () => {
    test('Administrador registra curso, genera horarios, y estudiante se matricula con éxito', async ({ browser }) => {
      // 1. Contexto del Administrador
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await adminPage.goto('/login');

      // Login Admin
      await adminPage.locator('[data-cy="admin-user-input"]').fill('admin');
      await adminPage.locator('[data-cy="admin-pass-input"]').fill('admin');
      await adminPage.locator('[data-cy="admin-login-button"]').click();
      await expect(adminPage).toHaveURL(/.*admin/);

      // Ir a Mantenimiento Académico -> Cursos
      await adminPage.locator('[data-cy="tab-mantenimiento"]').click();
      await adminPage.locator('[data-cy="subtab-cursos"]').click();

      // Registrar nuevo curso
      await adminPage.locator('[data-cy="curso-codigo-input"]').fill('ASUCO9999');
      await adminPage.locator('[data-cy="curso-nombre-input"]').fill('Pruebas de Aceptación');
      await adminPage.locator('[data-cy="curso-creditos-input"]').fill('4');
      await adminPage.locator('[data-cy="curso-semestre-select"]').selectOption('1');
      await adminPage.locator('[data-cy="curso-modalidad-select"]').selectOption('Presencial');
      await adminPage.locator('[data-cy="curso-save-button"]').click();

      // Note: Bypasseamos la verificación de la tabla debido al caché de 60s en el backend.
      // El algoritmo genético lee directo de la base de datos.

      // Ir a la pestaña Programación Horaria y Generar Horarios
      await adminPage.locator('[data-cy="tab-programacion"]').click();
      await adminPage.locator('text=Generar Horarios Globales').click();

      // Esperar alerta de éxito
      const successAlert = adminPage.locator('[data-cy="alert-message"]');
      await expect(successAlert).toContainText('Programación académica global publicada con éxito');

      await adminPage.close();
      await adminContext.close();

      // 2. Contexto de Estudiante (Pedro Gómez - Regular)
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();
      await studentPage.goto('/login');

      // Iniciar sesión como Pedro Gómez
      await studentPage.locator('[data-cy="student-select"]').selectOption({ label: 'Pedro Gómez (Regular)' });
      await studentPage.locator('[data-cy="student-login-button"]').click();
      await expect(studentPage).toHaveURL(/.*estudiante/);

      // Verificar que la nueva sección del curso creado (ASUCO9999-SEC01) es visible
      await expect(studentPage.locator('[data-cy="section-checkbox-ASUCO9999-SEC01"]')).toBeVisible();

      // Seleccionar el checkbox del curso
      await studentPage.locator('[data-cy="section-checkbox-ASUCO9999-SEC01"]').click();

      // Justificar carga académica inferior a 12 créditos (al ser un solo curso de 4 créditos)
      await studentPage.locator('#excCarga').check();

      // Confirmar Matrícula
      await studentPage.locator('[data-cy="confirm-matricula-button"]').click();

      // Verificar alerta de éxito de matrícula formalizada
      await expect(studentPage.locator('[data-cy="alert-message"]')).toContainText('Matrícula formalizada con éxito');

      await studentPage.close();
      await studentContext.close();
    });
  });

  test.describe('2. Happy Path: Navegación, Persistencia y Concurrencia Multiusuario', () => {
    test('Simulación concurrente: Estudiante se matricula y Admin ve reflejada la persistencia en KPIs', async ({ browser }) => {
      // Configurar timeout de 90 segundos para evitar timeout prematuro en ejecuciones lentas de la máquina
      test.setTimeout(90000);

      // 1. Contexto Admin: Iniciar sesión y ver vacantes iniciales
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await adminPage.goto('/login');
      await adminPage.locator('[data-cy="admin-user-input"]').fill('admin');
      await adminPage.locator('[data-cy="admin-pass-input"]').fill('admin');
      await adminPage.locator('[data-cy="admin-login-button"]').click();
      await expect(adminPage).toHaveURL(/.*admin/);

      // Ir a la pestaña KPIs y leer valor inicial
      await adminPage.locator('[data-cy="tab-kpis"]').click();
      const kpisContainer = adminPage.locator('text=vacantes ocupadas físicas');
      await expect(kpisContainer).toBeVisible();
      const initialText = await kpisContainer.textContent();
      const initialOcupadas = parseInt(initialText.match(/\d+/)[0], 10);

      // Cerrar sesión limpiamente para limpiar localStorage y evitar redirecciones automáticas en nuevas pestañas
      await adminPage.locator('[data-cy="logout-button"]').click();
      await expect(adminPage).toHaveURL(/.*login/);
      await adminPage.close();

      // 2. Contexto Estudiante: Juan Pérez (Regular) selecciona un curso y se matricula
      const studentContext = await browser.newContext();
      const studentPage = await studentContext.newPage();
      await studentPage.goto('/login');
      await studentPage.locator('[data-cy="student-select"]').selectOption({ label: 'Juan Pérez (Regular)' });
      await studentPage.locator('[data-cy="student-login-button"]').click();
      await expect(studentPage).toHaveURL(/.*estudiante/);

      // La grilla no debería estar renderizada (cero asignaturas seleccionadas inicialmente)
      await expect(studentPage.locator('[data-cy="schedule-grid"]')).not.toBeVisible();

      // Seleccionar la asignatura ASUCO1083-SEC01
      await studentPage.locator('[data-cy="section-checkbox-ASUCO1083-SEC01"]').click();

      // Ahora la grilla de horarios sí debe existir y mostrar el curso
      await expect(studentPage.locator('[data-cy="schedule-grid"]')).toBeVisible();
      await expect(studentPage.locator('[data-cy="schedule-grid"]')).toContainText('HABILIDADES COMUNICATIVAS');

      // Justificar carga académica inferior a 12 créditos
      await studentPage.locator('#excCarga').check();

      // Confirmar matrícula
      await studentPage.locator('[data-cy="confirm-matricula-button"]').click();
      await expect(studentPage.locator('[data-cy="alert-message"]')).toContainText('Matrícula formalizada con éxito');

      await studentPage.close();
      await studentContext.close();

      // 3. Admin: Abrir una nueva página (forzando recarga de página/unmount de React para recargar base de datos) y verificar KPIs
      const adminPage2 = await adminContext.newPage();
      await adminPage2.goto('/login');
      await adminPage2.locator('[data-cy="admin-user-input"]').fill('admin');
      await adminPage2.locator('[data-cy="admin-pass-input"]').fill('admin');
      await adminPage2.locator('[data-cy="admin-login-button"]').click();
      await expect(adminPage2).toHaveURL(/.*admin/);

      await adminPage2.locator('[data-cy="tab-kpis"]').click();
      await expect(adminPage2.locator('text=vacantes ocupadas físicas')).toBeVisible();
      const updatedText = await adminPage2.locator('text=vacantes ocupadas físicas').textContent();
      const updatedOcupadas = parseInt(updatedText.match(/\d+/)[0], 10);

      // Validar que se ha incrementado por 1 la cantidad de vacantes en la persistencia de la base de datos real
      expect(updatedOcupadas).toBe(initialOcupadas + 1);

      await adminPage2.close();
      await adminContext.close();
    });
  });

  test.describe('3. Unhappy Path: Validaciones de Seguridad, Restricciones y Errores', () => {
    test('Redirección a login si se intenta acceder directo a vistas sin sesión', async ({ page }) => {
      // Intentar entrar directo al panel de administrador
      await page.goto('/admin');
      await expect(page).toHaveURL(/.*login/);

      // Intentar entrar directo a la vista de estudiante
      await page.goto('/estudiante');
      await expect(page).toHaveURL(/.*login/);
    });

    test('Estudiante deudor (Ana Rojas) es rechazado por el backend al intentar matricularse', async ({ page }) => {
      await page.goto('/login');

      // Iniciar sesión con Ana Rojas
      await page.locator('[data-cy="student-select"]').selectOption({ label: 'Ana Rojas (Deudor Administrativo)' });
      await page.locator('[data-cy="student-login-button"]').click();
      await expect(page).toHaveURL(/.*estudiante/);

      // Validar visualmente que tiene deudas
      await expect(page.locator('text=DEUDAS PENDIENTES')).toBeVisible();

      // Seleccionar un curso e intentar confirmar matrícula
      await page.locator('[data-cy="section-checkbox-ASUCO1083-SEC01"]').click();

      // Justificar carga académica inferior a 12 créditos
      await page.locator('#excCarga').check();

      // Intentar confirmar
      await page.locator('[data-cy="confirm-matricula-button"]').click();

      // Debe aparecer alerta roja con el mensaje de error de deuda del backend
      await expect(page.locator('[data-cy="alert-message"]')).toContainText('deudas pendientes');
    });

    test('Validaciones HTML5 obligatorias del formulario CRUD de carreras', async ({ page }) => {
      await page.goto('/login');
      await page.locator('[data-cy="admin-user-input"]').fill('admin');
      await page.locator('[data-cy="admin-pass-input"]').fill('admin');
      await page.locator('[data-cy="admin-login-button"]').click();
      await expect(page).toHaveURL(/.*admin/);

      // Ir a Mantenimiento -> Carreras
      await page.locator('[data-cy="tab-mantenimiento"]').click();
      await page.locator('[data-cy="subtab-carreras"]').click();

      // Enviar el formulario sin rellenar los campos obligatorios
      await page.locator('[data-cy="carrera-save-button"]').click();

      // Validar que el HTML5 impide el envío evaluando la validez del formulario
      const isCodeInvalid = await page.evaluate(() => document.querySelector('[data-cy="carrera-codigo-input"]').checkValidity() === false);
      const isNameInvalid = await page.evaluate(() => document.querySelector('[data-cy="carrera-nombre-input"]').checkValidity() === false);

      expect(isCodeInvalid).toBe(true);
      expect(isNameInvalid).toBe(true);
    });
  });
});
