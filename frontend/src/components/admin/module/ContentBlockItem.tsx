import React from 'react';
import {
  type ContentBlock,
  useUnitContext,
} from '../../../context/admin/UnitContext';
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
  const { getUnitState } = useUnitContext();

  const fromContext = unitNumber != null && blockIndex != null;
  const isContentInContext =
    fromContext && unitNumber != null && blockIndex != null;
  const unitContent = isContentInContext
    ? getUnitState(unitNumber!)?.content[blockIndex!]
    : null;

  const shouldUseContext = unitContent && unitContent.data?.content;

  switch (type) {
    case 'video':
      return (
        <VideoBlock
          id={shouldUseContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    case 'article':
      return (
        <ArticleBlock
          id={shouldUseContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    case 'quiz':
      return (
        <QuizBlock
          id={shouldUseContext ? undefined : id!}
          unitNumber={unitNumber}
          blockIndex={blockIndex}
        />
      );
    default:
      return <div className="p-4 text-error">Unsupported content type</div>;
  }
};

export default ContentBlockItem;
