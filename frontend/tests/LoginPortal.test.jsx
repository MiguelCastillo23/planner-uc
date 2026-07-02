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

    expect(screen.getByRole('heading', { name: 'Administrador' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profesor / Docente' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estudiante de Pregrado' })).toBeInTheDocument();
  });

  it('shows error message on invalid admin login', () => {
    const handleLogin = vi.fn();
    const { container } = render(<LoginPortal onLogin={handleLogin} />);

    const userInput = container.querySelector('[data-cy="admin-user-input"]');
    const passInput = container.querySelector('[data-cy="admin-pass-input"]');
    const submitBtn = container.querySelector('[data-cy="admin-login-button"]');

    fireEvent.change(userInput, { target: { value: 'wrong_user' } });
    fireEvent.change(passInput, { target: { value: 'wrong_pass' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/)).toBeInTheDocument();
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it('triggers onLogin callback with administrador role on successful admin login', () => {
    const handleLogin = vi.fn();
    const { container } = render(<LoginPortal onLogin={handleLogin} />);

    const userInput = container.querySelector('[data-cy="admin-user-input"]');
    const passInput = container.querySelector('[data-cy="admin-pass-input"]');
    const submitBtn = container.querySelector('[data-cy="admin-login-button"]');

    fireEvent.change(userInput, { target: { value: 'admin' } });
    fireEvent.change(passInput, { target: { value: 'admin' } });
    fireEvent.click(submitBtn);

    expect(handleLogin).toHaveBeenCalledWith('administrador', null);
  });

  it('triggers onLogin callback with student data when student is selected', () => {
    const handleLogin = vi.fn();
    const { container } = render(
      <LoginPortal 
        estudiantesSimulados={mockStudents} 
        onLogin={handleLogin} 
      />
    );

    const studentSelect = container.querySelector('[data-cy="student-select"]'); 
    fireEvent.change(studentSelect, { target: { value: 'e1' } });

    const studentBtn = container.querySelector('[data-cy="student-login-button"]');
    fireEvent.click(studentBtn);

    expect(handleLogin).toHaveBeenCalledWith('estudiante', mockStudents[0]);
  });

  it('triggers onLogin callback with teacher data when teacher is selected', () => {
    const handleLogin = vi.fn();
    const { container } = render(
      <LoginPortal 
        docentesDisponibles={mockTeachers} 
        onLogin={handleLogin} 
      />
    );

    const teacherSelect = container.querySelector('[data-cy="docente-select"]');
    fireEvent.change(teacherSelect, { target: { value: 'd1' } });

    const teacherBtn = container.querySelector('[data-cy="docente-login-button"]');
    fireEvent.click(teacherBtn);

    expect(handleLogin).toHaveBeenCalledWith('docente', mockTeachers[0]);
  });
});
