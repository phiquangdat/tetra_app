import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddArticleModal from '../admin/createModule/AddArticleModal';
import {
  ContentBlockContext,
  ContentBlockContextProvider,
} from '../../context/admin/ContentBlockContext'; // ✅ CORRECT
import {
  UnitContext,
  UnitContextProvider,
} from '../../context/admin/UnitContext';

const AddArticleModalWithProviders = (props: any) => (
  <UnitContextProvider>
    <ContentBlockContextProvider>
      <AddArticleModal {...props} />
    </ContentBlockContextProvider>
  </UnitContextProvider>
);

describe('AddArticleModal', () => {
  const onClose = vi.fn();
  const onAddContent = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
    onAddContent.mockReset();
  });

  it('renders the modal header correctly', () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Article',
    );
  });

  it('allows user to input text into the title field', async () => {
    render(
      <AddArticleModalWithProviders
        isOpen={true}
        onClose={onClose}
        onAddContent={onAddContent}
        unitId="unit-1"
      />,
    );

    const input = screen.getByLabelText('Title');
    await userEvent.type(input, 'Test Article Title');
    expect(input).toHaveValue('Test Article Title');
  });

  it('saves article and adds content block with valid input', async () => {
    const mockAddContentBlock = vi.fn();
    const mockRemoveContentBlock = vi.fn();
    const mockSetContentState = vi.fn();
    const mockUpdateContentField = vi.fn();
    const mockSaveContent = vi.fn(() => Promise.resolve());
    const mockClearContent = vi.fn();
    const mockOnClose = vi.fn();

    let contentState = {
      type: 'article',
      data: {
        title: '',
        content: '',
      },
      sortOrder: 0,
      unit_id: '',
      isDirty: false,
      isSaving: false,
      error: null,
    };

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      const [localContentState, setLocalContentState] =
        React.useState(contentState);

      return (
        <UnitContext.Provider
          value={{
            addContentBlock: mockAddContentBlock,
            removeContentBlock: mockRemoveContentBlock,
            unitStates: {},
            updateUnitField: vi.fn(),
            markUnitAsDirty: vi.fn(),
            setUnitState: vi.fn(),
            getUnitState: vi.fn(),
            getNextUnitNumber: vi.fn(),
            saveUnit: vi.fn(),
            removeUnit: vi.fn(),
          }}
        >
          <ContentBlockContext.Provider
            value={{
              ...localContentState,
              updateContentField: (key, value) => {
                if (key === 'data') {
                  setLocalContentState((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      ...value,
                    },
                  }));
                }
              },
              saveContent: mockSaveContent,
              isSaving: false,
              isDirty: true,
              setContentState: (val) =>
                setLocalContentState((prev) => ({ ...prev, ...val })),
              clearContent: mockClearContent,
              getContentState: () => localContentState,
              updateQuestion: vi.fn(),
              updateAnswer: vi.fn(),
            }}
          >
            {children}
          </ContentBlockContext.Provider>
        </UnitContext.Provider>
      );
    };

    render(
      <Wrapper>
        <AddArticleModal
          isOpen={true}
          onClose={mockOnClose}
          unitId="unit-1"
          unitNumber={1}
        />
      </Wrapper>,
    );

    await userEvent.type(screen.getByLabelText('Title'), 'Article Title');
    await userEvent.type(
      screen.getByPlaceholderText('Start writing your article...'),
      'This is a test description.',
    );

    const saveButton = screen.getByRole('button', { name: /save article/i });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveContent).toHaveBeenCalledWith('article');
      expect(mockAddContentBlock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          type: 'article',
          unit_id: 'unit-1',
          data: expect.objectContaining({
            title: 'Article Title',
            content: 'This is a test description.',
          }),
        }),
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
