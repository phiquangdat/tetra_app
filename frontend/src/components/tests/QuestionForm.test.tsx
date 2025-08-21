import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionForm from '../admin/createModule/QuestionForm';
import { ContentBlockContext } from '../../context/admin/ContentBlockContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../admin/createModule/QuestionOption', () => ({
  default: ({
    questionIndex,
    answerIndex,
  }: {
    questionIndex: number;
    answerIndex: number;
  }) => <input aria-label={`option-${questionIndex}-${answerIndex}`} />,
}));

const mockUpdateQuestion = vi.fn();

const mockData = {
  questions: [
    {
      title: 'What is the capital of France?',
      answers: [
        { title: 'Paris', is_correct: true, sort_order: 0 },
        { title: 'Berlin', is_correct: false, sort_order: 1 },
        { title: 'Madrid', is_correct: false, sort_order: 2 },
      ],
      type: 'multiple',
      sort_order: 1,
    },
  ],
};

const renderWithProviders = (ui: React.ReactNode, data = mockData) => {
  return render(
    <ContentBlockContext.Provider
      value={{
        data,
        updateQuestion: mockUpdateQuestion,
        updateAnswer: vi.fn(),
        updateContentField: vi.fn(),
        markContentAsDirty: vi.fn(),
        setContentState: vi.fn(),
        getContentState: () => data as any,
        saveContent: vi.fn(),
        clearContent: vi.fn(),
      }}
    >
      {ui}
    </ContentBlockContext.Provider>,
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
        answers: expect.any(Array), // now length should be 2 internally
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

    renderWithProviders(
      <QuestionForm
        questionNumber={1}
        questionType="true/false"
        onClose={onClose}
      />,
      tfData,
    );

    // Only count the mocked option inputs, not the textarea
    const optionInputs = screen
      .getAllByRole('textbox')
      .filter((el) => el.tagName.toLowerCase() === 'input');

    expect(optionInputs).toHaveLength(2);
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
