import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Question } from '../../services/quiz/quizApi.ts';

export interface UserAnswer {
  questionId: string;
  answerIds: string[]; // multiple selections supported
}

interface QuizContextType {
  questions: Question[];
  setQuestions: (q: Question[]) => void;

  userAnswers: UserAnswer[];
  /**
   * Toggle or set an answer for a question.
   * If multiple=true => toggle presence of answerId in the set for that question.
   * If multiple=false => replace with [answerId].
   */
  setUserAnswer: (
    questionId: string,
    answerId: string,
    multiple?: boolean,
  ) => void;

  clearUserAnswers: () => void;

  /**
   * Returns the selected answer IDs for a question (possibly empty array).
   */
  getUserAnswerFor: (questionId: string) => string[] | undefined;
}

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined,
);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const setUserAnswer = (
    questionId: string,
    answerId: string,
    multiple = false,
  ) => {
    setUserAnswers((prev) => {
      const idx = prev.findIndex((ua) => ua.questionId === questionId);
      if (idx === -1) {
        return [
          ...prev,
          {
            questionId,
            answerIds: multiple ? [answerId] : [answerId],
          },
        ];
      }

      const copy = [...prev];
      const current = copy[idx];

      if (!multiple) {
        // single-select (true/false)
        copy[idx] = { questionId, answerIds: [answerId] };
        return copy;
      }

      // multiple-select (toggle)
      const set = new Set(current.answerIds);
      if (set.has(answerId)) set.delete(answerId);
      else set.add(answerId);
      copy[idx] = { questionId, answerIds: Array.from(set) };
      return copy;
    });
  };

  const clearUserAnswers = () => setUserAnswers([]);

  const getUserAnswerFor = (questionId: string) =>
    userAnswers.find((ua) => ua.questionId === questionId)?.answerIds;

  return (
    <QuizContext.Provider
      value={{
        questions,
        setQuestions,
        userAnswers,
        setUserAnswer,
        clearUserAnswers,
        getUserAnswerFor,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
