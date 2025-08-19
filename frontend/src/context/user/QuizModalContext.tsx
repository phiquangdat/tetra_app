import { createContext, useContext, useState, type ReactNode } from 'react';
import { getContentProgress } from '../../services/userProgress/userProgressApi';

type QuizModalType = 'start' | 'passed' | null;

interface QuizModalContextType {
  isOpen: boolean;
  quizId: string | null;
  type: QuizModalType;
  openModal: (id: string) => Promise<void>;
  closeModal: () => void;
}

const QuizModalContext = createContext<QuizModalContextType | undefined>(
  undefined,
);

export const QuizModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [type, setType] = useState<QuizModalType>(null);

  const openModal = async (id: string) => {
    try {
      const progress = await getContentProgress(id);
      if (progress?.status?.toUpperCase() === 'COMPLETED') {
        setQuizId(id);
        setType('passed');
        setIsOpen(true);
      } else {
        // has record but not completed -> treat as "start"
        setQuizId(id);
        setType('start');
        setIsOpen(true);
      }
    } catch (err) {
      // 404 => no record => show start modal
      if (err instanceof Error && err.message.includes('404')) {
        setQuizId(id);
        setType('start');
        setIsOpen(true);
      } else {
        console.error('[openQuiz] Failed to check progress:', err);
      }
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setQuizId(null);
    setType(null);
  };

  return (
    <QuizModalContext.Provider
      value={{ isOpen, quizId, type, openModal, closeModal }}
    >
      {children}
    </QuizModalContext.Provider>
  );
};

export const useQuizModal = () => {
  const context = useContext(QuizModalContext);
  if (!context) {
    throw new Error('useQuizModal must be used within QuizModalProvider');
  }
  return context;
};
