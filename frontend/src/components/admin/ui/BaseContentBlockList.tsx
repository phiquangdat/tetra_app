import React, { useState } from 'react';
import ContentBlockItem from '../module/ContentBlockItem';
import {
  ArticleIcon,
  PuzzleIcon,
  VideoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../common/Icons';
import type { ContentBlock } from '../../../context/admin/UnitContext';

const iconForType: Record<ContentBlock['type'], React.ReactNode> = {
  video: <VideoIcon />,
  article: <ArticleIcon />,
  quiz: <PuzzleIcon />,
};

interface BaseContentBlockListProps {
  blocks: ContentBlock[];
  unitNumber?: number;
}

export const BaseContentBlockList: React.FC<BaseContentBlockListProps> = ({
  blocks,
  unitNumber,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-cardBackground rounded-2xl p-6 shadow-lg border border-highlight">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Content Blocks
      </h3>
      {blocks.length === 0 ? (
        <p className="text-secondary">No content blocks available.</p>
      ) : (
        blocks.map((block, idx) => {
          const blockId = block.id ?? `${block.type}-${idx}`;
          return (
            <div key={blockId} className="mb-3">
              <div
                onClick={() => toggle(idx)}
                className={
                  `flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors hover:bg-highlight ` +
                  (openIndex === idx ? 'bg-secondary/30' : 'bg-white')
                }
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {iconForType[block.type]}
                </div>
                <div className="capitalize text-sm font-medium text-[#231942] w-24">
                  {block.type}
                </div>
                <div className="text-base text-primary flex-1">
                  {block.data.title}
                </div>
                <div className="ml-auto">
                  {openIndex === idx ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </div>
              </div>
              <ContentBlockItem
                id={blockId}
                unitNumber={unitNumber}
                blockIndex={idx}
                type={block.type}
                isOpen={openIndex === idx}
              />
            </div>
          );
        })
      )}
    </div>
  );
};
