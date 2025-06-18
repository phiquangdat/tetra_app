import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { QuizModalProvider } from '../../context/QuizModalContext';
import QuizStartModal from '../QuizStartModal';
import { fetchQuizById } from '../../services/quiz/quizApi';
import { useQuizModal } from '../../context/QuizModalContext';

// Mock the quiz API
vi.mock('../../services/quiz/quizApi', () => ({
    fetchQuizById: vi.fn(),
}));

// Mock the modal context
vi.mock('../../context/QuizModalContext', async () => {
    const actual = await vi.importActual('../../context/QuizModalContext');
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

    it('should fetch and display quiz details when modal is open', async () => {
        setupModalContext();
        (fetchQuizById as vi.Mock).mockResolvedValueOnce(MOCK_QUIZ_DATA);

        render(
            <QuizModalProvider>
                <QuizStartModal />
            </QuizModalProvider>
        );

        expect(screen.getByText(/loading title/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(MOCK_QUIZ_DATA.title)).toBeInTheDocument();
            expect(
                screen.getByText(`${MOCK_QUIZ_DATA.questions_number} questions`)
            ).toBeInTheDocument();
            expect(
                screen.getByText(`${MOCK_QUIZ_DATA.points} points`)
            ).toBeInTheDocument();
            expect(screen.getByText(MOCK_QUIZ_DATA.content)).toBeInTheDocument();
        });
    });

    it('should show error message if fetch fails', async () => {
        setupModalContext();
        (fetchQuizById as vi.Mock).mockRejectedValueOnce(new Error('Fetch error'));

        render(
            <QuizModalProvider>
                <QuizStartModal />
            </QuizModalProvider>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/failed to load quiz details/i)
            ).toBeInTheDocument();
        });
    });

    it('should not render anything if modal is closed', () => {
        setupModalContext({ isOpen: false });

        const { container } = render(
            <QuizModalProvider>
                <QuizStartModal />
            </QuizModalProvider>
        );

        expect(container).toBeEmptyDOMElement();
    });
});
