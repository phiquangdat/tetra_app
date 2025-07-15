import React, { useEffect, useState } from 'react';
import {
  fetchUnitContentById,
  type UnitContent,
} from '../../../services/unit/unitApi';
import ContentBlockItem from './ContentBlockItem';

interface ContentBlockListProps {
  unitId: string;
}

const ContentBlockList: React.FC<ContentBlockListProps> = ({ unitId }) => {
  const [contentBlocks, setContentBlocks] = useState<UnitContent[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const data = await fetchUnitContentById(unitId);
        setContentBlocks(data);
      } catch (err) {
        setError('Failed to load content blocks');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [unitId]);

  const toggleDropdown = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#231942] mb-2">
        Content Blocks
      </h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && contentBlocks.length === 0 && (
        <p className="text-sm text-gray-500">
          No content blocks available for this unit.
        </p>
      )}

      {contentBlocks.map((block, index) => (
        <ContentBlockItem
          key={block.id}
          contentId={block.id}
          contentType={block.content_type as 'video' | 'article' | 'quiz'}
          title={block.title}
          isOpen={openIndex === index}
          onToggle={() => toggleDropdown(index)}
        />
      ))}
    </div>
  );
};

export default ContentBlockList;
