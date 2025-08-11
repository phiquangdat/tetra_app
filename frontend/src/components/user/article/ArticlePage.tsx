import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import {
  getContentProgress,
  createContentProgress,
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

  useEffect(() => {
    const fetchData = async () => {
      fetchArticleContentById(id).then((data) => setArticle(data));

      try {
        const progress = await getContentProgress(id);
        console.log('[getContentProgress]', progress);

        setContentProgress(progress);
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
  }, [id]);
  const { goToNextContent, isNextContent } = useModuleProgress();

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate(`/user/unit/${unitIdFromState}`)}
          className="inline-flex items-center text-secondary hover:text-primary px-3 py-1 rounded-lg hover:bg-cardBackground hover:border hover:border-highlight active:bg-highlight transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      {contentProgress?.status?.toLocaleLowerCase() == 'completed' && (
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
              + {contentProgress.points} pts
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
