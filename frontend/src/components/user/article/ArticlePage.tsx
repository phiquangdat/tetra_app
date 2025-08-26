import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import {
  getContentProgress,
  createContentProgress,
  updateContentProgress,
  patchModuleProgress,
  type ContentProgress,
} from '../../../services/userProgress/userProgressApi';
import { CheckIcon } from '../../common/Icons';
import toast from 'react-hot-toast';
import { hydrateContextFromContent } from '../../../utils/contextHydration';

interface ArticlePageProps {
  id: string;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ id }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;
  const [contentProgress, setContentProgress] = useState<ContentProgress>();
  const {
    moduleId,
    unitId,
    goToNextContent,
    isNextContentAsync,
    moduleProgress,
    setModuleProgress,
    finalizeUnitIfComplete,
    setUnitId,
    setModuleId,
    getOrCreateModuleProgress,
  } = useModuleProgress();

  // Keep hydrated IDs available everywhere without changing function shapes
  const idsRef = useRef<{ unitId?: string; moduleId?: string }>({});

  // Lock to prevent multiple triggers while past 90%
  const completingRef = useRef(false);

  // helper (already in your code path)
  const safePatchModule = useCallback(
    async (payload: Parameters<typeof patchModuleProgress>[1]) => {
      const mid = idsRef.current.moduleId || moduleId;
      if (!mid) throw new Error('[safePatchModule] Missing moduleId');
      const mp = await getOrCreateModuleProgress(mid);
      const resp = await patchModuleProgress(mp.id, payload);
      setModuleProgress({
        id: resp.id,
        status: resp.status,
        last_visited_unit_id: resp.lastVisitedUnit?.id || '',
        last_visited_content_id: resp.lastVisitedContent?.id || '',
        earned_points: resp.earnedPoints || 0,
      });
      return resp;
    },
    [getOrCreateModuleProgress, moduleId, setModuleProgress],
  );

  const resolveUnitId = (a?: Article | null) =>
    unitIdFromState || unitId || a?.unit_id || '';
  const [hasNext, setHasNext] = useState(false);

  const calculateScrollPercent = useCallback(() => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return 100;

    const percent = (scrollTop / scrollableHeight) * 100;
    return Math.round(percent);
  }, []);

  const handleScroll = useCallback(async () => {
    if (
      !contentProgress ||
      contentProgress.status === 'COMPLETED' ||
      !moduleProgress ||
      !article
    )
      return;

    // Ignore additional scroll events once we're completing/completed
    if (completingRef.current) return;

    const percent = calculateScrollPercent();

    if (percent >= 90) {
      // lock before async work so multiple events don't re-enter
      completingRef.current = true;
      const articlePoints = article.points ?? 0;

      try {
        const response = await updateContentProgress(contentProgress.id, {
          status: 'COMPLETED',
          points: articlePoints,
        });

        const resolvedUnitId = resolveUnitId(article);
        await finalizeUnitIfComplete(
          resolvedUnitId,
          idsRef.current.moduleId || moduleId,
        );
        setContentProgress((prev) =>
          prev ? { ...prev, status: 'COMPLETED', points: articlePoints } : prev,
        );
        console.log('[updateContentProgress]', response);
        toast.success(`Complete reading! + ${articlePoints} pts`);
      } catch (error) {
        console.error('Error updating progress:', error);
        // unlock on failure so user can retry
        completingRef.current = false;
      }
      try {
        const response = await safePatchModule({
          earnedPoints:
            (moduleProgress.earned_points || 0) + (article.points || 0),
        });

        console.log('[patchModuleProgress], Update Total Points: ', response);
      } catch (error) {
        console.error(
          '[patchModuleProgress] Failed to increment module points',
          error,
        );
      }
    }
  }, [
    calculateScrollPercent,
    contentProgress,
    article?.points,
    moduleProgress,
    finalizeUnitIfComplete,
    moduleId,
    safePatchModule,
    setModuleProgress,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchArticleContentById(id);
      setArticle(data);

      // Hydrate context if missing and cache IDs
      let effectiveUnitId = unitId || data.unit_id || unitIdFromState || '';
      let effectiveModuleId = moduleId;

      if (!effectiveUnitId || !effectiveModuleId) {
        const hydrated = await hydrateContextFromContent(id, {
          setUnitId,
          setModuleId,
        });
        effectiveUnitId ||= hydrated.unitId;
        effectiveModuleId ||= hydrated.moduleId;
      }
      idsRef.current = { unitId: effectiveUnitId, moduleId: effectiveModuleId };

      try {
        const next = await isNextContentAsync(id);
        setHasNext(next);
      } catch {
        setHasNext(false);
      }

      const resolvedUnitId = resolveUnitId(data) || effectiveUnitId;

      try {
        const progress = await getContentProgress(id);
        console.log('[getContentProgress]', progress);

        setContentProgress(progress);

        // If already completed, prime the lock
        if (String(progress.status).toUpperCase() === 'COMPLETED') {
          completingRef.current = true;
        }

        if (
          (moduleProgress?.last_visited_unit_id !== resolvedUnitId ||
            moduleProgress?.last_visited_content_id !== id) &&
          progress.status !== 'COMPLETED'
        ) {
          try {
            const response = await safePatchModule({
              lastVisitedUnit: resolvedUnitId,
              lastVisitedContent: id,
            });

            console.log('[patchModuleProgress], Update IDs:', response);
          } catch (error) {
            console.error('[patchModuleProgress]', error);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          const progress = await createContentProgress({
            unitId: resolvedUnitId,
            unitContentId: id,
            status: 'IN_PROGRESS',
            points: 0,
          });
          console.log('[createContentProgress]', progress);

          setContentProgress(progress);
        } else {
          console.error(error);
        }
      }
    };

    fetchData();
  }, [
    id,
    unitIdFromState,
    unitId,
    moduleId,
    isNextContentAsync,
    moduleProgress,
    setUnitId,
    setModuleId,
    safePatchModule,
    setModuleProgress,
  ]);

  useEffect(() => {
    if (contentProgress?.status?.toLowerCase() == 'completed') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, contentProgress?.status]);

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate(`/user/unit/${resolveUnitId(article)}`)}
          className="inline-flex items-center text-secondary hover:text-primary px-3 py-1 rounded-lg hover:bg-cardBackground hover:border hover:border-highlight active:bg-highlight transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      {contentProgress?.status?.toLowerCase() === 'completed' && (
        <div className="mb-6 bg-green-50 max-w-xl mx-auto border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <CheckIcon width={16} height={16} color="white" />
            </div>

            <div className="flex-1">
              <span className="text-green-600 text-sm">
                You've read this before. Feel free to review it again!
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold shadow-sm">
              {contentProgress?.points ?? 0} PTS
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-extrabold mb-8 text-primary text-center">
        {article?.title}
      </h1>

      <div className="bg-cardBackground rounded-3xl p-10 sm:p-14 shadow-xl w-full md:w-3/4 mx-auto border-l-8 border-accent">
        <div
          className="prose prose-lg max-w-none leading-relaxed text-primary/90 text-justify"
          dangerouslySetInnerHTML={{ __html: article?.content || '' }}
        />
      </div>

      <div className="flex justify-end mt-10">
        <button
          className="bg-surface text-background font-semibold px-12 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200 w-fit"
          type="button"
          onClick={() => goToNextContent(id)}
        >
          {hasNext ? 'Up next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default ArticlePage;
