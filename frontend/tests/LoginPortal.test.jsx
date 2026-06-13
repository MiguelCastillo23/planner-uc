import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginPortal } from '../src/components/LoginPortal';

const mockStudents = [
  { _id: 'e1', nombre: 'Alice Smith', codigo: '20230001' },
  { _id: 'e2', nombre: 'Bob Jones', codigo: '20230002' }
];

const mockTeachers = [
  { _id: 'd1', nombre: 'Dr. John Doe' }
];

describe('LoginPortal Component', () => {
  it('renders all authentication sections correctly', () => {
    render(
      <LoginPortal 
        estudiantesSimulados={mockStudents} 
        docentesDisponibles={mockTeachers} 
        onLogin={vi.fn()} 
      />
    );

    expect(screen.getByText(/Ingreso/)).toBeInTheDocument();
    expect(screen.getByText(/Acceso Administrador/)).toBeInTheDocument();
    expect(screen.getByText(/Acceso Estudiante/)).toBeInTheDocument();
    expect(screen.getByText(/Acceso Docente/)).toBeInTheDocument();
  });

  it('shows error message on invalid admin login', () => {
    const handleLogin = vi.fn();
    render(<LoginPortal onLogin={handleLogin} />);

    const userInput = screen.getByPlaceholderText(/Usuario/);
    const passInput = screen.getByPlaceholderText(/Contraseña/);
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(userInput, { target: { value: 'wrong_user' } });
    fireEvent.change(passInput, { target: { value: 'wrong_pass' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/)).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it('triggers onLogin callback with administrador role on successful admin login', () => {
    const handleLogin = vi.fn();
    render(<LoginPortal onLogin={handleLogin} />);

    const userInput = screen.getByPlaceholderText(/Usuario/);
    const passInput = screen.getByPlaceholderText(/Contraseña/);
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/ });

    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'admin' } });
    fireEvent.click(submitBtn);

    expect(handleLogin).toHaveBeenCalledWith('administrador', null);
  });

  it('triggers onLogin callback with student data when student is selected', () => {
    const handleLogin = vi.fn();
    render(
      <LoginPortal 
        estudiantesSimulados={mockStudents} 
        onLogin={handleLogin} 
      />
    );

    const studentSelect = screen.getAllByRole('combobox')[0]; 
    fireEvent.change(studentSelect, { target: { value: 'e1' } });

    const studentBtn = screen.getAllByRole('button', { name: /Ingresar/ })[0];
    fireEvent.click(studentBtn);

    expect(handleLogin).toHaveBeenCalledWith('estudiante', mockStudents[0]);
  });

  it('triggers onLogin callback with teacher data when teacher is selected', () => {
    const handleLogin = vi.fn();
    render(
      <LoginPortal 
        docentesDisponibles={mockTeachers} 
        onLogin={handleLogin} 
      />
    );

    const teacherSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(teacherSelect, { target: { value: 'd1' } });

    const teacherBtn = screen.getAllByRole('button', { name: /Ingresar/ })[1];
    fireEvent.click(teacherBtn);

    expect(handleLogin).toHaveBeenCalledWith('docente', mockTeachers[0]);
  });
});
