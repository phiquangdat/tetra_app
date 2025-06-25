import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import QuestionForm from '../admin/createModule/QuestionForm';

vi.mock('./QuestionOption', () => ({
  default: ({ answerLabel }: { answerLabel: string }) => (
    <div data-testid={`option-${answerLabel}`}>Option {answerLabel}</div>
  ),
}));

describe('QuestionForm', () => {
  it('shows add button for multipleChoice type', () => {
    render(
      <QuestionForm
        questionNumber={1}
        questionType="multipleChoice"
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );

    expect(screen.getByText('Add Option')).toBeInTheDocument();
  });

  it('renders question number and textarea', () => {
    render(
      <QuestionForm
        questionNumber={1}
        questionType="trueFalse"
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('shows 2 options for trueFalse type', () => {
    render(
      <QuestionForm
        questionNumber={1}
        questionType="trueFalse"
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );

    expect(screen.getByText('A.')).toBeInTheDocument();
    expect(screen.getByText('B.')).toBeInTheDocument();
  });

  it('adds option when add button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <QuestionForm
        questionNumber={1}
        questionType="multipleChoice"
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );

    await user.click(screen.getByText('Add Option'));

    expect(screen.getByText('A.')).toBeInTheDocument();
  });

  it('updates textarea value', async () => {
    const user = userEvent.setup();
    render(
      <QuestionForm
        questionNumber={1}
        questionType="trueFalse"
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );

    const textareas = screen.getAllByRole('textbox');
    await user.type(textareas[0], 'Test question');

    expect(textareas[0]).toHaveValue('Test question');
  });
});
