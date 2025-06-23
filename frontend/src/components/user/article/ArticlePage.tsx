import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';
import { useUnitContent } from '../../../context/UnitContentContext';

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
  const { goToNextContent } = useUnitContent();

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate(`/user/unit/${unitIdFromState}`)}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        {article?.title}
      </h1>
      <div className="bg-gray-100 rounded-2xl p-12 shadow-md w-full md:w-full mx-auto">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article?.content || '' }}
        />
      </div>

      <div className="flex justify-end mt-8">
        <button
          className="bg-blue-200 font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit"
          type="button"
          onClick={() => goToNextContent(id)}
        >
          Up next
        </button>
      </div>
    </div>
  );
};

export default ArticlePage;
