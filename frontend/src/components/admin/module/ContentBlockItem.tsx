import React from 'react';
import VideoBlock from './VideoBlock';
import ArticleBlock from './ArticleBlock';
import QuizBlock from './QuizBlock';

interface ContentBlockItemProps {
  id: string;
  type: string;
  isOpen: boolean;
}

const ContentBlockItem: React.FC<ContentBlockItemProps> = ({
  id,
  type,
  isOpen,
}) => {
  if (!isOpen) return null;

  switch (type) {
    case 'video':
      return <VideoBlock id={id} />;
    case 'article':
      return <ArticleBlock id={id} />;
    case 'quiz':
      return <QuizBlock id={id} />;
    default:
      return <div className="p-4 text-error">Unsupported content type</div>;
  }
};

export default ContentBlockItem;
