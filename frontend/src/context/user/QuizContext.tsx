import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Question } from '../../services/quiz/quizApi.ts';

export interface UserAnswer {
  questionId: string;
  answerId: string;
}

interface QuizContextType {
  questions: Question[];
  setQuestions: (q: Question[]) => void;
  userAnswers: UserAnswer[];
  setUserAnswer: (questionId: string, answerId: string) => void;
  clearUserAnswers: () => void;
  getUserAnswerFor: (questionId: string) => string | undefined;
}

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined,
);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const setUserAnswer = (questionId: string, answerId: string) => {
    setUserAnswers((prev) => {
      const idx = prev.findIndex((ua) => ua.questionId === questionId);
      if (idx === -1) return [...prev, { questionId, answerId }];
      const copy = [...prev];
      copy[idx] = { questionId, answerId };
      return copy;
    });
  };

  const clearUserAnswers = () => setUserAnswers([]);

  const getUserAnswerFor = (questionId: string) =>
    userAnswers.find((ua) => ua.questionId === questionId)?.answerId;

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
