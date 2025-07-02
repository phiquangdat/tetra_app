import { createContext, useContext, useState, type ReactNode } from 'react';

interface QuizModalContextType {
  isOpen: boolean;
  quizId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const QuizModalContext = createContext<QuizModalContextType | undefined>(
  undefined,
);

export const QuizModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);

  const openModal = (id: string) => {
    console.log('Content got id', id);
    setQuizId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setQuizId(null);
  };

  return (
    <QuizModalContext.Provider
      value={{ isOpen, quizId, openModal, closeModal }}
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
