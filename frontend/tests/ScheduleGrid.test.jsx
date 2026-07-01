import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ScheduleGrid from '../src/components/ScheduleGrid';

const mockAsignaciones = [
  {
    codigo: '101',
    nombre: 'Programación I',
    aula: 'Lab 101',
    docente: 'Alan Turing',
    dia: 0, // Lunes
    franja: 1  // 08:41 AM - 10:11 AM
  },
  {
    codigo: '102',
    nombre: 'Física I',
    aula: 'Aula 201',
    docente: 'Isaac Newton',
    dia: 1, // Martes
    franja: 2  // 10:22 AM - 11:52 AM
  }
];

describe('ScheduleGrid Component', () => {
  it('renders all day headers and hour slots correctly', () => {
    render(<ScheduleGrid asignaciones={[]} />);

    expect(screen.getByText('FRANJA HORARIA')).toBeInTheDocument();
    expect(screen.getByText('LUNES')).toBeInTheDocument();
    expect(screen.getByText('MARTES')).toBeInTheDocument();
    expect(screen.getByText('SÁBADO')).toBeInTheDocument();
    
    // Check some specific hour slots
    expect(screen.getByText('07:00 AM - 08:30 AM')).toBeInTheDocument();
    expect(screen.getByText('08:28 PM - 09:58 PM')).toBeInTheDocument();
  });

  it('renders assigned classes in the schedule grid', () => {
    render(<ScheduleGrid asignaciones={mockAsignaciones} />);

    // Verification of Course 1
    expect(screen.getByText('PROGRAMACIÓN I')).toBeInTheDocument();
    expect(screen.getByText('NRC: 101')).toBeInTheDocument();
    expect(screen.getByText('AULA: Lab 101')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();

    // Verification of Course 2
    expect(screen.getByText('FÍSICA I')).toBeInTheDocument();
    expect(screen.getByText('AULA: Aula 201')).toBeInTheDocument();
    expect(screen.getByText('Isaac Newton')).toBeInTheDocument();
  });

  it('adapts theme styling based on isDark prop', () => {
    const { rerender, container } = render(<ScheduleGrid asignaciones={[]} isDark={true} />);
    const outerContainerElement = container.firstChild;
    expect(outerContainerElement).toHaveStyle('background-color: rgb(30, 41, 59)'); // #1e293b

    rerender(<ScheduleGrid asignaciones={[]} isDark={false} />);
    expect(outerContainerElement).toHaveStyle('background-color: rgb(255, 255, 255)'); // #fff
  });
});
