import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UnitContent } from '../../services/unit/unitApi';
import { useUnitContent } from './UnitContentContext';
import { useQuizModal } from './QuizModalContext.tsx';

interface Unit {
  id: string;
  title: string;
  content?: UnitContent[];
}

interface ModuleProgressContextProps {
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  goToNextContent: (currentContentId: string) => void;
  unitId: string;
  setUnitId: (id: string) => void;
}

const ModuleProgressContext = createContext<
  ModuleProgressContextProps | undefined
>(undefined);

export const useModuleProgress = () => {
  const context = useContext(ModuleProgressContext);
  if (!context)
    throw new Error(
      'useModuleProgress must be used within ModuleProgressProvider',
    );
  return context;
};

export const ModuleProgressProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { contentList } = useUnitContent();
  const { openModal } = useQuizModal();
  const [units, setUnitsState] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<string>('');
  const navigate = useNavigate();

  const setUnits = (units: Unit[]) => {
    setUnitsState(units);
  };

  const goToNextContent = (currentContentId: string) => {
    const currentUnitIndex = units.findIndex((u) => u.id === unitId);
    if (currentUnitIndex === -1) return;

    const currentContentIndex = contentList.findIndex(
      (c) => c.id === currentContentId,
    );
    const nextContent = contentList[currentContentIndex + 1];

    if (nextContent) {
      // CASE 1: next content in current unit
      if (nextContent.content_type === 'quiz') {
        openModal(nextContent.id); // Show quiz modal (don't navigate)
      } else {
        navigate(`/user/${nextContent.content_type}/${nextContent.id}`, {
          state: { unitId },
        });
      }
      return;
    }

    // CASE 2: go to first content in next unit
    const nextUnit = units[currentUnitIndex + 1];
    if (nextUnit && nextUnit.content && nextUnit.content.length > 0) {
      const firstContent = nextUnit.content[0];
      if (firstContent.content_type === 'quiz') {
        navigate(`/user/unit/${nextUnit.id}`); // modal will be triggered in UnitPage
      } else {
        navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
          state: { unitId: nextUnit.id },
        });
      }
    } else if (nextUnit) {
      navigate(`/user/unit/${nextUnit.id}`);
    } else {
      console.log('Reached end of module');
    }
  };

  return (
    <ModuleProgressContext.Provider
      value={{ units, setUnits, goToNextContent, unitId, setUnitId }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
};
