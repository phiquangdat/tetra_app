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
  createModuleProgress,
  createContentProgress,
  createUnitProgress,
  updateUnitProgress,
  type UnitProgress,
  type ModuleProgress,
  getModuleProgress,
  getContentProgressByUnitId,
  getUnitProgressByModuleId,
  patchModuleProgress,
  getUnitProgress,
} from '../../services/userProgress/userProgressApi.tsx';

interface Unit {
  id: string;
  title: string;
  sort_order: number;
  content?: UnitContent[];
}

interface ModuleProgressContextProps {
  units: Unit[];
  setUnits: (units: Unit[]) => void;
  goToNextContent: (
    currentContentId: string,
    opts?: { unitId?: string; moduleId?: string },
  ) => Promise<void>;
  isNextContent: (currentContentId: string) => boolean | undefined;
  isNextContentAsync: (currentContentId: string) => Promise<boolean>;
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
  finalizeUnitIfComplete: (unitId: string, moduleId: string) => Promise<void>;
  finalizeModuleIfComplete: (moduleId: string) => Promise<boolean>;
  ensureModuleStarted: () => Promise<void>;
  ensureUnitStarted: (unitId: string) => Promise<void>;
  getOrCreateModuleProgress: (
    targetModuleId?: string,
  ) => Promise<ModuleProgress>;
  getOrCreateUnitProgress: (targetUnitId?: string) => Promise<UnitProgress>;
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

  const goToNextContent = async (
    currentContentId: string,
    opts?: { unitId?: string; moduleId?: string },
  ): Promise<void> => {
    // Prefer explicit overrides, then context, then last_visited fallback
    const currentUnitId =
      opts?.unitId || unitId || moduleProgress?.last_visited_unit_id;
    const currentModuleId = opts?.moduleId || moduleId;

    if (!currentUnitId || !currentModuleId) {
      console.warn(
        '[goToNextContent] Missing unitId/moduleId even after overrides',
        { currentUnitId, currentModuleId },
      );
      return;
    }

    // 1) Ensure we have the units list
    let unitList = units;
    if (!unitList || unitList.length === 0) {
      try {
        unitList = await fetchUnitTitleByModuleId(currentModuleId);
        const sorted = [...unitList].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        );
        setUnits(sorted);
      } catch (e) {
        console.error('[goToNextContent] Failed to hydrate units list:', e);
        return;
      }
    }

    // 2) Find current unit index (using the resolved currentUnitId)
    let currentUnitIndex = unitList.findIndex((u) => u.id === currentUnitId);
    if (currentUnitIndex === -1) {
      // last-visited fallback as a last resort
      if (moduleProgress?.last_visited_unit_id) {
        currentUnitIndex = unitList.findIndex(
          (u) => u.id === moduleProgress.last_visited_unit_id,
        );
      }
      if (currentUnitIndex === -1) {
        console.warn('[goToNextContent] Could not resolve current unit index');
        return;
      }
    }

    // 3) Ensure we have the content list for the *current* unit
    let list = contentList;
    if (!list || list.length === 0 || unitId !== currentUnitId) {
      try {
        list = await fetchUnitContentById(currentUnitId);
        setUnitContent(currentUnitId, list);
      } catch (e) {
        console.error('[goToNextContent] Failed to hydrate content list:', e);
        return;
      }
    }

    // 4) Figure out "next content" inside the same unit
    const currentContentIndex = list.findIndex(
      (c) => c.id === currentContentId,
    );
    const nextContent =
      currentContentIndex >= 0 ? list[currentContentIndex + 1] : undefined;

    if (nextContent) {
      // CASE 1: next content in current unit
      if (nextContent.content_type === 'quiz') {
        await openModal(nextContent.id); // Show quiz modal (don't navigate)
      } else {
        navigate(`/user/${nextContent.content_type}/${nextContent.id}`, {
          state: { unitId: currentUnitId },
        });
      }
      return;
    }

    // 5) No more content -> move to next unit or finish module
    const nextUnit = unitList[currentUnitIndex + 1];
    if (nextUnit) {
      openUnitCompletionModal(nextUnit.id, currentModuleId);

      try {
        const up = await getOrCreateUnitProgress(currentUnitId);
        const response = await updateUnitProgress(up.id as string, {
          moduleId: currentModuleId,
          unitId: currentUnitId,
          status: 'COMPLETED',
        });
        setUnitProgress(response);
        setUnitProgressStatus('completed');
        console.log('[updateUnitProgress]', response);
      } catch (error) {
        console.error('Error updating unit progress:', error);
      }
    } else {
      navigate(`/user/modules/${currentModuleId}`);
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

  // 2) Add the async implementation inside ModuleProgressProvider
  const isNextContentAsync = async (
    currentContentId: string,
  ): Promise<boolean> => {
    if (!currentContentId) return false;
    if (!unitId) return false;

    let list = contentList;
    if (!list || list.length === 0) {
      try {
        list = await fetchUnitContentById(unitId);
        setUnitContent(unitId, list);
      } catch (e) {
        console.error('[isNextContentAsync] Failed to hydrate content:', e);
        return false;
      }
    }

    const idx = list.findIndex((c) => c.id === currentContentId);
    if (idx === -1) return false;

    return idx + 1 < list.length;
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

      const sorted = [...apiUnits].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
      setUnits(sorted);
      startUnitId = sorted[0].id;
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
      setUnitContent(lastUnitId, lastContentList);
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
    let contentList = await fetchUnitContentById(unitId);
    if (contentList && contentList.length > 0) {
      contentList = [...contentList].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
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
    const firstUnitId = [...units].sort(
      (a, b) => a.sort_order - b.sort_order,
    )[0]?.id;
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

    if (!allCompleted) return;

    // Mark the unit as COMPLETED if not already
    if (unitProgress && unitProgress.status?.toUpperCase() !== 'COMPLETED') {
      const updated = await updateUnitProgress(unitProgress?.id as string, {
        moduleId,
        unitId,
        status: 'COMPLETED',
      });
      await finalizeModuleIfComplete(moduleId);
      setUnitProgress(updated);
      setUnitProgressStatus('completed');
    }
    return;
  }

  async function finalizeModuleIfComplete(moduleId: string) {
    // Fetch unit progress for the whole module
    const unitProgresses = await getUnitProgressByModuleId(moduleId);

    // Fetch units for the module (we already keep them in context; fall back to API if empty)
    const list: Unit[] = units?.length
      ? [...units].sort(
          (a: Unit, b: Unit) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        )
      : ((await fetchUnitTitleByModuleId(moduleId)) as Unit[]).sort(
          (a: Unit, b: Unit) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        );

    // All units must exist and be COMPLETED
    const byUnit = new Map(unitProgresses.map((u) => [u.unitId, u]));
    const allCompleted =
      list.length > 0 &&
      list.every((u) => {
        const up = byUnit.get(u.id);
        return up && String(up.status).toUpperCase() === 'COMPLETED';
      });
    if (!allCompleted) return false;

    // Patch module progress if not already completed
    if (
      !moduleProgress ||
      moduleProgress.status?.toUpperCase() !== 'COMPLETED'
    ) {
      const progressId =
        moduleProgress?.id ?? (await getModuleProgress(moduleId))?.id;
      if (!progressId) return false;
      const updated = await patchModuleProgress(progressId, {
        status: 'COMPLETED',
      });
      setModuleProgress({
        id: updated.id,
        status: updated.status,
        last_visited_unit_id: updated.lastVisitedUnit?.id || '',
        last_visited_content_id: updated.lastVisitedContent?.id || '',
        earned_points: updated.earnedPoints || 0,
      });
      setModuleProgressStatus('completed');
    }
    return true;
  }

  const getOrCreateModuleProgress = async (
    targetModuleId?: string,
  ): Promise<ModuleProgress> => {
    const mid = targetModuleId || moduleId;
    if (!mid) throw new Error('[getOrCreateModuleProgress] Missing moduleId');

    if (moduleProgress?.id && moduleId === mid) return moduleProgress;

    try {
      const mp = await getModuleProgress(mid);
      setModuleProgress(mp);
      setModuleProgressStatus(String(mp.status).toLowerCase());
      return mp;
    } catch (e: any) {
      // if not found -> create
      if (String(e?.message ?? '').includes('404')) {
        const resp = await createModuleProgress(mid, {
          lastVisitedUnit: moduleProgress?.last_visited_unit_id,
          lastVisitedContent: moduleProgress?.last_visited_content_id,
        });
        const mp: ModuleProgress = {
          id: resp.id,
          status: resp.status,
          last_visited_unit_id: resp.lastVisitedUnit?.id || '',
          last_visited_content_id: resp.lastVisitedContent?.id || '',
          earned_points: resp.earnedPoints || 0,
        };
        setModuleProgress(mp);
        setModuleProgressStatus('in_progress');
        return mp;
      }
      throw e;
    }
  };

  const getOrCreateUnitProgress = async (
    targetUnitId?: string,
  ): Promise<UnitProgress> => {
    const uid = targetUnitId ?? unitId;
    if (unitProgress?.id && unitProgress.unitId === uid) return unitProgress;

    try {
      const up = await getUnitProgress(uid);
      setUnitProgress(up);
      setUnitProgressStatus(String(up.status).toLowerCase());
      return up;
    } catch (e: any) {
      if (String(e?.message ?? '').includes('404')) {
        const up = await createUnitProgress(uid, moduleId);
        setUnitProgress(up);
        setUnitProgressStatus('in_progress');
        return up;
      }
      throw e;
    }
  };

  async function ensureModuleStarted() {
    const mp = await getOrCreateModuleProgress();
    const status = String(mp.status || '').toLowerCase();
    if (status === 'in_progress' || status === 'completed') return;

    try {
      const resp = await patchModuleProgress(mp.id, { status: 'IN_PROGRESS' });

      setModuleProgress({
        id: resp.id,
        status: resp.status,
        last_visited_unit_id: resp.lastVisitedUnit?.id || '',
        last_visited_content_id: resp.lastVisitedContent?.id || '',
        earned_points: resp.earnedPoints || 0,
      });
      setModuleProgressStatus('in_progress');
    } catch (e: any) {
      console.warn('[ensureModuleStarted] failed to mark IN_PROGRESS:', e);
    }
  }

  async function ensureUnitStarted(targetUnitId: string) {
    const up = await getOrCreateUnitProgress(targetUnitId);
    const status = String(up.status || '').toLowerCase();
    if (status === 'in_progress' || status === 'completed') return;

    try {
      const resp = await updateUnitProgress(up.id, {
        moduleId,
        unitId: targetUnitId,
        status: 'IN_PROGRESS',
      });
      setUnitProgress(resp);
      setUnitProgressStatus('in_progress');
    } catch (e: any) {
      console.warn('[ensureUnitStarted] update to IN_PROGRESS failed:', e);
      if (unitProgressStatus === 'not_started')
        setUnitProgressStatus('in_progress');
    }
  }

  return (
    <ModuleProgressContext.Provider
      value={{
        units,
        setUnits,
        goToNextContent,
        isNextContent,
        isNextContentAsync,
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
        finalizeModuleIfComplete,
        getOrCreateModuleProgress,
        getOrCreateUnitProgress,
        ensureModuleStarted,
        ensureUnitStarted,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  );
};
