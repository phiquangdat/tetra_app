import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  type UnitContent,
  fetchUnitContentById,
  fetchUnitTitleByModuleId,
} from '../../services/unit/unitApi';
import { useUnitContent } from './UnitContentContext';
import { useQuizModal } from './QuizModalContext.tsx';
import { useUnitCompletionModal } from './UnitCompletionModalContext';
import {
  createContentProgress,
  createUnitProgress,
} from '../../services/userProgress/userProgressApi.tsx';

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
  moduleProgressStatus: string;
  setModuleProgressStatus: (status: string) => void;
  unitProgressStatus: string;
  setUnitProgressStatus: (status: string) => void;
  goToStart: () => Promise<void>;
  goToLastVisited: (lastUnitId: string, lastContentId: string) => void;
  goToFirstContent: () => Promise<void>;
  initFirstUnitAndContentProgress: () => Promise<void>;
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
  const { contentList, setUnitContent } = useUnitContent();
  const { openModal } = useQuizModal();
  const { open: openUnitCompletionModal } = useUnitCompletionModal();
  const [units, setUnitsState] = useState<Unit[]>([]);
  const [unitId, setUnitId] = useState<string>('');
  const [moduleId, setModuleId] = useState<string>('');
  const [moduleProgressStatus, setModuleProgressStatus] =
    useState<string>('not_started');
  const [unitProgressStatus, setUnitProgressStatus] =
    useState<string>('not_started');
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

  const goToStart = async () => {
    const units = await fetchUnitTitleByModuleId(moduleId);

    if (units && units.length > 0) {
      const firstUnitId = units[0].id;
      const firstUnitContent = await fetchUnitContentById(firstUnitId);

      if (firstUnitContent && firstUnitContent.length > 0) {
        const firstContent = firstUnitContent[0];

        setUnits(units);

        setUnitId(firstUnitId);

        setUnitContent(firstUnitId, firstUnitContent);

        navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
          state: { unitId: firstUnitId },
        });
      } else {
        throw new Error('This module has no content to start.');
      }
    } else {
      throw new Error('This module has no units.');
    }
  };

  const goToLastVisited = async (lastUnitId: string, lastContentId: string) => {
    setUnitId(lastUnitId);

    const lastContentList = await fetchUnitContentById(lastUnitId);

    const lastContent = lastContentList.find(
      (content) => content.id === lastContentId,
    );

    if (lastContent) {
      setUnitContent(lastContent.id, lastContentList);
      navigate(`/user/${lastContent.content_type}/${lastContentId}`, {
        state: { unitId: lastUnitId },
      });
    } else {
      throw new Error('Last visited content not found.');
    }
  };

  const goToFirstContent = async () => {
    const contentList = await fetchUnitContentById(unitId);
    if (contentList && contentList.length > 0) {
      const firstContent = contentList[0];
      setUnitContent(unitId, contentList);
      navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
        state: { unitId },
      });
    } else {
      throw new Error('This unit has no content to start.');
    }
  };

  const initFirstUnitAndContentProgress = async () => {
    const units = await fetchUnitTitleByModuleId(moduleId);
    if (!units?.length) return;

    const firstUnitId = units[0].id;

    try {
      await createUnitProgress(firstUnitId, moduleId);
      setUnitProgressStatus('in_progress');
    } catch (e: any) {
      if (!String(e.message).includes('409')) console.warn('[unit]', e);
    }

    const contents = await fetchUnitContentById(firstUnitId);
    if (!contents?.length) return;

    const firstContentId = contents[0].id;

    try {
      await createContentProgress({
        unitId: firstUnitId,
        unitContentId: firstContentId,
        status: 'IN_PROGRESS',
        points: 0,
      });
    } catch (e: any) {
      if (!String(e.message).includes('409')) console.warn('[content]', e);
    }

    setUnitId(firstUnitId);
    setUnitContent(firstUnitId, contents);
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
        moduleProgressStatus,
        setModuleProgressStatus,
        unitProgressStatus,
        setUnitProgressStatus,
        goToStart,
        goToLastVisited,
        goToFirstContent,
        initFirstUnitAndContentProgress,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
};
