import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UnitContent } from '../../services/unit/unitApi';
import { useUnitContent } from './UnitContentContext';
import { useQuizModal } from './QuizModalContext.tsx';
import { useUnitCompletionModal } from './UnitCompletionModalContext';

interface Unit {
  id: string;
  title: string;
  content?: UnitContent[];
}

interface ModuleProgressContextProps {
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  goToNextContent: (currentContentId: string) => void;
  isNextContent: (currentContentId: string) => boolean | undefined;
  unitId: string;
  setUnitId: (id: string) => void;
  moduleId: string;
  setModuleId: (id: string) => void;
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
  const { open: openUnitCompletionModal } = useUnitCompletionModal();
  const [units, setUnitsState] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<string>('');
  const [moduleId, setModuleId] = useState<string>('');
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
    if (nextUnit) {
      openUnitCompletionModal(nextUnit.id, moduleId);
    } else {
      navigate(`/user/modules/${moduleId}`);
    }
  };

  const isNextContent = (currentContentId: string) => {
    const currentUnitIndex = units.findIndex((u) => u.id === unitId);
    if (currentUnitIndex === -1) return;

    const currentContentIndex = contentList.findIndex(
      (c) => c.id === currentContentId,
    );
    const nextContent = contentList[currentContentIndex + 1];

    if (nextContent) {
      return true;
    }

    return false;
  };

  return (
    <ModuleProgressContext.Provider
      value={{
        units,
        setUnits,
        goToNextContent,
        isNextContent,
        unitId,
        setUnitId,
        moduleId,
        setModuleId,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
};
