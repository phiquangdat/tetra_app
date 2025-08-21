import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import QuestionOption from '../admin/createModule/QuestionOption';

type Answer = { title: string; is_correct: boolean; sort_order: number };
type Question = {
  title?: string;
  type?: 'true/false' | 'multiple';
  answers: Answer[];
};

let mockQuestions: Question[] = [
  {
    answers: [{ title: 'Initial Answer', is_correct: false, sort_order: 0 }],
    type: 'multiple',
  },
];

const updateAnswer = vi.fn();
const updateQuestion = vi.fn();

vi.mock('../../context/admin/ContentBlockContext', () => ({
  useContentBlockContext: () => ({
    data: { questions: mockQuestions },
    updateAnswer,
    updateQuestion,
  }),
}));

describe('QuestionOption', () => {
  beforeEach(() => {
    updateAnswer.mockReset();
    updateQuestion.mockReset();
    mockQuestions = [
      {
        answers: [
          { title: 'Initial Answer', is_correct: false, sort_order: 0 },
        ],
        type: 'multiple',
      },
    ];
  });

  it('renders label A for answerIndex 0', () => {
    render(<QuestionOption questionIndex={0} answerIndex={0} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('updates answer text when user types', async () => {
    const user = userEvent.setup();
    render(<QuestionOption questionIndex={0} answerIndex={0} />);

    const input = screen.getByPlaceholderText(
      'Answer text',
    ) as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Updated Answer');

    expect(input).toHaveValue('Updated Answer');
  });

  it('applies correct styling when marked correct', async () => {
    const user = userEvent.setup();
    render(<QuestionOption questionIndex={0} answerIndex={0} />);

    const correctBtn = screen.getByTitle('Mark as Correct');
    await user.click(correctBtn);

    expect(correctBtn).toHaveClass('bg-success');
  });

  it('applies incorrect styling when marked incorrect', async () => {
    const user = userEvent.setup();
    render(<QuestionOption questionIndex={0} answerIndex={0} />);

    const incorrectBtn = screen.getByTitle('Mark as Incorrect');
    await user.click(incorrectBtn);

    expect(incorrectBtn).toHaveClass('bg-error');
  });

  it('has proper input styling', () => {
    render(<QuestionOption questionIndex={0} answerIndex={0} />);
    const input = screen.getByPlaceholderText('Answer text');
    expect(input).toHaveClass(
      'flex-1',
      'h-12',
      'px-4',
      'placeholder:text-surface/50',
    );
  });

  it('renders all three buttons (reorder, correct, incorrect)', () => {
    render(<QuestionOption questionIndex={0} answerIndex={0} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('when question is true/false and marking correct, it toggles only that answer to correct', async () => {
    mockQuestions = [
      {
        type: 'true/false',
        answers: [
          { title: 'True', is_correct: false, sort_order: 0 },
          { title: 'False', is_correct: false, sort_order: 1 },
        ],
      },
    ];

    const user = userEvent.setup();
    render(<QuestionOption questionIndex={0} answerIndex={1} />);

    const correctBtn = screen.getByTitle('Mark as Correct');
    await user.click(correctBtn);

    expect(updateQuestion).toHaveBeenCalledTimes(1);
    const [, updated] = updateQuestion.mock.calls[0];
    expect(updated.answers).toEqual([
      { title: 'True', is_correct: false, sort_order: 0 },
      { title: 'False', is_correct: true, sort_order: 1 },
    ]);
  });
});
