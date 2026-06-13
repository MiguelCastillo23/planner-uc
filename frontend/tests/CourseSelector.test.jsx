import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CourseSelector } from '../src/components/CourseSelector';

const mockCursos = [
  { nombre: 'Cálculo I', codigo: 'CAL-01', creditos: 5 },
  { nombre: 'Física I', codigo: 'FIS-01', creditos: 5 },
  { nombre: 'Programación I', codigo: 'PROG-01', creditos: 6 },
  { nombre: 'Química', codigo: 'QUIM-01', creditos: 4 },
  { nombre: 'Matemática Discreta', codigo: 'MAT-02', creditos: 4 }
];

describe('CourseSelector Component', () => {
  it('renders available courses and displays current credits', () => {
    render(
      <CourseSelector 
        cursosDisponibles={mockCursos} 
        seleccionados={[]} 
        onToggle={vi.fn()} 
        onGenerar={vi.fn()} 
        loading={false} 
      />
    );

    expect(screen.getByText('Cálculo I (5)')).toBeInTheDocument();
    expect(screen.getByText('Programación I (6)')).toBeInTheDocument();
    expect(screen.getByText('Créditos: 0 / 22')).toBeInTheDocument();
  });

  it('triggers onToggle callback when clicking on a course', () => {
    const handleToggle = vi.fn();
    render(
      <CourseSelector 
        cursosDisponibles={mockCursos} 
        seleccionados={[]} 
        onToggle={handleToggle} 
        onGenerar={vi.fn()} 
        loading={false} 
      />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith(mockCursos[0]);
  });

  it('keeps the button disabled if total credits is outside 20-22 range', () => {
    const handleGenerar = vi.fn();
    render(
      <CourseSelector 
        cursosDisponibles={mockCursos} 
        seleccionados={[mockCursos[0], mockCursos[1]]} // 10 credits
        onToggle={vi.fn()} 
        onGenerar={handleGenerar} 
        loading={false} 
      />
    );

    const button = screen.getByRole('button', { name: /Generar Horario Óptimo/ });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Selecciona entre 20 y 22 créditos/)).toBeInTheDocument();
  });

  it('enables the button if total credits is inside 20-22 range and handles onGenerar click', () => {
    const handleGenerar = vi.fn();
    render(
      <CourseSelector 
        cursosDisponibles={mockCursos} 
        seleccionados={[mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3]]} // 5 + 5 + 6 + 4 = 20 credits
        onToggle={vi.fn()} 
        onGenerar={handleGenerar} 
        loading={false} 
      />
    );

    const button = screen.getByRole('button', { name: /Generar Horario/ });
    expect(button).toBeEnabled();
    expect(screen.queryByText(/Selecciona entre 20 y 22 créditos/)).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(handleGenerar).toHaveBeenCalledTimes(1);
  });

  it('shows processing state and disables button when loading is true', () => {
    render(
      <CourseSelector 
        cursosDisponibles={mockCursos} 
        seleccionados={[mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3]]} // 20 credits
        onToggle={vi.fn()} 
        onGenerar={vi.fn()} 
        loading={true} 
      />
    );

    const button = screen.getByRole('button', { name: /Procesando/ });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Procesando Algoritmo...');
  });
});
