import React, { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import {
  fetchArticleContentById,
  type Article,
} from '../../../services/unit/unitApi';
import ConfirmationModal from '../createModule/ConfirmationModal.tsx';

interface ArticleBlockProps {
  unitNumber?: number;
  blockIndex?: number;
  id?: string;
}

const ArticleBlock: React.FC<ArticleBlockProps> = ({
  unitNumber,
  blockIndex,
  id,
}) => {
  // const fromContext = unitNumber != null && blockIndex != null;
  const { getUnitState, setUnitState, setEditingBlock, removeUnitContent } =
    useUnitContext();
  const [article, setArticle] = useState<Article | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const unitContent =
    unitNumber != null && blockIndex != null
      ? getUnitState(unitNumber)?.content[blockIndex]
      : null;

  const shouldUseContext = !!unitContent?.data?.content;

  // Only fetch if context is NOT usable
  useEffect(() => {
    if (!shouldUseContext && id) {
      fetchArticleContentById(id)
        .then((fetched) => {
          setArticle(fetched);

          // 💡 Inject content into unit context
          if (unitNumber != null && blockIndex != null) {
            const unit = getUnitState(unitNumber);
            if (!unit) return;

            const updatedBlock = {
              ...unit.content[blockIndex],
              data: {
                ...unit.content[blockIndex].data,
                content: fetched.content,
              },
            };

            const updatedContent = [...unit.content];
            updatedContent[blockIndex] = updatedBlock;

            // Update context
            setUnitState(unitNumber, {
              content: updatedContent,
            });
          }
        })
        .catch(console.error);
    }
  }, [shouldUseContext, id]);

  // pick data
  const title = shouldUseContext
    ? unitContent!.data.title
    : (article?.title ?? 'No title available');

  const contentHtml = shouldUseContext
    ? (unitContent!.data.content ?? '<p>No content</p>')
    : (article?.content ?? '<p>No content available</p>');

  const handleConfirmDelete = async () => {
    if (unitNumber != null && blockIndex != null) {
      const success = await removeUnitContent(unitNumber, blockIndex);
      if (success) {
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Article title</p>
          <p>{title}</p>
        </div>
        <div className="prose prose-sm max-w-none bg-gray-100 rounded-xl p-4">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
            onClick={() => {
              if (unitNumber != null && blockIndex != null) {
                setEditingBlock({ unitNumber, blockIndex, type: 'article' });
              }
            }}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmationModal
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Article"
          description="Are you sure you want to delete this article? This action cannot be undone."
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default ArticleBlock;
