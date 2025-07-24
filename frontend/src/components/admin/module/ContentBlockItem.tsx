import React from 'react';
import type { ContentBlock } from '../../../context/admin/UnitContext';
import VideoBlock from './VideoBlock';
import ArticleBlock from './ArticleBlock';
import QuizBlock from './QuizBlock';

export interface ContentBlockItemProps {
  unitNumber?: number;
  blockIndex?: number;
  id?: string;
  type: ContentBlock['type'];
  isOpen: boolean;
}

const ContentBlockItem: React.FC<ContentBlockItemProps> = ({
  unitNumber,
  blockIndex,
  id,
  type,
  isOpen,
}) => {
  if (!isOpen) return null;

  const fromContext = unitNumber != null && blockIndex != null;

  switch (type) {
    case 'video':
      return (
        <VideoBlock
          id={fromContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    case 'article':
      return (
        <ArticleBlock
          id={fromContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    case 'quiz':
      return (
        <QuizBlock
          id={fromContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    default:
      return <div className="p-4 text-error">Unsupported content type</div>;
  }
};

export default ContentBlockItem;
