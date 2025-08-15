import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddQuizModal from '../admin/createModule/AddQuizModal';
import { UnitContext } from '../../context/admin/UnitContext';
import { ContentBlockContext } from '../../context/admin/ContentBlockContext';

describe('AddQuizModal', () => {
  const mockOnClose = vi.fn();
  const mockAddContentBlock = vi.fn();
  const mockUpdateUnitField = vi.fn();
  const mockSaveContent = vi.fn(async () => ({
    id: 'quiz-123',
    type: 'quiz',
    data: {
      title: 'Quiz Title',
      content: 'Quiz description',
      points: 5,
      questions: [
        {
          title: 'Q1',
          type: 'multiple',
          sort_order: 1,
          answers: [
            { title: 'A', is_correct: true, sort_order: 1 },
            { title: 'B', is_correct: false, sort_order: 2 },
          ],
        },
      ],
    },
    sortOrder: 10,
    unit_id: 'unit-1',
    isDirty: false,
    isSaving: false,
    error: null,
  }));
  const mockClearContent = vi.fn();

  const baseContentState = {
    type: 'quiz' as const,
    data: {
      title: '',
      content: '',
      points: undefined as unknown as number | '' | undefined,
      questions: [] as any[],
    },
    sortOrder: 0,
    unit_id: '',
    isDirty: true,
    isSaving: false,
    error: null as string | null,
  };

  function renderWithProviders(
    overrideContent?: Partial<typeof baseContentState>,
  ) {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [state, setState] = React.useState({
        ...baseContentState,
        ...overrideContent,
      });

      const unitContextValue = {
        unitStates: {},
        updateUnitField: mockUpdateUnitField,
        markUnitAsDirty: vi.fn(),
        setUnitState: vi.fn(),
        getUnitState: vi.fn(),
        getNextUnitNumber: vi.fn(() => 2),
        saveUnit: vi.fn(),
        removeUnit: vi.fn(),
        addContentBlock: mockAddContentBlock,
        removeContentBlock: vi.fn(),
        setUnitStatesRaw: vi.fn(),
        loadUnitContentIntoState: vi.fn(),
        setIsEditing: vi.fn(),
        editingBlock: null as any,
        setEditingBlock: vi.fn(),
        getNextSortOrder: vi.fn(() => 10),
      };

      const contentContextValue = {
        ...state,
        updateContentField: (key: 'data' | any, value: any) => {
          if (key === 'data') {
            setState((prev) => ({ ...prev, data: { ...prev.data, ...value } }));
          } else {
            setState((prev) => ({ ...prev, [key]: value }));
          }
        },
        saveContent: mockSaveContent,
        isSaving: false,
        isDirty: true,
        setContentState: (patch: any) =>
          setState((prev) => ({ ...prev, ...patch })),
        clearContent: mockClearContent,
        getContentState: () => state,
        updateQuestion: vi.fn(),
        updateAnswer: vi.fn(),
        markContentAsDirty: vi.fn(),
      };

      return (
        <UnitContext.Provider value={unitContextValue as any}>
          <ContentBlockContext.Provider value={contentContextValue as any}>
            {children}
          </ContentBlockContext.Provider>
        </UnitContext.Provider>
      );
    };

    return render(
      <Wrapper>
        <AddQuizModal
          isOpen={true}
          onClose={mockOnClose}
          unitId="unit-1"
          unitNumber={1}
        />
      </Wrapper>,
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows user to type the description', async () => {
    renderWithProviders();

    const desc = screen.getByLabelText(/quiz description/i);
    await userEvent.type(desc, 'This is a quiz description');

    // let React flush
    await waitFor(() => expect(desc).toHaveValue('This is a quiz description'));
  });

  it('saves when content is valid and calls onClose', async () => {
    renderWithProviders({
      data: {
        title: 'Quiz Title',
        content: 'Quiz description',
        points: 5,
        questions: [
          {
            title: 'Q1',
            type: 'multiple',
            sort_order: 1,
            answers: [
              { title: 'A', is_correct: true, sort_order: 1 },
              { title: 'B', is_correct: false, sort_order: 2 },
            ],
          },
        ],
      },
    });

    await userEvent.click(screen.getByRole('button', { name: /save quiz/i }));

    await waitFor(() => {
      expect(mockSaveContent).toHaveBeenCalledWith('quiz');
      expect(mockAddContentBlock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ type: 'quiz', unit_id: 'unit-1' }),
      );
      expect(mockClearContent).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('renders a single-file "Attachment" input after the Title field', () => {
    renderWithProviders();

    const titleInput = screen.getByLabelText('Title');
    const fileInput = screen.getByLabelText('Attachment') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).not.toHaveAttribute('multiple');

    const isAfter =
      (titleInput.compareDocumentPosition(fileInput) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
      0;
    expect(isAfter).toBe(true);
  });
});
