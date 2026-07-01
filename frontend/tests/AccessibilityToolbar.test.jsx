import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AccessibilityToolbar from '../src/components/AccessibilityToolbar';

describe('AccessibilityToolbar Component (WCAG)', () => {
  beforeEach(() => {
    // Limpiar clases de accesibilidad en html
    document.documentElement.className = '';
    localStorage.clear();

    // Mock de SpeechSynthesis
    window.speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the floating accessibility button', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    expect(floatingBtn).toBeInTheDocument();
    expect(floatingBtn).toHaveTextContent('♿');
  });

  it('opens and closes the accessibility settings panel', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    
    // Abrir panel
    fireEvent.click(floatingBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('⚙️ Ajustes WCAG')).toBeInTheDocument();

    // Cerrar panel mediante botón "✕"
    const closeBtn = screen.getByLabelText('Cerrar panel de accesibilidad');
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles high contrast mode on html element', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    fireEvent.click(floatingBtn);

    const highContrastBtn = screen.getByText('Alto Contraste');
    fireEvent.click(highContrastBtn);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(localStorage.getItem('acc_contrast')).toBe('true');

    const normalContrastBtn = screen.getByText('Normal');
    fireEvent.click(normalContrastBtn);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    expect(localStorage.getItem('acc_contrast')).toBe('false');
  });

  it('changes font size setting', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    fireEvent.click(floatingBtn);

    // Activar fuente grande (A+)
    const largeBtn = screen.getByText('A+');
    fireEvent.click(largeBtn);
    expect(document.documentElement.classList.contains('font-large')).toBe(true);
    expect(document.documentElement.classList.contains('font-xlarge')).toBe(false);

    // Activar fuente extra grande (A++)
    const xlargeBtn = screen.getByText('A++');
    fireEvent.click(xlargeBtn);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('font-xlarge')).toBe(true);

    // Restablecer a normal (A)
    const normalBtn = screen.getByText('A');
    fireEvent.click(normalBtn);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('font-xlarge')).toBe(false);
  });

  it('toggles dyslexic font mode', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    fireEvent.click(floatingBtn);

    const dyslexicCheckbox = screen.getByLabelText('Fuente Disléxica');
    fireEvent.click(dyslexicCheckbox);
    expect(document.documentElement.classList.contains('dyslexic-font')).toBe(true);

    fireEvent.click(dyslexicCheckbox);
    expect(document.documentElement.classList.contains('dyslexic-font')).toBe(false);
  });

  it('toggles highlight links mode', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    fireEvent.click(floatingBtn);

    const highlightCheckbox = screen.getByLabelText('Resaltar Enlaces');
    fireEvent.click(highlightCheckbox);
    expect(document.documentElement.classList.contains('highlight-links')).toBe(true);

    fireEvent.click(highlightCheckbox);
    expect(document.documentElement.classList.contains('highlight-links')).toBe(false);
  });

  it('can reset all accessibility settings', () => {
    render(<AccessibilityToolbar />);
    const floatingBtn = screen.getByLabelText('Menú de Accesibilidad');
    fireEvent.click(floatingBtn);

    // Cambiar varios estados
    fireEvent.click(screen.getByText('Alto Contraste'));
    fireEvent.click(screen.getByText('A+'));
    fireEvent.click(screen.getByLabelText('Fuente Disléxica'));

    // Verificar que estén aplicados
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(document.documentElement.classList.contains('font-large')).toBe(true);
    expect(document.documentElement.classList.contains('dyslexic-font')).toBe(true);

    // Hacer clic en restablecer
    fireEvent.click(screen.getByText('Restablecer Valores'));

    // Verificar que todo se restablece
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
    expect(document.documentElement.classList.contains('font-large')).toBe(false);
    expect(document.documentElement.classList.contains('dyslexic-font')).toBe(false);
  });
});
