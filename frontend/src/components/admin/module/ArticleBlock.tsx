import React, { useEffect, useState } from 'react';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';

interface ArticleBlockProps {
  id: string;
}

const ArticleBlock: React.FC<ArticleBlockProps> = ({ id }) => {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetchArticleContentById(id).then(setArticle).catch(console.error);
  }, [id]);

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="font-semibold">Article title</p>
          <p>{article?.title || 'No title available'}</p>
        </div>

        <div className="prose prose-sm max-w-none bg-gray-100 rounded-xl p-4">
          <div
            dangerouslySetInnerHTML={{
              __html: article?.content ?? '<p>No content available</p>',
            }}
          />
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover">
            Edit
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleBlock;
