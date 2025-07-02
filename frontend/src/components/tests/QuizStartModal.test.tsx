import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { QuizModalProvider } from '../../context/user/QuizModalContext';
import { QuizProvider } from '../../context/user/QuizContext';
import QuizStartModal from '../user/quiz/QuizStartModal';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
} from '../../services/quiz/quizApi';
import { useQuizModal } from '../../context/user/QuizModalContext';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('../../services/quiz/quizApi', () => ({
  fetchQuizById: vi.fn(),
  fetchQuizQuestionsByQuizId: vi.fn(),
}));

vi.mock('../../context/user/QuizModalContext', async () => {
  const actual = await vi.importActual('../../context/user/QuizModalContext');
  return {
    ...actual,
    useQuizModal: vi.fn(),
  };
});

const MOCK_QUIZ_ID = 'mock-quiz-id';
const MOCK_QUIZ_DATA = {
  id: MOCK_QUIZ_ID,
  title: 'Test Quiz Title',
  content: 'This is the quiz content.',
  points: 10,
  questions_number: 5,
};

const MOCK_QUESTIONS = [
  {
    id: '1',
    title: 'Sample Question',
    type: 'single',
    sort_order: 1,
    answers: [{ id: 'a1', title: 'Option A', sort_order: 1 }],
  },
];

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('QuizStartModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupModalContext = (overrides = {}) => {
    (useQuizModal as vi.Mock).mockReturnValue({
      isOpen: true,
      quizId: MOCK_QUIZ_ID,
      closeModal: vi.fn(),
      ...overrides,
    });
  };

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <QuizModalProvider>
          <QuizProvider>
            <QuizStartModal />
          </QuizProvider>
        </QuizModalProvider>
      </BrowserRouter>,
    );

  it('fetches and displays quiz details when modal is open', async () => {
    setupModalContext();
    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ_DATA);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(MOCK_QUIZ_DATA.title)).toBeInTheDocument();
      expect(
        screen.getByText(`${MOCK_QUIZ_DATA.questions_number} questions`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${MOCK_QUIZ_DATA.points} points`),
      ).toBeInTheDocument();
      expect(screen.getByText(MOCK_QUIZ_DATA.content)).toBeInTheDocument();
    });
  });

  it('shows error message if quiz fetch fails', async () => {
    setupModalContext();
    (fetchQuizById as vi.Mock).mockRejectedValueOnce(new Error('Fetch error'));

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load quiz details/i),
      ).toBeInTheDocument();
    });
  });

  it('does not render anything when modal is closed', () => {
    setupModalContext({ isOpen: false });
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('navigates to quiz question page when "Let\'s go" is clicked', async () => {
    setupModalContext();
    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ_DATA);
    (fetchQuizQuestionsByQuizId as vi.Mock).mockResolvedValueOnce(
      MOCK_QUESTIONS,
    );

    renderComponent();

    // Wait for quiz to load
    await waitFor(() => screen.getByText(MOCK_QUIZ_DATA.title));

    const button = screen.getByRole('button', { name: /let's go/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/user/quiz/${MOCK_QUIZ_ID}/question/1`,
      );
    });
  });
});
