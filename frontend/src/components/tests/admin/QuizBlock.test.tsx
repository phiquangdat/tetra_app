import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizBlock from '../../../components/admin/module/QuizBlock';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
} from '../../../services/quiz/quizApi';
import { describe, it, vi, beforeEach } from 'vitest';
import { UnitContextProvider } from '../../../context/admin/UnitContext';

vi.mock('../../../services/quiz/quizApi', () => ({
  fetchQuizById: vi.fn(),
  fetchQuizQuestionsByQuizId: vi.fn(),
}));

describe('QuizBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays quiz data with questions and answers', async () => {
    (fetchQuizById as any).mockResolvedValueOnce({
      id: 'quiz1',
      title: 'Sample Quiz',
      content: 'Some description',
      points: 10,
    });

    (fetchQuizQuestionsByQuizId as any).mockResolvedValueOnce([
      {
        id: 'q1',
        title: 'What is 2 + 2?',
        sort_order: 1,
        answers: [
          { id: 'a1', title: '3', is_correct: false, sort_order: 0 },
          { id: 'a2', title: '4', is_correct: true, sort_order: 1 },
        ],
      },
      {
        id: 'q2',
        title: 'Capital of France?',
        sort_order: 2,
        answers: [
          { id: 'a3', title: 'Paris', is_correct: true, sort_order: 0 },
          { id: 'a4', title: 'London', is_correct: false, sort_order: 1 },
        ],
      },
    ]);

    render(
      <UnitContextProvider>
        <QuizBlock id="quiz1" />
      </UnitContextProvider>,
    );

    await waitFor(() => {
      // static labels
      expect(screen.getByText('Quiz title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Questions')).toBeInTheDocument();

      // fetched values
      expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
      expect(screen.getByText('Some description')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();

      // questions and answers
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      // at least one "Correct" badge
      expect(screen.getAllByText('Correct').length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText('Capital of France?')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    (fetchQuizById as any).mockRejectedValueOnce(new Error('oops'));
    (fetchQuizQuestionsByQuizId as any).mockResolvedValueOnce([]);

    render(
      <UnitContextProvider>
        <QuizBlock id="quiz1" />
      </UnitContextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load quiz')).toBeInTheDocument();
    });
  });
});
