import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UnitContent } from '../services/unit/unitApi';
import { useQuizModal } from './QuizModalContext.tsx';

interface UnitContentContextProps {
  unitId: string;
  contentList: UnitContent[];
  setUnitContent: (unitId: string, content: UnitContent[]) => void;
  goToNextContent: (currentId: string) => void;
}

const UnitContentContext = createContext<UnitContentContextProps | undefined>(
  undefined,
);

export const useUnitContent = () => {
  const context = useContext(UnitContentContext);
  if (!context)
    throw new Error('useUnitContent must be used within a UnitContentProvider');
  return context;
};

export const UnitContentProvider = ({ children }: { children: ReactNode }) => {
  const [unitId, setUnitId] = useState<string>('');
  const [contentList, setContentList] = useState<UnitContent[]>([]);
  const navigate = useNavigate();
  const { openModal } = useQuizModal();

  const setUnitContent = (id: string, content: UnitContent[]) => {
    setUnitId(id);
    setContentList(content);
  };

  const goToNextContent = (currentId: string) => {
    const currentIndex = contentList.findIndex((item) => item.id === currentId);
    if (currentIndex === -1 || currentIndex === contentList.length - 1) return;
    const nextItem = contentList[currentIndex + 1];

    if (!nextItem) return;

    if (nextItem.content_type === 'quiz') {
      openModal(nextItem.id);
    } else {
      navigate(`/user/${nextItem.content_type}/${nextItem.id}`, {
        state: { unitId },
      });
    }
  };

  return (
    <UnitContentContext.Provider
      value={{ unitId, contentList, setUnitContent, goToNextContent }}
    >
      {children}
    </UnitContentContext.Provider>
  );
};
