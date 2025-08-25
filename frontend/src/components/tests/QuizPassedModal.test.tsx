import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import QuizPassedModal from '../user/quiz/QuizPassedModal';
import { useQuizModal } from '../../context/user/QuizModalContext';
import { fetchQuizById } from '../../services/quiz/quizApi';
import { getContentProgress } from '../../services/userProgress/userProgressApi';
import { useModuleProgress } from '../../context/user/ModuleProgressContext';

// --- Mocks ---
vi.mock('../../context/user/QuizModalContext', async () => {
  const actual = await vi.importActual('../../context/user/QuizModalContext');
  return {
    ...actual,
    useQuizModal: vi.fn(),
  };
});

vi.mock('../../context/user/ModuleProgressContext', async () => {
  const actual = await vi.importActual(
    '../../context/user/ModuleProgressContext',
  );
  return {
    ...actual,
    useModuleProgress: vi.fn(),
  };
});

vi.mock('../../services/quiz/quizApi', () => ({
  fetchQuizById: vi.fn(),
}));

vi.mock('../../services/userProgress/userProgressApi', () => ({
  getContentProgress: vi.fn(),
}));

vi.mock('../../../utils/contextHydration', () => ({
  hydrateContextFromContent: vi.fn().mockResolvedValue({
    unitId: 'u1',
    moduleId: 'm1',
  }),
}));

const MOCK_QUIZ_ID = 'quiz-123';
const MOCK_QUIZ = {
  id: MOCK_QUIZ_ID,
  title: 'Already Completed Quiz',
  content: 'desc',
  points: 20,
  questions_number: 5,
};

const setupModal = (
  overrides: Partial<ReturnType<typeof useQuizModal>> = {},
) => {
  (useQuizModal as unknown as vi.Mock).mockReturnValue({
    isOpen: true,
    type: 'passed',
    quizId: MOCK_QUIZ_ID,
    closeModal: vi.fn(),
    ...overrides,
  });
};

const setupModuleProgress = (
  overrides: Partial<ReturnType<typeof useModuleProgress>> = {},
) => {
  (useModuleProgress as unknown as vi.Mock).mockReturnValue({
    unitId: 'u1',
    moduleId: 'm1',
    setUnitId: vi.fn(),
    setModuleId: vi.fn(),
    goToNextContent: vi.fn(),
    // allow tests to override any of the above
    ...overrides,
  });
};

const renderModal = () =>
  render(
    <BrowserRouter>
      <QuizPassedModal />
    </BrowserRouter>,
  );

describe('QuizPassedModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when modal is closed', () => {
    setupModal({ isOpen: false as any });
    setupModuleProgress();
    const { container } = renderModal();
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when modal type is not "passed"', () => {
    setupModal({ type: 'start' } as any);
    setupModuleProgress();
    const { container } = renderModal();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders quiz title and points chip when progress has points', async () => {
    setupModal();
    setupModuleProgress();
    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ);
    (getContentProgress as vi.Mock).mockResolvedValueOnce({
      id: 'cp-1',
      unitId: 'u1',
      unitContentId: MOCK_QUIZ_ID,
      status: 'COMPLETED',
      points: 15,
    });

    renderModal();

    // Title appears
    await waitFor(() => {
      expect(screen.getByText(MOCK_QUIZ.title)).toBeInTheDocument();
    });

    // Points chip appears
    expect(screen.getByText(/15 pts/i)).toBeInTheDocument();
    // Helper text
    expect(
      screen.getByText(/you’ve already completed this quiz/i),
    ).toBeInTheDocument();
  });

  it('renders without points chip when progress has no points (null/0)', async () => {
    setupModal();
    setupModuleProgress();
    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ);
    (getContentProgress as vi.Mock).mockResolvedValueOnce({
      id: 'cp-1',
      unitId: 'u1',
      unitContentId: MOCK_QUIZ_ID,
      status: 'COMPLETED',
      points: 0,
    });

    renderModal();

    await waitFor(() => {
      expect(screen.getByText(MOCK_QUIZ.title)).toBeInTheDocument();
    });

    // No points chip
    expect(screen.queryByText(/pts/i)).not.toBeInTheDocument();
  });

  it('handles 404 content progress gracefully and still renders', async () => {
    setupModal();
    setupModuleProgress();
    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ);
    (getContentProgress as vi.Mock).mockRejectedValueOnce(
      new Error('404 Not Found'),
    );

    renderModal();

    await waitFor(() => {
      expect(screen.getByText(MOCK_QUIZ.title)).toBeInTheDocument();
    });

    // No points shown
    expect(screen.queryByText(/pts/i)).not.toBeInTheDocument();
  });

  it('Back button closes modal', async () => {
    const closeModal = vi.fn();
    setupModal({ closeModal });
    const goToNextContent = vi.fn();
    setupModuleProgress({ goToNextContent });

    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ);
    (getContentProgress as vi.Mock).mockResolvedValueOnce({
      id: 'cp-1',
      unitId: 'u1',
      unitContentId: MOCK_QUIZ_ID,
      status: 'COMPLETED',
      points: 10,
    });

    renderModal();

    await waitFor(() => screen.getByText(MOCK_QUIZ.title));

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(goToNextContent).not.toHaveBeenCalled();
  });

  it('Go to Next block closes modal and calls goToNextContent', async () => {
    const closeModal = vi.fn();
    const goToNextContent = vi.fn();
    setupModal({ closeModal });
    setupModuleProgress({ goToNextContent });

    (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ);
    (getContentProgress as vi.Mock).mockResolvedValueOnce({
      id: 'cp-1',
      unitId: 'u1',
      unitContentId: MOCK_QUIZ_ID,
      status: 'COMPLETED',
      points: 10,
    });

    renderModal();

    await waitFor(() => screen.getByText(MOCK_QUIZ.title));

    fireEvent.click(screen.getByRole('button', { name: /go to next block/i }));
    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(goToNextContent).toHaveBeenCalledWith(MOCK_QUIZ_ID);
  });
});
