import React, { useEffect, useState, useCallback } from 'react';
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

interface ArticlePageProps {
  id: string;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ id }: ArticlePageProps) => {
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;
  const [contentProgress, setContentProgress] = useState<ContentProgress>();
  const {
    moduleId,
    unitId,
    goToNextContent,
    isNextContent,
    moduleProgress,
    setModuleProgress,
    finalizeUnitIfComplete,
  } = useModuleProgress();

  const resolveUnitId = (a?: Article | null) =>
    unitIdFromState || unitId || a?.unit_id || '';

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
    const percent = calculateScrollPercent();

    if (percent >= 90) {
      try {
        const response = await updateContentProgress(contentProgress.id, {
          status: 'COMPLETED',
          points: article.points || 0,
        });

        const resolvedUnitId = resolveUnitId(article);
        console.log('effectiveUnitId', resolvedUnitId);
        await finalizeUnitIfComplete(resolvedUnitId, moduleId);
        setContentProgress((prev) =>
          prev
            ? { ...prev, status: 'COMPLETED', points: article.points }
            : prev,
        );
        console.log('[updateContentProgress]', response);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
      try {
        const response = await patchModuleProgress(moduleProgress.id, {
          earnedPoints: moduleProgress.earned_points + article.points || 0,
        });
        const progressArg = {
          id: response.id,
          status: response.status,
          last_visited_unit_id: response.lastVisitedUnit.id || '',
          last_visited_content_id: response.lastVisitedContent.id || '',
          earned_points: response.earnedPoints || 0,
        };

        console.log('[patchModuleProgress], Update Total Points: ', response);
        setModuleProgress(progressArg);
      } catch (error) {
        console.error(
          '[patchModuleProgress] Failed to increment module points',
          error,
        );
      }
    }
  }, [calculateScrollPercent, contentProgress, article?.points]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchArticleContentById(id);
      setArticle(data);

      const resolvedUnitId = resolveUnitId(data);
      console.log('effectiveUnitId', resolvedUnitId);

      try {
        const progress = await getContentProgress(id);
        console.log('[getContentProgress]', progress);

        setContentProgress(progress);

        if (
          (moduleProgress?.last_visited_unit_id !== unitIdFromState ||
            moduleProgress?.last_visited_content_id !== id) &&
          progress.status !== 'COMPLETED'
        ) {
          try {
            const response = await patchModuleProgress(
              moduleProgress?.id as string,
              {
                lastVisitedUnit: resolvedUnitId,
                lastVisitedContent: id,
              },
            );
            const progressArg = {
              id: response.id,
              status: response.status,
              last_visited_unit_id: response.lastVisitedUnit.id || '',
              last_visited_content_id: response.lastVisitedContent.id || '',
              earned_points: response.earnedPoints || 0,
            };

            console.log('[patchModuleProgress], Update IDs:', response);
            setModuleProgress(progressArg);
          } catch (error) {
            console.error('[patchModuleProgress]', error);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          const progress = await createContentProgress({
            unitId: unitIdFromState as string,
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
  }, [id, unitIdFromState]);

  useEffect(() => {
    if (contentProgress?.status?.toLowerCase() == 'completed') return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

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

      {contentProgress?.status?.toLowerCase() == 'completed' && (
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
            <div className="flex items-center gap-1 px-3 py-1 bg-white text-green-700 rounded-full text-sm font-medium border border-green-200 shadow-sm">
              + {contentProgress?.points ?? 0} pts
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
          {isNextContent(id ?? '') ? 'Up next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default ArticlePage;
