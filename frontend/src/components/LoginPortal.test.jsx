import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPortal } from './LoginPortal';
import { mockStudents, mockDocentes } from '../mocks/handlers';

// ==================== TEST DATA ====================
// Using mockStudents and mockDocentes from mocks/handlers.js

describe('LoginPortal Component', () => {
  let mockOnLogin;

  beforeEach(() => {
    mockOnLogin = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== 1. RENDERIZADO CORRECTO ====================

  describe('1. Renderizado correcto del componente', () => {
    it('should render login portal with all three sections (admin, student, docente) (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert
      expect(screen.getByText(/Ingreso/i)).toBeInTheDocument();
      expect(screen.getByText(/Planner-UC/i)).toBeInTheDocument();
      expect(screen.getByText(/Acceso Administrador/i)).toBeInTheDocument();
      expect(screen.getByText(/Acceso Estudiante/i)).toBeInTheDocument();
      expect(screen.getByText(/Acceso Docente/i)).toBeInTheDocument();
    });

    it('should render admin form with username and password inputs (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      expect(userInput).toBeInTheDocument();
      expect(passInput).toBeInTheDocument();
      expect(userInput.type).toBe('text');
      expect(passInput.type).toBe('password');
    });

    it('should render student select dropdown with mock data (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert: Verify select exists
      const studentSelects = screen.getAllByDisplayValue(/Seleccione estudiante.../i);
      expect(studentSelects.length).toBeGreaterThan(0);

      // Verify all student names are in options
      mockStudents.forEach(student => {
        expect(screen.getByText(student.nombre)).toBeInTheDocument();
      });
    });

    it('should render docente select dropdown with mock data (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert: Verify select exists
      const docenteSelects = screen.getAllByDisplayValue(/Seleccione docente.../i);
      expect(docenteSelects.length).toBeGreaterThan(0);

      // Verify all docente names are in options
      mockDocentes.forEach(docente => {
        expect(screen.getByText(docente.nombre)).toBeInTheDocument();
      });
    });
  });

  // ==================== 2. ESTADOS VACÍOS ====================

  describe('2. Estados vacíos (Empty states)', () => {
    it('should render with empty student list (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: [],
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert
      const studentSelects = screen.getAllByDisplayValue(/Seleccione estudiante.../i);
      expect(studentSelects[0]).toBeInTheDocument();
      
      // Should only have the placeholder option
      const options = studentSelects[0].querySelectorAll('option');
      expect(options).toHaveLength(1); // Only placeholder
    });

    it('should render with empty docente list (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: [],
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert
      const docenteSelects = screen.getAllByDisplayValue(/Seleccione docente.../i);
      expect(docenteSelects[0]).toBeInTheDocument();
      
      // Should only have the placeholder option
      const options = docenteSelects[0].querySelectorAll('option');
      expect(options).toHaveLength(1);
    });

    it('should render with both lists empty (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: [],
        docentesDisponibles: [],
        onLogin: mockOnLogin,
      };

      // Act
      render(<LoginPortal {...props} />);

      // Assert: Should still render, but with empty selects
      expect(screen.getByText(/Acceso Estudiante/i)).toBeInTheDocument();
      expect(screen.getByText(/Acceso Docente/i)).toBeInTheDocument();
    });
  });

  // ==================== 3. VALIDACIÓN DE FORMULARIO ADMIN ====================

  describe('3. Validación de formulario de administrador', () => {
    it('should show error message when admin credentials are incorrect (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act: Enter wrong credentials
      await userEvent.type(userInput, 'wronguser');
      await userEvent.type(passInput, 'wrongpass');
      fireEvent.click(submitBtn);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/i)).toBeInTheDocument();
      });
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should NOT show error when admin credentials are correct (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act: Enter correct credentials
      await userEvent.type(userInput, 'admin');
      await userEvent.type(passInput, 'admin');
      fireEvent.click(submitBtn);

      // Assert
      expect(screen.queryByText(/Usuario o contraseña de administrador incorrectos/i)).not.toBeInTheDocument();
    });

    it('should clear error message when user corrects password and retries (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act: First attempt with wrong credentials
      await userEvent.type(userInput, 'admin');
      await userEvent.type(passInput, 'wrong');
      fireEvent.click(submitBtn);

      // Assert: Error should appear
      await waitFor(() => {
        expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/i)).toBeInTheDocument();
      });

      // Act: Correct the password
      await userEvent.clear(passInput);
      await userEvent.type(passInput, 'admin');
      fireEvent.click(submitBtn);

      // Assert: Error should disappear
      expect(screen.queryByText(/Usuario o contraseña de administrador incorrectos/i)).not.toBeInTheDocument();
    });
  });

  // ==================== 4. LLAMADAS A onLogin ====================

  describe('4. Acciones de login (Admin, Estudiante, Docente)', () => {
    it('should call onLogin with role "administrador" when admin credentials are correct (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act
      await userEvent.type(userInput, 'admin');
      await userEvent.type(passInput, 'admin');
      fireEvent.click(submitBtn);

      // Assert
      expect(mockOnLogin).toHaveBeenCalledWith('administrador', null);
    });

    it('should call onLogin when student is selected and Ingresar button clicked (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);

      // Find all selects
      const selects = screen.getAllByRole('combobox');
      const studentSelect = selects[0]; // First select is for students
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const studentButton = allButtons[0]; // First Ingresar is for students

      // Act: Select a student
      fireEvent.change(studentSelect, { target: { value: 'est001' } });
      fireEvent.click(studentButton);

      // Assert
      expect(mockOnLogin).toHaveBeenCalledWith('estudiante', mockStudents[0]);
    });

    it('should call onLogin when docente is selected and Ingresar button clicked (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);

      // Find all selects and buttons
      const selects = screen.getAllByRole('combobox');
      const docenteSelect = selects[1]; // Second select is for docentes
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const docenteButton = allButtons[1]; // Second Ingresar is for docentes

      // Act: Select a docente
      fireEvent.change(docenteSelect, { target: { value: 'doc001' } });
      fireEvent.click(docenteButton);

      // Assert
      expect(mockOnLogin).toHaveBeenCalledWith('docente', mockDocentes[0]);
    });
  });

  // ==================== 5. ESTADOS DE BOTONES ====================
 
  describe('5. Estados de botones (Habilitado/Deshabilitado)', () => {
    it('should disable student Ingresar button when no student is selected (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const studentButton = allButtons[0];

      // Assert: Button should be disabled
      expect(studentButton).toBeDisabled();
    });

    it('should enable student Ingresar button when student is selected (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const selects = screen.getAllByRole('combobox');
      const studentSelect = selects[0];
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const studentButton = allButtons[0];

      // Act: Select a student
      fireEvent.change(studentSelect, { target: { value: 'est001' } });
      // Wait for component update
      await waitFor(() => {
        expect(studentButton).not.toBeDisabled();
      });
    });

    it('should disable docente Ingresar button when no docente is selected (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const docenteButton = allButtons[1];

      // Assert
      expect(docenteButton).toBeDisabled();
    });

    it('should enable docente Ingresar button when docente is selected (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const selects = screen.getAllByRole('combobox');
      const docenteSelect = selects[1];
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const docenteButton = allButtons[1];

      // Act: Select a docente
      fireEvent.change(docenteSelect, { target: { value: 'doc001' } });
      // Wait for component update
      await waitFor(() => {
        expect(docenteButton).not.toBeDisabled();
      });
    });
  });

  // ==================== 6. RENDERIZADO CONDICIONAL ====================

  describe('6. Renderizado condicional basado en datos', () => {
    it('should render correct number of student options (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const selects = screen.getAllByDisplayValue(/Seleccione estudiante.../i);
      const studentSelect = selects[0];

      // Assert: 1 placeholder + 3 students = 4 options
      const options = studentSelect.querySelectorAll('option');
      expect(options).toHaveLength(mockStudents.length + 1);
    });

    it('should render correct number of docente options (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const docenteSelects = screen.getAllByDisplayValue(/Seleccione docente.../i);
      const docenteSelect = docenteSelects[0];

      // Assert: 1 placeholder + 2 docentes = 3 options
      const options = docenteSelect.querySelectorAll('option');
      expect(options).toHaveLength(mockDocentes.length + 1);
    });

    it('should update dropdown when estudiantesSimulados prop changes (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      const { rerender } = render(<LoginPortal {...props} />);
      let selects = screen.getAllByDisplayValue(/Seleccione estudiante.../i);
      let studentSelect = selects[0];
      let options = studentSelect.querySelectorAll('option');
      
      expect(options).toHaveLength(mockStudents.length + 1);

      // Act: Add more students
      const newStudents = [...mockStudents, { _id: 'est004', nombre: 'Nueva Estudiante' }];
      rerender(
        <LoginPortal
          estudiantesSimulados={newStudents}
          docentesDisponibles={mockDocentes}
          onLogin={mockOnLogin}
        />
      );

      // Assert
      selects = screen.getAllByDisplayValue(/Seleccione estudiante.../i);
      studentSelect = selects[0];
      options = studentSelect.querySelectorAll('option');
      expect(options).toHaveLength(newStudents.length + 1);
    });
  });

  // ==================== 7. VALIDACIONES DE FORMULARIO ====================

  describe('7. Validaciones y casos límite', () => {
    it('should not call onLogin when admin form is submitted without filling fields (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act: Click submit without filling form
      fireEvent.click(submitBtn);

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/i)).toBeInTheDocument();
    });

    it('should require both username and password to be correct (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const userInput = screen.getByPlaceholderText(/Usuario \(admin\)/i);
      const passInput = screen.getByPlaceholderText(/Contraseña \(admin\)/i);
      const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

      // Act: Correct username, wrong password
      await userEvent.type(userInput, 'admin');
      await userEvent.type(passInput, 'wrongpass');
      fireEvent.click(submitBtn);

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(screen.getByText(/Usuario o contraseña de administrador incorrectos/i)).toBeInTheDocument();
    });

    it('should handle selecting then deselecting a student (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const selects = screen.getAllByRole('combobox');
      const studentSelect = selects[0];
      const allButtons = screen.getAllByRole('button', { name: /Ingresar/i });
      const studentButton = allButtons[0];

      // Act: Select a student
      fireEvent.change(studentSelect, { target: { value: 'est001' } });
      expect(studentButton).not.toBeDisabled();

      // Act: Deselect (reset to placeholder)
      fireEvent.change(studentSelect, { target: { value: '' } });
      
      // Assert: Button should be disabled again
      expect(studentButton).toBeDisabled();
    });
  });

  // ==================== 8. INTERACCIÓN CON MÚLTIPLES ROLES ====================

  describe('8. Interacción con múltiples roles simultaneously', () => {
    it('should handle independent selections in student and docente dropdowns (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);

      const selects = screen.getAllByRole('combobox');
      const studentSelect = selects[0];
      const docenteSelect = selects[1];

      // Act: Select both a student and a docente
      fireEvent.change(studentSelect, { target: { value: 'est001' } });
      fireEvent.change(docenteSelect, { target: { value: 'doc001' } });

      // Assert: Both should be selected
      expect(studentSelect).toHaveValue('est001');
      expect(docenteSelect).toHaveValue('doc001');
    });

    it('should not call onLogin until button is clicked (Arrange-Act-Assert)', async () => {
      // Arrange
      const props = {
        estudiantesSimulados: mockStudents,
        docentesDisponibles: mockDocentes,
        onLogin: mockOnLogin,
      };

      render(<LoginPortal {...props} />);
      const selects = screen.getAllByRole('combobox');
      const studentSelect = selects[0];

      // Act: Select a student but don't click button
      fireEvent.change(studentSelect, { target: { value: 'est001' } });

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });
});

