import React, { useEffect, useState } from 'react';
import {
  fetchVideoContentById,
  fetchArticleContentById,
  type Video,
  type Article,
} from '../../../services/unit/unitApi';
import {
  VideoIcon,
  BookIcon,
  PuzzleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../common/Icons';

interface ContentBlockItemProps {
  contentId: string;
  contentType: 'video' | 'article' | 'quiz';
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

const ContentBlockItem: React.FC<ContentBlockItemProps> = ({
  contentId,
  contentType,
  title,
  isOpen,
  onToggle,
}) => {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [articleData, setArticleData] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadContentDetails = async () => {
    setError('');
    setLoading(true);

    try {
      if (contentType === 'video') {
        const data = await fetchVideoContentById(contentId);
        setVideoData(data);
      } else if (contentType === 'article') {
        const data = await fetchArticleContentById(contentId);
        setArticleData(data);
      }
    } catch (err) {
      setError('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !videoData && !articleData) {
      loadContentDetails();
    }
  }, [isOpen]);

  const renderContentIcon = () => {
    switch (contentType) {
      case 'video':
        return <VideoIcon width={20} height={20} />;
      case 'article':
        return <BookIcon width={20} height={20} />;
      case 'quiz':
        return <PuzzleIcon width={20} height={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-[#D4C2FC] rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-4 font-semibold text-[#231942] flex justify-between items-center hover:bg-[#EFE8FF] transition"
      >
        <span className="flex items-center gap-2">
          {renderContentIcon()}
          {`${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${title}`}
        </span>
        <span>
          {isOpen ? (
            <ChevronUpIcon width={20} height={20} />
          ) : (
            <ChevronDownIcon width={20} height={20} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 text-[#231942] text-base">
          {loading && <p>Loading content...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {contentType === 'video' && videoData && (
            <div className="space-y-4 mt-2">
              <div>
                <p className="font-semibold">Title</p>
                <p>{videoData.title}</p>
              </div>
              <div>
                <p className="font-semibold">Video Preview</p>
                <video controls className="w-full rounded-xl shadow">
                  <source src={videoData.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <p>{videoData.content}</p>
              </div>
            </div>
          )}

          {contentType === 'article' && articleData && (
            <div className="space-y-4 mt-2">
              <div>
                <p className="font-semibold">Title</p>
                <p>{articleData.title}</p>
              </div>
              <div>
                <p className="font-semibold">Content</p>
                <div
                  className="prose prose-sm max-w-none text-[#231942]"
                  dangerouslySetInnerHTML={{ __html: articleData.content }}
                />
              </div>
            </div>
          )}

          {contentType === 'quiz' && (
            <div className="text-sm italic text-[#998FC7] mt-2">
              Quiz preview coming soon...
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <button className="px-4 py-2 bg-red-200 text-red-800 rounded-lg hover:bg-red-300 font-medium">
              Delete
            </button>
            <button className="px-4 py-2 bg-[#998FC7] text-white rounded-lg hover:bg-[#7d6bb3] font-medium">
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentBlockItem;
