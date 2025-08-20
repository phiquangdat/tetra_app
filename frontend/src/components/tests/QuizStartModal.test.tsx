// src/components/tests/QuizStartModal.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';

// ---- Hoisted spies so mock factories can reference them ----
const { patchSpy, setModuleProgressSpy } = vi.hoisted(() => ({
  patchSpy: vi.fn(),
  setModuleProgressSpy: vi.fn(),
}));

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

// Module progress context: provide moduleProgress with an id
vi.mock('../../context/user/ModuleProgressContext', () => ({
  useModuleProgress: () => ({
    moduleProgress: { id: 'ump-1', status: 'in_progress', earned_points: 0 },
    setModuleProgress: setModuleProgressSpy,
  }),
}));

// Unit content context
vi.mock('../../context/user/UnitContentContext', () => ({
  useUnitContent: () => ({
    unitId: 'unit-123',
    contentList: [],
    setUnitContent: vi.fn(),
  }),
}));

// Mock BOTH paths to the same spy
vi.mock('../../services/userProgress/userProgressApi', () => ({
  patchModuleProgress: (...args: any[]) => patchSpy(...args),
}));
vi.mock('../../services/userProgress/userProgressApi.tsx', () => ({
  patchModuleProgress: (...args: any[]) => patchSpy(...args),
}));

// Router navigate mock
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: actual.BrowserRouter,
  };
});

import QuizStartModal from '../user/quiz/QuizStartModal';
import { QuizProvider } from '../../context/user/QuizContext';
import { useQuizModal } from '../../context/user/QuizModalContext';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
} from '../../services/quiz/quizApi';
import { BrowserRouter } from 'react-router-dom';

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
    id: 'q1',
    title: 'Sample Question',
    type: 'single',
    sort_order: 1,
    answers: [{ id: 'a1', title: 'Option A', sort_order: 1 }],
  },
];

const setupModalContext = (
  overrides: Partial<ReturnType<typeof useQuizModal>> = {},
) => {
  (useQuizModal as unknown as vi.Mock).mockReturnValue({
    isOpen: true,
    type: 'start',
    quizId: MOCK_QUIZ_ID,
    closeModal: vi.fn(),
    ...overrides,
  });
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <QuizProvider>
        <QuizStartModal />
      </QuizProvider>
    </BrowserRouter>,
  );

describe('QuizStartModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and displays quiz details when modal is open and type=start', async () => {
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
    setupModalContext({ isOpen: false } as any);
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when modal type is "passed"', () => {
    setupModalContext({ type: 'passed' } as any);
    const { container } = renderComponent();
    expect(container).toBeEmptyDOMElement();
  });
});
