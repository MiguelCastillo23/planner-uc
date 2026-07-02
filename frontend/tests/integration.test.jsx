import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import App from '../src/App';
import { CourseSelector } from '../src/components/CourseSelector';
import { AdminDashboard } from '../src/components/AdminDashboard';
import { mockEstudiantes, mockSecciones, mockCursos } from './mocks/handlers';

describe('Pruebas de Integración Frontend (RTL + MSW)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Escenario 1: Peticiones válidas
  // Flujo completo de LoginPortal -> selección de rol -> visualización de dashboard con KPI calculados.
  it('1. Peticiones válidas: realiza el flujo completo de login administrador y visualiza KPI calculados', async () => {
    const { container } = render(<App />);

    // Esperar a que se cargue la vista de LoginPortal y los datos iniciales
    await screen.findByText('Estudiante Test');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });

    expect(screen.getByRole('heading', { name: 'Administrador' })).toBeInTheDocument();

    // Rellenar credenciales de administrador
    const userInput = container.querySelector('[data-cy="admin-user-input"]');
    const passInput = container.querySelector('[data-cy="admin-pass-input"]');
    const submitBtn = container.querySelector('[data-cy="admin-login-button"]');

    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'admin' } });
    fireEvent.click(submitBtn);

    // Esperar transición a AdminDashboard y carga de métricas
    await screen.findByText(/Menú Admin/, {}, { timeout: 5000 });
    expect(screen.getByRole('status', { name: 'loading-metrics' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'loading-metrics' })).not.toBeInTheDocument();
    });

    // Validar visualización de KPIs
    expect(screen.getByText('Tasa de Matrícula')).toBeInTheDocument();
    expect(screen.getByText('Ocupación de Aulas')).toBeInTheDocument();
    expect(screen.getByText('Oferta Académica')).toBeInTheDocument();
  }, 15000);

  // Escenario 2: Peticiones inválidas
  // Formulario CRUD en AdminDashboard enviado vacío no debe procesarse y los inputs deben permanecer visibles
  it('2. Peticiones inválidas: intenta enviar formulario CRUD vacío y la validación previene la acción', async () => {
    render(
      <AdminDashboard
        estudiantesSimulados={mockEstudiantes}
        seccionesDisponibles={mockSecciones}
        onActualizarPago={vi.fn()}
        onGenerarGlobal={vi.fn()}
        loading={false}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'loading-metrics' })).not.toBeInTheDocument();
    });

    // Ir a pestaña de Mantenimiento Académico
    fireEvent.click(screen.getByText(/Mantenimiento Académico/));
    expect(screen.getByText('Gestión y Mantenimiento Académico')).toBeInTheDocument();

    // Intentar registrar una carrera con campos vacíos
    const codeInput = screen.getByPlaceholderText('Ej. ING-SIS');
    const nameInput = screen.getByPlaceholderText('Ej. Ingeniería de Sistemas e Informática');
    const saveBtn = screen.getByRole('button', { name: 'Guardar' });

    // Enviar formulario (los campos están vacíos y son required)
    fireEvent.click(saveBtn);

    // Los campos deben permanecer vacíos y visibles en el formulario
    expect(codeInput.value).toBe('');
    expect(nameInput.value).toBe('');
    expect(screen.getByPlaceholderText('Ej. ING-SIS')).toBeInTheDocument();
  });

  // Escenario 3: Acceso no autorizado
  // Acceso de estudiante deudor muestra advertencia de deudas pendientes en el expediente del alumno
  it('3. Acceso no autorizado: estudiante deudor ingresa y la UI muestra advertencia de deudas pendientes', async () => {
    // Mockear la respuesta del estudiante para que tenga deudas pendientes
    server.use(
      http.get('http://localhost:3000/api/estudiantes', () => {
        return HttpResponse.json([
          {
            _id: 'e_deudor',
            codigo: '20239999',
            nombre: 'Estudiante Deudor',
            planEstudios: 'ING-SIS',
            planVigente: true,
            semestre: 1,
            cursosAprobados: [],
            cantidadDirigidos: 0,
            tieneDeudas: true, // Con deuda!
            tasaPagada: true,
            seguroVigente: true,
            estadoMatricula: 'Ninguno'
          }
        ]);
      })
    );

    const { container } = render(<App />);

    // Esperar y seleccionar estudiante deudor
    await screen.findByText('Estudiante Deudor');
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
    const studentSelect = container.querySelector('[data-cy="student-select"]');
    fireEvent.change(studentSelect, { target: { value: 'e_deudor' } });

    const ingresarBtn = container.querySelector('[data-cy="student-login-button"]');
    fireEvent.click(ingresarBtn);

    // Esperar a que cargue la vista de estudiante
    expect(await screen.findByText('Expediente Alumno')).toBeInTheDocument();

    // Validar que se muestre la advertencia
    expect(screen.getByText(/DEUDAS PENDIENTES/i)).toBeInTheDocument();
  });

  // Escenario 4: Datos inconsistentes
  // Selección de cursos en CourseSelector fuera del rango 20-22 desactiva el botón de generación de horario óptimo
  it('4. Datos inconsistentes: CourseSelector deshabilita generación si los créditos están fuera del rango [20, 22]', () => {
    const handleGenerar = vi.fn();
    const mockCursosDisponibles = [
      { codigo: 'C1', nombre: 'Curso 1', creditos: 4 },
      { codigo: 'C2', nombre: 'Curso 2', creditos: 5 },
      { codigo: 'C3', nombre: 'Curso 3', creditos: 3 }
    ];

    const { rerender } = render(
      <CourseSelector
        cursosDisponibles={mockCursosDisponibles}
        seleccionados={[]} // 0 créditos
        onToggle={vi.fn()}
        onGenerar={handleGenerar}
        loading={false}
      />
    );

    // Botón deshabilitado para 0 créditos
    let generarBtn = screen.getByRole('button', { name: 'Generar Horario Óptimo' });
    expect(generarBtn).toBeDisabled();

    // Rerenderizar con 12 créditos (todavía fuera del rango 20-22)
    rerender(
      <CourseSelector
        cursosDisponibles={mockCursosDisponibles}
        seleccionados={[
          { codigo: 'C1', nombre: 'Curso 1', creditos: 4 },
          { codigo: 'C2', nombre: 'Curso 2', creditos: 5 },
          { codigo: 'C3', nombre: 'Curso 3', creditos: 3 }
        ]} // 12 créditos
        onToggle={vi.fn()}
        onGenerar={handleGenerar}
        loading={false}
      />
    );

    generarBtn = screen.getByRole('button', { name: 'Generar Horario Óptimo' });
    expect(generarBtn).toBeDisabled();

    // Rerenderizar con 21 créditos (rango válido 20-22)
    rerender(
      <CourseSelector
        cursosDisponibles={mockCursosDisponibles}
        seleccionados={[
          { codigo: 'C1', nombre: 'Curso 1', creditos: 4 },
          { codigo: 'C2', nombre: 'Curso 2', creditos: 5 },
          { codigo: 'C3', nombre: 'Curso 3', creditos: 3 },
          { codigo: 'C4', nombre: 'Curso 4', creditos: 4 },
          { codigo: 'C5', nombre: 'Curso 5', creditos: 5 }
        ]} // 21 créditos
        onToggle={vi.fn()}
        onGenerar={handleGenerar}
        loading={false}
      />
    );

    generarBtn = screen.getByRole('button', { name: 'Generar Horario Óptimo' });
    expect(generarBtn).not.toBeDisabled();
  });

  // Escenario 5: Manejo de errores del servidor
  // Fallo simulado del backend (HTTP 500) muestra panel de error de conexión en AdminDashboard
  it('5. Manejo de errores del servidor: fallo del backend muestra panel de error de conexión en AdminDashboard', async () => {
    // Forzar error 500 al consultar cursos
    server.use(
      http.get('http://localhost:3000/api/cursos', () => new HttpResponse(null, { status: 500 }))
    );

    render(
      <AdminDashboard
        estudiantesSimulados={mockEstudiantes}
        seccionesDisponibles={mockSecciones}
        onActualizarPago={vi.fn()}
        onGenerarGlobal={vi.fn()}
        loading={false}
      />
    );

    // Esperar y validar que aparezca el panel de error de conexión
    expect(await screen.findByText('Error de Conexión con el Servidor')).toBeInTheDocument();
    expect(screen.getByText(/No se pudo establecer comunicación con el backend/)).toBeInTheDocument();
  });

});
