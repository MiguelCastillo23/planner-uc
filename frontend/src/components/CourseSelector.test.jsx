import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseSelector } from './CourseSelector';

// Helper to generate mock courses (called inside beforeEach to ensure fresh data)
const getMockCursos = () => [
  { codigo: 'C001', nombre: 'Matemática I', creditos: 4 },
  { codigo: 'C002', nombre: 'Física I', creditos: 4 },
  { codigo: 'C003', nombre: 'Programación I', creditos: 4 },
  { codigo: 'C004', nombre: 'Química', creditos: 4 },
  { codigo: 'C005', nombre: 'Literatura', creditos: 3 },
  { codigo: 'C006', nombre: 'Historia', creditos: 3 },
];

let mockCursos; // Will be initialized in beforeEach

describe('CourseSelector Component', () => {
  let mockOnToggle;
  let mockOnGenerar;

  beforeEach(() => {
    mockOnToggle = jest.fn();
    mockOnGenerar = jest.fn();
    mockCursos = getMockCursos();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==================== RENDERIZADO CORRECTO ====================

  describe('1. Renderizado correcto del componente', () => {
    it('should render the component with title and credits counter (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText('Selección de Asignaturas')).toBeInTheDocument();
      expect(screen.getByText('Créditos: 0 / 22')).toBeInTheDocument();
    });

    it('should render all available courses as checkboxes (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      mockCursos.forEach(curso => {
        expect(screen.getByText(`${curso.nombre} (${curso.creditos})`)).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(mockCursos.length);
    });

    it('should render with empty course list (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: [],
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText('Selección de Asignaturas')).toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('should render generate button (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      const btn = screen.getByRole('button', { name: /Generar Horario Óptimo/i });
      expect(btn).toBeInTheDocument();
    });
  });

  // ==================== RENDERIZADO CONDICIONAL ====================

  describe('2. Renderizado condicional (validación de créditos)', () => {
    it('should show warning message when credits are invalid (< 20) (Arrange-Act-Assert)', () => {
      // Arrange: seleccionar cursos que sumen menos de 20 créditos
      const seleccionados = [mockCursos[0]]; // 4 créditos
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText(/Selecciona entre 20 y 22 créditos/i)).toBeInTheDocument();
    });

    it('should NOT show warning message when credits are valid (20-22) (Arrange-Act-Assert)', () => {
      // Arrange: seleccionar cursos que sumen exactamente 22 créditos
      const seleccionados = mockCursos; // 4+4+4+4+3+3 = 22 créditos
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.queryByText(/Selecciona entre 20 y 22 créditos/i)).not.toBeInTheDocument();
    });

    it('should show warning message when credits exceed 22 (Arrange-Act-Assert)', () => {
      // Arrange: crear cursos que sumen más de 22 créditos
      const coursesOver22 = [
        { codigo: 'C001', nombre: 'A', creditos: 6 },
        { codigo: 'C002', nombre: 'B', creditos: 6 },
        { codigo: 'C003', nombre: 'C', creditos: 6 },
        { codigo: 'C004', nombre: 'D', creditos: 5 }, // 6+6+6+5 = 23
      ];
      const seleccionados = coursesOver22;
      const props = {
        cursosDisponibles: coursesOver22,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText(/Selecciona entre 20 y 22 créditos/i)).toBeInTheDocument();
    });
  });

  // ==================== INTERACCIÓN DEL USUARIO ====================

  describe('3. Interacción del usuario (toggles y eventos)', () => {
    it('should call onToggle when clicking a course checkbox (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      render(<CourseSelector {...props} />);
      const checkbox = screen.getByRole('checkbox', { name: /Matemática I/i });

      // Act: usar click en lugar de change para disparar onChange
      fireEvent.click(checkbox);

      // Assert
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith(mockCursos[0]);
    });

    it('should call onGenerar when clicking the generate button with valid credits (Arrange-Act-Assert)', () => {
      // Arrange: 20 créditos válidos
      const seleccionados = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3]]; // 4+4+4+4=16, ajustar
      const seleccionadosValid = mockCursos.slice(0, 5); // Primeros 5: 4+4+4+4+3=19 (sigue siendo inválido)
      
      // Usar una combinación que sume exactamente 20
      const validSelection = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3], mockCursos[5]]; // 4+4+4+4+3=19
      const validSelection2 = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[4], mockCursos[5]]; // 4+4+4+3+3=18
      // Mejor: tomar los primeros 5 cursos 4+4+4+4+3 = 19, y agregar otro de 3
      const correctSelection = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3], mockCursos[5]]; // 4+4+4+4+3=19 (no funciona)
      
      // Simplemente usar todos excepto el último: 4+4+4+4+3 = 19
      // Mejor: usar los 5 primeros: 4+4+4+4+3 = 19, necesitamos 20. Agregar el último de 3? 19+3=22
      // Perfecto: [0,1,2,3,5] = 4+4+4+4+3 = 19 (no), [0,1,2,3,4] = 4+4+4+4+3 = 19 (no)
      // [0,1,2,4] = 4+4+4+3 = 15, [0,1,2,3,5] = 4+4+4+4+3 = 19... Necesitamos exactamente 20
      // 4+4+4+4+4 = 20! Pero solo tenemos 4 cursos de 4 créditos
      // Válido: los primeros 5 cursos (0-4) = 4+4+4+4+3 = 19. Agregar el 5to (3 créditos) = 22. Perfecto!
      const validSelection20 = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3], mockCursos[5]]; // 4+4+4+4+3=19... wait let me recalculate
      // C001: 4, C002: 4, C003: 4, C004: 4, C005: 3, C006: 3
      // [0,1,2,3,5] = 4+4+4+4+3 = 19. [0,1,2,3,4,5] = 4+4+4+4+3+3 = 22. [0,1,2,4,5] = 4+4+4+3+3 = 18
      // Así que [0,1,2,3,5] sigue siendo 19. Necesito 20 exacto...
      // [1,2,3,4,5] = 4+4+4+3+3 = 18. No...
      // [0,1,2,3] = 4+4+4+4 = 16. [0,1,2,4] = 4+4+4+3 = 15
      // Tal vez necesito otro curso no existente o usar una combinación diferente
      // Espera: [0,1,2,3] = 16, [0,1,2,3,5] = 19, [0,1,2,3,4,5] = 22
      // Para 20 y 21, necesitaría un curso de 4 créditos más (4+4+4+4+4=20) pero solo hay 4 de esos.
      // Voy a crear un curso adicional de 1 crédito o ajustar los datos mock.
      
      // Mejor estrategia: usar la combinación que SÍ suma 22 (que es válida)
      const validSelection22 = mockCursos; // 4+4+4+4+3+3 = 22
      
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: validSelection22,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      render(<CourseSelector {...props} />);
      const btn = screen.getByRole('button', { name: /Generar Horario Óptimo/i });

      // Act
      fireEvent.click(btn);

      // Assert
      expect(mockOnGenerar).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onGenerar when button is disabled (invalid credits) (Arrange-Act-Assert)', () => {
      // Arrange: menos de 20 créditos
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [mockCursos[0]], // 4 créditos
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      render(<CourseSelector {...props} />);
      const btn = screen.getByRole('button', { name: /Generar Horario Óptimo/i });

      // Act
      fireEvent.click(btn);

      // Assert
      expect(mockOnGenerar).not.toHaveBeenCalled();
    });

    it('should NOT call onGenerar when loading is true (Arrange-Act-Assert)', () => {
      // Arrange: válido pero loading = true
      const validSelection = mockCursos; // 22 créditos
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: validSelection,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: true,
      };

      render(<CourseSelector {...props} />);
      const btn = screen.getByRole('button', { name: /Procesando Algoritmo/i });

      // Act
      fireEvent.click(btn);

      // Assert
      expect(mockOnGenerar).not.toHaveBeenCalled();
    });
  });

  // ==================== ESTADO Y ESTILOS CONDICIONALES ====================

  describe('4. Actualización de estados y estilos condicionales', () => {
    it('should reflect selected courses visually (Arrange-Act-Assert)', () => {
      // Arrange: un curso seleccionado
      const seleccionados = [mockCursos[0]];
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert: la primera checkbox debe estar marcada
      const checkbox1 = screen.getByRole('checkbox', { name: /Matemática I/i });
      expect(checkbox1).toBeChecked();

      // las demás no
      const checkbox2 = screen.getByRole('checkbox', { name: /Física I/i });
      expect(checkbox2).not.toBeChecked();
    });

    it('should display correct total credits (Arrange-Act-Assert)', () => {
      // Arrange: 3 cursos seleccionados
      const seleccionados = [mockCursos[0], mockCursos[1], mockCursos[4]]; // 4+4+3=11
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText('Créditos: 11 / 22')).toBeInTheDocument();
    });

    it('should show loading text when loading is true (Arrange-Act-Assert)', () => {
      // Arrange: válido + loading
      const validSelection = mockCursos;
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: validSelection,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: true,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByRole('button', { name: /Procesando Algoritmo/i })).toBeInTheDocument();
    });

    it('should disable button when loading is true (Arrange-Act-Assert)', () => {
      // Arrange
      const validSelection = mockCursos;
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: validSelection,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: true,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });
  });

  // ==================== CASOS LÍMITE ====================

  describe('5. Casos límite y comportamientos críticos', () => {
    it('should handle exactly 20 credits (lower boundary) (Arrange-Act-Assert)', () => {
      // Arrange: exactamente 20
      // 4+4+4+4+4 = 20 (necesitamos 5 de 4 créditos, pero solo hay 4)
      // Alternativamente: 4+4+4+4+3+? ... 4+4+4+4+3 = 19
      // Mejor: ajustemos la búsqueda. 4+4+4+4 = 16, 4+4+4+4+3 = 19, 4+4+4+4+3+3 = 22
      // Para exactamente 20: necesitaría un curso de 4 más. Voy a crear datos de prueba ajustados o usar la mejor combinación disponible.
      // Usaré: [0,1,2,3,5] para 19, [0,1,2,3,4,5] para 22, pero necesito 20 o 21.
      // Estrategia: crear cursos mock adicionales en esta prueba específica.
      
      const cursosFor20 = [
        { codigo: 'C001', nombre: 'A', creditos: 5 },
        { codigo: 'C002', nombre: 'B', creditos: 5 },
        { codigo: 'C003', nombre: 'C', creditos: 5 },
        { codigo: 'C004', nombre: 'D', creditos: 5 },
      ];
      const seleccionados = cursosFor20; // 5+5+5+5 = 20

      const props = {
        cursosDisponibles: cursosFor20,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert: debe estar válido (no mostrar warning)
      expect(screen.queryByText(/Selecciona entre 20 y 22 créditos/i)).not.toBeInTheDocument();
      const btn = screen.getByRole('button');
      expect(btn).not.toBeDisabled();
    });

    it('should handle exactly 22 credits (upper boundary) (Arrange-Act-Assert)', () => {
      // Arrange: exactamente 22
      const seleccionados = mockCursos; // 4+4+4+4+3+3 = 22

      const props = {
        cursosDisponibles: mockCursos,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.queryByText(/Selecciona entre 20 y 22 créditos/i)).not.toBeInTheDocument();
      const btn = screen.getByRole('button');
      expect(btn).not.toBeDisabled();
    });

    it('should handle 19 credits (just below valid range) (Arrange-Act-Assert)', () => {
      // Arrange: 19 créditos
      const seleccionados = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[4]]; // 4+4+4+3 = 15
      // Mejor: [0,1,2,3,4] = 4+4+4+4+3 = 19

      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3], mockCursos[4]],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert: debe estar inválido
      expect(screen.getByText(/Selecciona entre 20 y 22 créditos/i)).toBeInTheDocument();
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });

    it('should handle 23 credits (just above valid range) (Arrange-Act-Assert)', () => {
      // Arrange: 23 créditos
      // No es posible con los mock datos actuales (máximo 22). Usaré datos específicos.
      const coursesFor23 = [
        { codigo: 'C001', nombre: 'A', creditos: 6 },
        { codigo: 'C002', nombre: 'B', creditos: 6 },
        { codigo: 'C003', nombre: 'C', creditos: 6 },
        { codigo: 'C004', nombre: 'D', creditos: 5 },
      ];
      const seleccionados = coursesFor23; // 6+6+6+5 = 23

      const props = {
        cursosDisponibles: coursesFor23,
        seleccionados,
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText(/Selecciona entre 20 y 22 créditos/i)).toBeInTheDocument();
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });

    it('should handle zero credits (empty selection) (Arrange-Act-Assert)', () => {
      // Arrange: sin selecciones
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      // Act
      render(<CourseSelector {...props} />);

      // Assert
      expect(screen.getByText('Créditos: 0 / 22')).toBeInTheDocument();
      expect(screen.getByText(/Selecciona entre 20 y 22 créditos/i)).toBeInTheDocument();
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });
  });

  // ==================== MÚLTIPLES SELECCIONES ====================

  describe('6. Múltiples selecciones y deselecciones', () => {
    it('should handle multiple course toggles correctly (Arrange-Act-Assert)', () => {
      // Arrange
      const props = {
        cursosDisponibles: mockCursos,
        seleccionados: [],
        onToggle: mockOnToggle,
        onGenerar: mockOnGenerar,
        loading: false,
      };

      render(<CourseSelector {...props} />);

      // Act: clickear múltiples checkboxes
      const checkbox1 = screen.getByRole('checkbox', { name: /Matemática I/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /Física I/i });
      const checkbox3 = screen.getByRole('checkbox', { name: /Programación I/i });

      fireEvent.click(checkbox1);
      fireEvent.click(checkbox2);
      fireEvent.click(checkbox3);

      // Assert
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, mockCursos[0]);
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, mockCursos[1]);
      expect(mockOnToggle).toHaveBeenNthCalledWith(3, mockCursos[2]);
    });
  });

  // ==================== PROPS UPDATES ====================

  describe('7. Actualización de props desde componentes padres', () => {
    it('should update when seleccionados prop changes (Arrange-Act-Assert)', () => {
      // Arrange
      const { rerender } = render(
        <CourseSelector
          cursosDisponibles={mockCursos}
          seleccionados={[]}
          onToggle={mockOnToggle}
          onGenerar={mockOnGenerar}
          loading={false}
        />
      );

      expect(screen.getByText('Créditos: 0 / 22')).toBeInTheDocument();

      // Act: actualizar con nuevos seleccionados
      const newSeleccionados = [mockCursos[0], mockCursos[1], mockCursos[2], mockCursos[3], mockCursos[4], mockCursos[5]]; // 22 créditos
      rerender(
        <CourseSelector
          cursosDisponibles={mockCursos}
          seleccionados={newSeleccionados}
          onToggle={mockOnToggle}
          onGenerar={mockOnGenerar}
          loading={false}
        />
      );

      // Assert
      expect(screen.getByText('Créditos: 22 / 22')).toBeInTheDocument();
    });

    it('should update button state when loading prop changes (Arrange-Act-Assert)', () => {
      // Arrange: válido pero no loading
      const validSelection = mockCursos;
      const { rerender } = render(
        <CourseSelector
          cursosDisponibles={mockCursos}
          seleccionados={validSelection}
          onToggle={mockOnToggle}
          onGenerar={mockOnGenerar}
          loading={false}
        />
      );

      const btn = screen.getByRole('button', { name: /Generar Horario Óptimo/i });
      expect(btn).not.toBeDisabled();

      // Act: cambiar a loading = true
      rerender(
        <CourseSelector
          cursosDisponibles={mockCursos}
          seleccionados={validSelection}
          onToggle={mockOnToggle}
          onGenerar={mockOnGenerar}
          loading={true}
        />
      );

      // Assert
      expect(screen.getByRole('button', { name: /Procesando Algoritmo/i })).toBeDisabled();
    });
  });
});
