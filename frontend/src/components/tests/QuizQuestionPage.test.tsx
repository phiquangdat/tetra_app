import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';
import QuizQuestionPage from '../user/quiz/QuizQuestionPage';
import { QuizProvider } from '../../context/QuizContext';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuizContext } from '../../context/QuizContext';

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

const renderWithRouter = (questions = mockQuestions) =>
  render(
    <MemoryRouter initialEntries={['/user/quiz/test-quiz-id/question/1']}>
      <QuizContext.Provider value={{ questions, setQuestions: vi.fn() }}>
        <Routes>
          <Route
            path="/user/quiz/:quizId/question/:index"
            element={<QuizQuestionPage />}
          />
        </Routes>
      </QuizContext.Provider>
    </MemoryRouter>,
  );

const renderAtIndex = (index = '1') =>
  render(
    <MemoryRouter
      initialEntries={[`/user/quiz/test-quiz-id/question/${index}`]}
    >
      <QuizContext.Provider
        value={{ questions: mockQuestions, setQuestions: vi.fn() }}
      >
        <Routes>
          <Route
            path="/user/quiz/:quizId/question/:index"
            element={<QuizQuestionPage />}
          />
        </Routes>
      </QuizContext.Provider>
    </MemoryRouter>,
  );

describe('QuizQuestionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question and answers', () => {
    renderWithRouter();

    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
    expect(screen.getByText('What is phishing?')).toBeInTheDocument();
    expect(screen.getByText('Fake login prompt')).toBeInTheDocument();
    expect(screen.getByText('Legit email')).toBeInTheDocument();
  });

  it('navigates to next question on "Next"', () => {
    renderWithRouter();

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/user/quiz/test-quiz-id/question/2',
    );
  });

  it('navigates back on "Previous"', () => {
    renderAtIndex('2'); // simulate being on question 2

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('shows loading when no current question is found', () => {
    render(
      <MemoryRouter initialEntries={['/user/quiz/test-quiz-id/question/3']}>
        <QuizProvider>
          <Routes>
            <Route
              path="/user/quiz/:quizId/question/:index"
              element={<QuizQuestionPage />}
            />
          </Routes>
        </QuizProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading question/i)).toBeInTheDocument();
  });
});
