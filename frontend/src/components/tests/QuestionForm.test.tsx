import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import QuestionForm from '../admin/createModule/QuestionForm';

vi.mock('./QuestionOption', () => ({
  default: ({ answerLabel }: { answerLabel: string }) => (
    <div data-testid={`option-${answerLabel}`}>Option {answerLabel}</div>
  ),
}));

const renderQuestionForm = (props: any) => {
  return render(
    <QuestionForm
      questionNumber={props.questionNumber}
      questionType={props.questionType}
      onClose={props.onClose}
    />,
  );
};

describe('QuestionForm', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  it('shows add button for multiple type', () => {
    renderQuestionForm({
      questionNumber: 1,
      questionType: 'multiple',
      onClose: onClose,
    });

    expect(screen.getByText('Add Option')).toBeInTheDocument();
  });

  it('renders question number and textarea', () => {
    renderQuestionForm({
      questionNumber: 1,
      questionType: 'multiple',
      onClose: onClose,
    });

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // quiz title textarea
  });

  it('shows 2 options for true/false type', () => {
    renderQuestionForm({
      questionNumber: 1,
      questionType: 'true/false',
      onClose: onClose,
    });

    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('B.')).toBeInTheDocument();
  });

  it('adds option when add button is clicked', async () => {
    const user = userEvent.setup();

    renderQuestionForm({
      questionNumber: 1,
      questionType: 'multiple',
      onClose: onClose,
    });

    await user.click(screen.getByText('Add Option'));

    expect(screen.getByText('A.')).toBeInTheDocument();
  });

  it('updates textarea value', async () => {
    const user = userEvent.setup();
    renderQuestionForm({
      questionNumber: 1,
      questionType: 'multiple',
      onClose: onClose,
    });

    const textareas = screen.getAllByRole('textbox');
    await user.type(textareas[0], 'Test question');

    expect(textareas[0]).toHaveValue('Test question');
  });
});
