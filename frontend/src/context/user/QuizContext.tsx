import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Question } from '../../services/quiz/quizApi.ts';

interface QuizContextType {
  questions: Question[];
  setQuestions: (q: Question[]) => void;
}

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined,
);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);

  return (
    <QuizContext.Provider value={{ questions, setQuestions }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within QuizProvider');
  return context;
};
