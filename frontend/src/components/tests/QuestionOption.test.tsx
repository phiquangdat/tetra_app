import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import QuestionOption from '../admin/createModule/QuestionOption';
import { ContentBlockContextProvider } from '../../context/admin/ContentBlockContext';
import { UnitContextProvider } from '../../context/admin/UnitContext';

// Mock initial state with one question and one answer
const initialContextValue = {
  data: {
    questions: [
      {
        answers: [
          {
            title: 'Initial Answer',
            is_correct: false,
            sort_order: 0,
          },
        ],
      },
    ],
  },
};

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <UnitContextProvider>
      <ContentBlockContextProvider initialData={initialContextValue}>
        {ui}
      </ContentBlockContextProvider>
    </UnitContextProvider>,
  );
};

describe('QuestionOption', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders label A. for answerIndex 0', () => {
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);
    expect(screen.getByText('A.')).toBeInTheDocument();
  });

  it('updates answer text when user types', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);

    const input = screen.getByPlaceholderText('Answer text');
    await user.clear(input);
    await user.type(input, 'Updated Answer');

    expect(input).toHaveValue('Updated Answer');
  });

  it('applies correct styling when marked correct', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);

    const correctBtn = screen.getByTitle('Mark as Correct');
    await user.click(correctBtn);

    expect(correctBtn).toHaveClass('bg-green-100');
  });

  it('applies incorrect styling when marked incorrect', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);

    const incorrectBtn = screen.getByTitle('Mark as Incorrect');
    await user.click(incorrectBtn);

    expect(incorrectBtn).toHaveClass('bg-red-100');
  });

  it('has proper input styling', () => {
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);
    const input = screen.getByPlaceholderText('Answer text');
    expect(input).toHaveClass('w-full', 'h-8', 'bg-white', 'p-1');
  });

  it('renders all three buttons (reorder, correct, incorrect)', () => {
    renderWithProviders(<QuestionOption questionIndex={0} answerIndex={0} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3); // Allow for more if icons are wrapped
  });
});
