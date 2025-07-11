import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionForm from '../admin/createModule/QuestionForm';
import { ContentBlockContext } from '../../context/admin/ContentBlockContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';
import React from 'react';

const mockUpdateQuestion = vi.fn();

const mockData = {
  questions: [
    {
      title: 'What is the capital of France?',
      answers: [
        { title: 'Paris', is_correct: true, sort_order: 0 },
        { title: 'Berlin', is_correct: false, sort_order: 1 },
      ],
      type: 'multiple',
      sort_order: 1,
    },
  ],
};

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <UnitContextProvider>
      <ContentBlockContext.Provider
        value={{
          data: mockData,
          updateQuestion: mockUpdateQuestion,
          updateAnswer: vi.fn(),
          updateContentField: vi.fn(),
          markContentAsDirty: vi.fn(),
          setContentState: vi.fn(),
          getContentState: () => mockData as any,
          saveContent: vi.fn(),
          clearContent: vi.fn(),
        }}
      >
        {ui}
      </ContentBlockContext.Provider>
    </UnitContextProvider>,
  );
};

describe('QuestionForm', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    mockUpdateQuestion.mockClear();
    onClose.mockClear();
  });

  it('renders the question title', () => {
    renderWithProviders(
      <QuestionForm
        questionNumber={1}
        questionType="multiple"
        onClose={onClose}
      />,
    );
    const textarea = screen.getByLabelText(/question title/i);
    expect(textarea).toHaveValue('What is the capital of France?');
  });

  it('adds a new answer option when "Add Option" is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QuestionForm
        questionNumber={1}
        questionType="multiple"
        onClose={onClose}
      />,
    );
    const addBtn = screen.getByRole('button', { name: /add option/i });

    await user.click(addBtn);

    expect(mockUpdateQuestion).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        answers: expect.arrayContaining([
          expect.objectContaining({ title: '', is_correct: false }),
        ]),
      }),
    );
  });

  it('removes an answer option when "Remove Option" is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QuestionForm
        questionNumber={1}
        questionType="multiple"
        onClose={onClose}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove option/i });

    await user.click(removeBtn);

    expect(mockUpdateQuestion).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        answers: expect.any(Array),
      }),
    );
  });

  it('renders true/false question with two options', () => {
    const tfData = {
      questions: [
        {
          title: 'Is the sky blue?',
          answers: [
            { title: 'True', is_correct: false, sort_order: 0 },
            { title: 'False', is_correct: false, sort_order: 1 },
          ],
          type: 'true/false',
        },
      ],
    };

    render(
      <UnitContextProvider>
        <ContentBlockContext.Provider
          value={{
            data: tfData,
            updateQuestion: mockUpdateQuestion,
            updateAnswer: vi.fn(),
            updateContentField: vi.fn(),
            markContentAsDirty: vi.fn(),
            setContentState: vi.fn(),
            getContentState: () => tfData as any,
            saveContent: vi.fn(),
            clearContent: vi.fn(),
          }}
        >
          <QuestionForm
            questionNumber={1}
            questionType="true/false"
            onClose={onClose}
          />
        </ContentBlockContext.Provider>
      </UnitContextProvider>,
    );

    const inputs = screen
      .getAllByRole('textbox')
      .filter((el) => el.tagName === 'INPUT');
    expect(inputs.length).toBe(2);
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QuestionForm
        questionNumber={1}
        questionType="multiple"
        onClose={onClose}
      />,
    );
    const closeBtn = screen.getByRole('button', { name: /close/i });

    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
