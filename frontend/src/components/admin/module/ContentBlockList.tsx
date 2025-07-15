import React, { useEffect, useState } from 'react';
import {
  fetchUnitContentById,
  type UnitContent,
} from '../../../services/unit/unitApi';
import ContentBlockItem from './ContentBlockItem';
import {
  ArticleIcon,
  PuzzleIcon,
  VideoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../common/Icons';

interface ContentBlockListProps {
  unitId: string;
}

const iconForType = {
  video: <VideoIcon />,
  article: <ArticleIcon />,
  quiz: <PuzzleIcon />,
};

const ContentBlockList: React.FC<ContentBlockListProps> = ({ unitId }) => {
  const [contentBlocks, setContentBlocks] = useState<UnitContent[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchUnitContentById(unitId)
      .then((data) => setContentBlocks(data))
      .catch((err) => console.error('Failed to fetch content blocks:', err));
  }, [unitId]);

  const toggleOpen = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-[#F9F5FF] rounded-2xl p-6 shadow-lg border border-[#D4C2FC]">
      <h3 className="text-lg font-semibold text-[#231942] mb-4">
        Content Blocks
      </h3>

      {contentBlocks.length === 0 && (
        <p className="text-[#998FC7]">
          No content blocks available for this unit.
        </p>
      )}

      {contentBlocks.map((block, index) => (
        <div key={block.id} className="mb-3">
          <div
            onClick={() => toggleOpen(index)}
            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors 
              hover:bg-[#D4C2FC] ${openIndex === index ? 'bg-[#998FC7]/30' : 'bg-white'}`}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {iconForType[block.content_type as keyof typeof iconForType]}
            </div>
            <div className="capitalize text-base font-medium text-[#231942] w-24">
              {block.content_type}
            </div>
            <div className="text-[#231942] text-base flex-1">{block.title}</div>

            <div className="ml-auto">
              {openIndex === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </div>
          </div>

          <ContentBlockItem
            id={block.id}
            type={block.content_type}
            isOpen={openIndex === index}
          />
        </div>
      ))}
    </div>
  );
};

export default ContentBlockList;
