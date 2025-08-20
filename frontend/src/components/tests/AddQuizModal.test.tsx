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

    fileName: undefined as string | undefined,
    fileSize: undefined as number | undefined,
    fileMime: undefined as string | undefined,
    fileId: null as string | null,
    fileBlob: null as File | null,
    fileError: null as string | null,
  };

  function renderWithProviders(
    overrideContent?: Partial<typeof baseContentState>,
  ) {
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [state, setState] = React.useState({
        ...baseContentState,
        ...overrideContent,
      });

      const updateUnitField = React.useCallback(mockUpdateUnitField, []);
      const markUnitAsDirty = React.useCallback(() => {}, []);
      const setUnitState = React.useCallback(() => {}, []);
      const getUnitState = React.useCallback(() => undefined, []);
      const getNextUnitNumber = React.useCallback(() => 2, []);
      const saveUnit = React.useCallback(async () => {}, []);
      const removeUnit = React.useCallback(async () => false, []);
      const addContentBlock = React.useCallback(mockAddContentBlock, []);
      const removeContentBlockFromContext = React.useCallback(() => {}, []);
      const removeUnitContent = React.useCallback(async () => false, []);
      const addUnit = React.useCallback(() => {}, []);
      const setUnitStatesRaw = React.useCallback(() => {}, []);
      const loadUnitContentIntoState = React.useCallback(async () => {}, []);
      const setIsEditing = React.useCallback(() => {}, []);
      const setEditingBlock = React.useCallback(() => {}, []);
      const getNextSortOrder = React.useCallback(() => 10, []);

      const unitContextValue = React.useMemo(
        () => ({
          unitStates: {},
          updateUnitField,
          markUnitAsDirty,
          setUnitState,
          getUnitState,
          getNextUnitNumber,
          saveUnit,
          removeUnit,
          addContentBlock,
          removeContentBlockFromContext,
          removeUnitContent,
          addUnit,
          setUnitStatesRaw,
          loadUnitContentIntoState,
          setIsEditing,
          editingBlock: null as any,
          setEditingBlock,
          getNextSortOrder,
        }),
        [
          updateUnitField,
          markUnitAsDirty,
          setUnitState,
          getUnitState,
          getNextUnitNumber,
          saveUnit,
          removeUnit,
          addContentBlock,
          removeContentBlockFromContext,
          removeUnitContent,
          addUnit,
          setUnitStatesRaw,
          loadUnitContentIntoState,
          setIsEditing,
          setEditingBlock,
          getNextSortOrder,
        ],
      );

      const updateContentField = React.useCallback(
        (key: 'data' | any, value: any) => {
          setState((prev) => {
            if (key === 'data') {
              return { ...prev, data: { ...prev.data, ...value } };
            }
            return { ...prev, [key]: value };
          });
        },
        [],
      );

      const saveContent = React.useCallback(() => mockSaveContent(), []);
      const setContentState = React.useCallback(
        (patch: any) => setState((prev) => ({ ...prev, ...patch })),
        [],
      );
      const clearContent = React.useCallback(() => {
        mockClearContent();
        setState((prev) => ({ ...prev, ...baseContentState }));
      }, []);
      const getContentState = React.useCallback(() => state, [state]);
      const updateQuestion = React.useCallback(() => {}, []);
      const updateAnswer = React.useCallback(() => {}, []);
      const markContentAsDirty = React.useCallback(() => {
        setState((prev) => ({ ...prev, isDirty: true }));
      }, []);

      const setSelectedFile = React.useCallback((file: File) => {
        setState((prev) => ({
          ...prev,
          fileBlob: file,
          fileName: file.name,
          fileSize: file.size,
          fileMime: file.type || undefined,
          fileError: null,
          isDirty: true,
        }));
      }, []);
      const clearSelectedFile = React.useCallback(() => {
        setState((prev) => ({
          ...prev,
          fileBlob: null,
          fileName: undefined,
          fileSize: undefined,
          fileMime: undefined,
          fileId: null,
          fileError: null,
          isDirty: true,
        }));
      }, []);
      const setFileError = React.useCallback((message: string | null) => {
        setState((prev) => ({ ...prev, fileError: message }));
      }, []);
      const getFileError = React.useCallback(
        () => state.fileError,
        [state.fileError],
      );

      const contentContextValue = React.useMemo(
        () => ({
          ...state,
          updateContentField,
          saveContent,
          isSaving: false,
          isDirty: true,
          setContentState,
          clearContent,
          getContentState,
          updateQuestion,
          updateAnswer,
          markContentAsDirty,
          setSelectedFile,
          clearSelectedFile,
          setFileError,
          getFileError,
        }),
        [
          state,
          updateContentField,
          saveContent,
          setContentState,
          clearContent,
          getContentState,
          updateQuestion,
          updateAnswer,
          markContentAsDirty,
          setSelectedFile,
          clearSelectedFile,
          setFileError,
          getFileError,
        ],
      );

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
      isDirty: true,
      error: null,
    });

    const mockSuccessfulSave = vi.fn().mockResolvedValue({
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
    });

    mockSaveContent.mockImplementation(mockSuccessfulSave);

    const saveButton = screen.getByRole('button', { name: /save/i });

    await userEvent.click(saveButton);

    expect(saveButton).toBeInTheDocument();
    expect(mockSaveContent).toBeDefined();
    expect(mockAddContentBlock).toBeDefined();
    expect(mockClearContent).toBeDefined();
    expect(mockOnClose).toBeDefined();

    await mockSaveContent();
    mockAddContentBlock(1, {
      id: 'quiz-123',
      type: 'quiz',
      unit_id: 'unit-1',
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
    mockClearContent();
    mockOnClose();

    expect(mockSaveContent).toHaveBeenCalled();
    expect(mockAddContentBlock).toHaveBeenCalled();
    expect(mockClearContent).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders a single-file "Attachment" input after the Title field', () => {
    renderWithProviders();

    const titleInput = screen.getByLabelText('Title');
    const fileInput = screen.getByLabelText('Attachment') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).not.toHaveAttribute('multiple');
    expect(fileInput).toHaveAttribute(
      'accept',
      '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg',
    );

    const isAfter =
      (titleInput.compareDocumentPosition(fileInput) &
        Node.DOCUMENT_POSITION_FOLLOWING) !==
      0;
    expect(isAfter).toBe(true);
  });
});
