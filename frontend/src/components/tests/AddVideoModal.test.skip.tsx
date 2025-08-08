import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddVideoModal from '../admin/createModule/AddVideoModal';
import { ContentBlockContext } from '../../context/admin/ContentBlockContext';
import { UnitContext } from '../../context/admin/UnitContext';
import React from 'react';
import { vi } from 'vitest';

const mockAddContentBlock = vi.fn();
const mockRemoveContentBlock = vi.fn();

const mockSetContentState = vi.fn();
const mockUpdateContentField = vi.fn();
const mockSaveContent = vi.fn(() => Promise.resolve());
const mockClearContent = vi.fn();
const mockOnClose = vi.fn();

let contentState = {
  type: 'video',
  data: {
    title: '',
    content: '',
    url: '',
    points: 0,
    questions: [],
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
        removeContentBlockFromContext: mockRemoveContentBlock,
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
          setContentState: (newState) =>
            setLocalContentState((prev) => ({ ...prev, ...newState })),
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

const renderWithContexts = () => {
  render(
    <Wrapper>
      <AddVideoModal
        isOpen={true}
        onClose={mockOnClose}
        unitId="test-unit-id"
        unitNumber={1}
      />
    </Wrapper>,
  );
};

describe('AddVideoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contentState.data = {
      title: '',
      content: '',
      url: '',
      points: 0,
      questions: [],
    };
  });

  it('renders and saves valid video content', async () => {
    renderWithContexts();

    // Simulate filling out the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Video Title' },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter video description/i), {
      target: { value: 'This is a test video description.' },
    });

    fireEvent.change(
      screen.getByPlaceholderText(
        /https:\/\/example\.com\/video\.mp4 or YouTube URL/i,
      ),
      { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } },
    );

    // Manually update mocked content state to match expected valid state
    contentState.data = {
      title: 'Test Video Title',
      content: 'This is a test video description.',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      points: 0,
      questions: [],
    };

    // Wait for Save button to become enabled
    const saveButton = await screen.findByRole('button', {
      name: /save video/i,
    });

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveContent).toHaveBeenCalledWith('video');
      expect(mockAddContentBlock).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          type: 'video',
          unit_id: 'test-unit-id',
          data: expect.objectContaining({
            title: 'Test Video Title',
            content: 'This is a test video description.',
            url: 'https://youtu.be/dQw4w9WgXcQ',
          }),
        }),
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
