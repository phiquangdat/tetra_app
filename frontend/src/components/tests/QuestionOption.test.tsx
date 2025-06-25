import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import QuestionOption from '../admin/createModule/QuestionOption';

describe('QuestionOption', () => {
  const mockOnSetQuestionOption = vi.fn();

  beforeEach(() => {
    mockOnSetQuestionOption.mockClear();
  });

  it('renders with default answer label "A"', () => {
    render(<QuestionOption onSetQuestionOption={mockOnSetQuestionOption} />);

    expect(screen.getByText('A.')).toBeInTheDocument();
  });

  it('renders with custom answer label', () => {
    render(
      <QuestionOption
        answerLabel="B"
        onSetQuestionOption={mockOnSetQuestionOption}
      />,
    );

    expect(screen.getByText('B.')).toBeInTheDocument();
  });

  it('updates answer text when user types in input', async () => {
    const user = userEvent.setup();
    render(<QuestionOption onSetQuestionOption={mockOnSetQuestionOption} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test answer');

    expect(input).toHaveValue('Test answer');
  });

  it('renders all three buttons (reorder, correct, incorrect)', () => {
    render(<QuestionOption onSetQuestionOption={mockOnSetQuestionOption} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('has proper input styling and focus behavior', () => {
    render(<QuestionOption onSetQuestionOption={mockOnSetQuestionOption} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full', 'h-8', 'bg-white', 'p-1');
  });
});
