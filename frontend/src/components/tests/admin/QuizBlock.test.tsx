import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, vi, beforeEach } from 'vitest';

import QuizBlock from '../../../components/admin/module/QuizBlock';
import {
  fetchQuizById,
  fetchQuizQuestionsByQuizId,
} from '../../../services/quiz/quizApi';
import { UnitContextProvider } from '../../../context/admin/UnitContext';

vi.mock('../../../services/quiz/quizApi', () => ({
  fetchQuizById: vi.fn(),
  fetchQuizQuestionsByQuizId: vi.fn(),
}));

vi.mock('../../../context/admin/ModuleContext.tsx', () => ({
  useModuleContext: () => ({
    id: undefined,
    updateModuleField: vi.fn(),
    setModuleState: vi.fn(),
    isEditing: false,
    setIsEditing: vi.fn(),
    isDirty: false,
  }),
  ModuleContextProvider: ({ children }: any) => children,
}));

describe('QuizBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays quiz data with questions and answers', async () => {
    (fetchQuizById as unknown as vi.Mock).mockResolvedValueOnce({
      id: 'quiz1',
      title: 'Sample Quiz',
      content: 'Some description',
      points: 10,
    });

    (fetchQuizQuestionsByQuizId as unknown as vi.Mock).mockResolvedValueOnce([
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

    // static labels
    expect(await screen.findByText('Quiz title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();

    // quiz metadata
    expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
    expect(screen.getByText('Some description')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    // questions and answers
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getAllByText('Correct').length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Capital of France?')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    (fetchQuizById as unknown as vi.Mock).mockRejectedValueOnce(
      new Error('oops'),
    );
    (fetchQuizQuestionsByQuizId as unknown as vi.Mock).mockResolvedValueOnce(
      [],
    );

    render(
      <UnitContextProvider>
        <QuizBlock id="quiz1" />
      </UnitContextProvider>,
    );

    expect(await screen.findByText('Failed to load quiz')).toBeInTheDocument();
  });
});
