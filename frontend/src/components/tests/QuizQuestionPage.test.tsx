import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';
import QuizQuestionPage from '../user/quiz/QuizQuestionPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuizContext } from '../../context/user/QuizContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockQuestions = [
  {
    id: 'q1',
    title: 'What is phishing?',
    type: 'single',
    sort_order: 1,
    answers: [
      { id: 'a1', title: 'Fake login prompt', sort_order: 1 },
      { id: 'a2', title: 'Legit email', sort_order: 2 },
    ],
  },
  {
    id: 'q2',
    title: 'What is malware?',
    type: 'single',
    sort_order: 2,
    answers: [{ id: 'a3', title: 'Malicious software', sort_order: 1 }],
  },
];

function renderAtIndex(
  index = '1',
  ctxOverrides: Partial<React.ContextType<typeof QuizContext>> = {},
) {
  const defaultCtx = {
    questions: mockQuestions,
    setQuestions: vi.fn(),
    userAnswers: [] as Array<{ questionId: string; answerId: string }>,
    setUserAnswer: vi.fn(),
    getUserAnswerFor: vi.fn(() => undefined),
    clearUserAnswers: vi.fn(),
  };

  const ctxValue = { ...defaultCtx, ...ctxOverrides };

  return render(
    <MemoryRouter
      initialEntries={[`/user/quiz/test-quiz-id/question/${index}`]}
    >
      <QuizContext.Provider value={ctxValue as any}>
        <Routes>
          <Route
            path="/user/quiz/:quizId/question/:index"
            element={<QuizQuestionPage />}
          />
        </Routes>
      </QuizContext.Provider>
    </MemoryRouter>,
  );
}

describe('QuizQuestionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question and answers', () => {
    renderAtIndex('1');

    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
    expect(screen.getByText('What is phishing?')).toBeInTheDocument();
    expect(screen.getByText('Fake login prompt')).toBeInTheDocument();
    expect(screen.getByText('Legit email')).toBeInTheDocument();
  });

  it('navigates to next question on "Next"', () => {
    const setUserAnswer = vi.fn();

    renderAtIndex('1', { setUserAnswer });

    // Simulate selecting the first answer
    const firstRadio = screen.getByLabelText('Fake login prompt');
    fireEvent.click(firstRadio);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    // Should navigate to question 2
    expect(mockNavigate).toHaveBeenCalledWith(
      '/user/quiz/test-quiz-id/question/2',
    );

    // Should record answer
    expect(setUserAnswer).toHaveBeenCalledWith('q1', 'a1');
  });

  it('navigates back on "Previous"', () => {
    renderAtIndex('2'); // simulate being on question 2

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('shows loading when no current question is found', () => {
    renderAtIndex('3'); // there are only 2 questions

    expect(screen.getByText(/loading question/i)).toBeInTheDocument();
  });

  it('preselects saved answer when returning to a previous question', () => {
    // Simulate having saved answer a2 for q1
    const getUserAnswerFor = vi.fn((qId: string) =>
      qId === 'q1' ? 'a2' : undefined,
    );

    renderAtIndex('1', { getUserAnswerFor });

    const radio = screen.getByLabelText('Legit email') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });
});
