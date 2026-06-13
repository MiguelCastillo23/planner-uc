import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { AdminDashboard } from '../src/components/AdminDashboard';
import { mockEstudiantes, mockSecciones } from './mocks/handlers';

describe('AdminDashboard Component', () => {
  it('shows loading state initially and then renders computed metrics', async () => {
    render(
      <AdminDashboard
        estudiantesSimulados={mockEstudiantes}
        seccionesDisponibles={mockSecciones}
        onActualizarPago={vi.fn()}
        onGenerarGlobal={vi.fn()}
        loading={false}
      />
    );


    expect(screen.getByRole('status', { name: 'loading-metrics' })).toBeInTheDocument();


    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'loading-metrics' })).not.toBeInTheDocument();
    });


    expect(screen.getByText('Tasa de Matrícula')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 de 1 alumnos matriculados')).toBeInTheDocument();


    expect(screen.getByText('Ocupación de Aulas')).toBeInTheDocument();
    expect(screen.getByText('7%')).toBeInTheDocument();
    expect(screen.getByText('5 vacantes ocupadas físicas')).toBeInTheDocument();
  });

  it('allows navigating between different tabs', async () => {
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


    const maintenanceTab = screen.getByText(/Mantenimiento Académico/);
    fireEvent.click(maintenanceTab);
    expect(screen.getByText('Gestión y Mantenimiento Académico')).toBeInTheDocument();


    const studentsTab = screen.getByText(/Control de Estudiantes/);
    fireEvent.click(studentsTab);
    expect(screen.getByText('Control Financiero de Alumnos')).toBeInTheDocument();


    const ecoTab = screen.getByText(/Impacto Green Software/);
    fireEvent.click(ecoTab);
    expect(screen.getByText('🌱 Monitoreo Ambiental (Green Software)')).toBeInTheDocument();
  });

  it('renders connection error UI if api fetch fails', async () => {

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


    await screen.findByText('Error de Conexión con el Servidor');
    expect(screen.getByText(/No se pudo establecer comunicación con el backend/)).toBeInTheDocument();
  });

  it('performs CRUD actions in Academic Maintenance', async () => {
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


    fireEvent.click(screen.getByText(/Mantenimiento Académico/));


    const codeInput = screen.getByPlaceholderText('Ej. ING-SIS');
    const nameInput = screen.getByPlaceholderText('Ej. Ingeniería de Sistemas e Informática');
    const saveBtn = screen.getByRole('button', { name: 'Guardar' });

    fireEvent.change(codeInput, { target: { value: 'ING-IND' } });
    fireEvent.change(nameInput, { target: { value: 'Ingeniería Industrial' } });
    fireEvent.click(saveBtn);


    await waitFor(() => {
      expect(codeInput.value).toBe('');
      expect(nameInput.value).toBe('');
    });
  });

  it('triggers payment status update on Alumnos panel', async () => {
    const handleActualizarPago = vi.fn();
    render(
      <AdminDashboard
        estudiantesSimulados={mockEstudiantes}
        seccionesDisponibles={mockSecciones}
        onActualizarPago={handleActualizarPago}
        onGenerarGlobal={vi.fn()}
        loading={false}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'loading-metrics' })).not.toBeInTheDocument();
    });


    fireEvent.click(screen.getByText(/Control de Estudiantes/));


    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);

    expect(handleActualizarPago).toHaveBeenCalledWith(mockEstudiantes[0]._id, 'tieneDeudas', expect.any(Boolean));
  });
});
