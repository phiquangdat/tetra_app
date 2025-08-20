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
  updateUnitProgress,
  type UnitProgress,
  type ModuleProgress,
  getModuleProgress,
  getContentProgressByUnitId,
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
  moduleProgress: ModuleProgress | null;
  setModuleProgress: (module: ModuleProgress | null) => void;
  moduleProgressStatus: string;
  setModuleProgressStatus: (status: string) => void;
  unitProgress: UnitProgress | null;
  setUnitProgress: (unitProgress: UnitProgress | null) => void;
  unitProgressStatus: string;
  setUnitProgressStatus: (status: string) => void;
  goToStart: (preloadedData?: {
    unitId: string;
    contents: UnitContent[];
  }) => Promise<void>;
  goToLastVisited: (lastUnitId: string, lastContentId: string) => void;
  goToFirstContent: () => Promise<void>;
  initFirstUnitAndContentProgress: () => Promise<{
    unitId: string;
    contents: UnitContent[];
  } | null>;
  continueFromLastVisited: () => Promise<void>;
  finalizeUnitIfComplete: (
    unitId: string,
    moduleId: string,
  ) => Promise<boolean>;
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
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(
    null,
  );
  const [moduleProgressStatus, setModuleProgressStatus] =
    useState<string>('not_started');
  const [unitProgress, setUnitProgress] = useState<UnitProgress | null>(null);
  const [unitProgressStatus, setUnitProgressStatus] =
    useState<string>('not_started');
  const navigate = useNavigate();

  const setUnits = (units: Unit[]) => {
    setUnitsState(units);
  };

  const goToNextContent = async (currentContentId: string) => {
    const currentUnitIndex = units.findIndex((u) => u.id === unitId);
    if (currentUnitIndex === -1) return;

    const currentContentIndex = contentList.findIndex(
      (c) => c.id === currentContentId,
    );
    const nextContent = contentList[currentContentIndex + 1];

    if (nextContent) {
      // CASE 1: next content in current unit
      if (nextContent.content_type === 'quiz') {
        await openModal(nextContent.id); // Show quiz modal (don't navigate)
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

      async function updateProgress() {
        try {
          const response = await updateUnitProgress(
            unitProgress?.id as string,
            {
              moduleId,
              unitId,
              status: 'COMPLETED',
            },
          );
          setUnitProgress(response);
          setUnitProgressStatus('completed');

          console.log('[updateUnitProgress]', response);
        } catch (error) {
          console.error('Error updating unit progress:', error);
        }
      }

      updateProgress();
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

  const goToStart = async (preloadedData?: {
    unitId: string;
    contents: UnitContent[];
  }) => {
    let startUnitId = preloadedData?.unitId ?? units?.[0]?.id;
    let startContents = preloadedData?.contents;

    if (!startUnitId) {
      const apiUnits = await fetchUnitTitleByModuleId(moduleId);
      if (!apiUnits || !apiUnits.length) {
        throw new Error('This module has no units.');
      }
      setUnits(apiUnits);
      startUnitId = apiUnits[0].id;
    }

    if (!startContents) {
      startContents =
        contentList.length && unitId === startUnitId
          ? contentList
          : await fetchUnitContentById(startUnitId);
    }

    if (!startContents || !startContents.length) {
      throw new Error('This module has no content to start.');
    }

    const firstContent = startContents[0];

    setUnitId(startUnitId);
    setUnitContent(startUnitId, startContents);

    if (firstContent.content_type === 'quiz') {
      await openModal(firstContent.id);
    } else {
      navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
        state: { unitId: startUnitId },
      });
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
      if (lastContent.content_type === 'quiz') {
        await openModal(lastContent.id);
      } else {
        navigate(`/user/${lastContent.content_type}/${lastContentId}`, {
          state: { unitId: lastUnitId },
        });
      }
    } else {
      throw new Error('Last visited content not found.');
    }
  };

  const goToFirstContent = async () => {
    const contentList = await fetchUnitContentById(unitId);
    if (contentList && contentList.length > 0) {
      const firstContent = contentList[0];
      setUnitContent(unitId, contentList);
      if (firstContent.content_type == 'quiz') {
        await openModal(firstContent.id);
      } else {
        navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
          state: { unitId },
        });
      }
    } else {
      throw new Error('This unit has no content to start.');
    }
  };

  const initFirstUnitAndContentProgress = async (): Promise<{
    unitId: string;
    contents: UnitContent[];
  } | null> => {
    const firstUnitId = units?.[0]?.id;
    if (!firstUnitId) return null;

    let contents: UnitContent[] =
      contentList.length && unitId === firstUnitId
        ? contentList
        : await fetchUnitContentById(firstUnitId);

    try {
      await createUnitProgress(firstUnitId, moduleId);
      setUnitProgressStatus('in_progress');
    } catch (e: any) {
      if (!String(e?.message ?? '').includes('409')) console.warn('[unit]', e);
    }

    const firstContentId = contents?.[0]?.id;
    if (firstContentId) {
      try {
        await createContentProgress({
          unitId: firstUnitId,
          unitContentId: firstContentId,
          status: 'IN_PROGRESS',
          points: 0,
        });
      } catch (e: any) {
        if (!String(e?.message ?? '').includes('409'))
          console.warn('[content]', e);
      }
    }

    setUnitId(firstUnitId);
    setUnitContent(firstUnitId, contents);

    return { unitId: firstUnitId, contents };
  };

  const continueFromLastVisited = async (): Promise<void> => {
    try {
      if (!moduleId) {
        console.warn('[continueFromLastVisited] No moduleId available');
        return;
      }

      const progress = await getModuleProgress(moduleId);

      if (!progress) {
        console.warn('[continueFromLastVisited] No module progress found');
        return;
      }

      setModuleProgress(progress);
      setModuleProgressStatus(progress.status.toLowerCase());

      const { last_visited_unit_id, last_visited_content_id } = progress;

      if (!last_visited_unit_id || !last_visited_content_id) {
        console.warn('[continueFromLastVisited] Missing last visited IDs:', {
          unitId: last_visited_unit_id,
          contentId: last_visited_content_id,
        });
        return;
      }

      await goToLastVisited(last_visited_unit_id, last_visited_content_id);
    } catch (error) {
      console.error('[continueFromLastVisited] Error:', error);
    }
  };

  async function finalizeUnitIfComplete(unitId: string, moduleId: string) {
    // Fetch all content items for the unit
    const contents = await fetchUnitContentById(unitId);

    // Fetch all content progress for that unit
    const progressList = await getContentProgressByUnitId(unitId);

    // Determine if all content have a progress entry with status COMPLETED
    const byId = new Map(progressList.map((p) => [p.unitContentId, p]));
    const allCompleted =
      contents.length > 0 &&
      contents.every((c) => {
        const p = byId.get(c.id);
        return p && String(p.status).toUpperCase() === 'COMPLETED';
      });

    if (!allCompleted) return false;

    // Mark the unit as COMPLETED if not already
    if (unitProgress?.status?.toUpperCase() !== 'COMPLETED') {
      const updated = await updateUnitProgress(unitProgress?.id as string, {
        moduleId,
        unitId,
        status: 'COMPLETED',
      });
      setUnitProgress(updated);
      setUnitProgressStatus('completed');
    }
    return true;
  }

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
        moduleProgress,
        setModuleProgress,
        moduleProgressStatus,
        setModuleProgressStatus,
        unitProgress,
        setUnitProgress,
        unitProgressStatus,
        setUnitProgressStatus,
        goToStart,
        goToLastVisited,
        goToFirstContent,
        initFirstUnitAndContentProgress,
        continueFromLastVisited,
        finalizeUnitIfComplete,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
};
