import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddQuizModal from '../admin/createModule/AddQuizModal';
import { UnitContext } from '../../context/admin/UnitContext';
import { ContentBlockContext } from '../../context/admin/ContentBlockContext';

describe('AddQuizModal', () => {
  const mockOnClose = vi.fn();
  const mockAddContentBlock = vi.fn();
  const mockSaveContent = vi.fn(() => Promise.resolve());
  const mockClearContent = vi.fn();

  const contentState = {
    type: 'quiz',
    data: {
      title: '',
      content: '',
      points: 1,
      questions: [],
    },
    sortOrder: 0,
    unit_id: '',
    isDirty: true,
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
          removeContentBlockFromContext: vi.fn(),
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
            setContentState: (val) =>
              setLocalContentState((prev) => ({ ...prev, ...val })),
            saveContent: mockSaveContent,
            clearContent: mockClearContent,
            getContentState: () => localContentState,
            updateQuestion: vi.fn(),
            updateAnswer: vi.fn(),
            markContentAsDirty: vi.fn(),
          }}
        >
          {children}
        </ContentBlockContext.Provider>
      </UnitContext.Provider>
    );
  };

  it('allows user input the description', async () => {
    render(
      <Wrapper>
        <AddQuizModal
          isOpen={true}
          onClose={mockOnClose}
          unitId="unit-1"
          unitNumber={1}
        />
      </Wrapper>,
    );

    const descriptionInput = screen.getByLabelText(/quiz description/i);
    await userEvent.type(descriptionInput, 'This is a quiz description');
    expect(descriptionInput).toHaveValue('This is a quiz description');
  });
});
