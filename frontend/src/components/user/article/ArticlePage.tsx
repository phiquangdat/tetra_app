import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';

interface ArticlePageProps {
  id: string;
}

const ArticlePage: React.FC<ArticlePageProps> = ({ id }: ArticlePageProps) => {
  const [article, setArticle] = useState<Article | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;
  useEffect(() => {
    fetchArticleContentById(id).then((data) => setArticle(data));
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
