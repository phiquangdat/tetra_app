import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateVideoUrl } from '../../../utils/videoHelpers';
import {
  fetchVideoContentById,
  type Video,
} from '../../../services/unit/unitApi';
import {
  getContentProgress,
  createContentProgress,
  type ContentProgress,
} from '../../../services/userProgress/userProgressApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext.tsx';
import { UploadAltIcon, CheckIcon } from '../../common/Icons';

const FallbackVideo = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
    <UploadAltIcon />

    <span className="text-gray-500 text-lg font-medium">
      No video available
    </span>
  </div>
);

interface VideoPageProps {
  id: string;
}

const VideoPage: React.FC<VideoPageProps> = ({ id }: VideoPageProps) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [contentProgress, setContentProgress] = useState<ContentProgress>();
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;
  const { goToNextContent, isNextContent } = useModuleProgress();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        fetchVideoContentById(id).then((data) => setVideo(data));
      }

      try {
        const progress = await getContentProgress(id);
        console.log('[getContentProgress]', progress);

        setContentProgress(progress);
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          const progress = await createContentProgress({
            unitId: unitIdFromState as string,
            unitContentId: id,
            status: 'IN_PROGRESS',
            points: 0,
          });
          console.log('[createContentProgress]', progress);

          setContentProgress(progress);
        } else {
          console.error(error);
        }
      }
    };

    fetchData();
  }, [id]);

  const { isValid, isYouTube, embedUrl } = validateVideoUrl(video?.url);

  if (!video?.url) {
    console.warn('No Video URL provided');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl mb-6 text-left">
        <a
          onClick={() => navigate(`/user/unit/${unitIdFromState}`)}
          className="inline-flex items-center text-secondary hover:text-primary px-3 py-1 rounded-lg hover:bg-cardBackground hover:border hover:border-highlight active:bg-highlight transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      {contentProgress?.status?.toLocaleLowerCase() == 'completed' && (
        <div className="mb-6 bg-green-50 max-w-xl mx-auto border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <CheckIcon width={16} height={16} color="white" />
            </div>
            <div className="flex-1">
              <span className="text-green-600 text-sm">
                You've viewed this before. Feel free to review it again!
              </span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-white text-green-700 rounded-full text-sm font-medium border border-green-200 shadow-sm">
              + {contentProgress.points} pts
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-extrabold mb-8 text-primary text-center">
        {video?.title}
      </h1>
      <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-xl bg-cardBackground flex items-center justify-center">
        {isValid ? (
          isYouTube ? (
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title={video?.title}
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="w-full h-full object-cover"
              src={embedUrl}
              controls
            >
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <FallbackVideo />
        )}
      </div>

      <div className="w-full max-w-4xl text-left mt-8">
        <h2 className="text-xl text-primary font-bold ml-4 mb-4">About</h2>
        <div className="bg-cardBackground rounded-3xl p-6 text-primary/90 text-base leading-relaxed shadow-sm">
          {video?.content}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 flex justify-end">
        <button
          className="bg-surface text-background font-semibold px-12 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200 w-fit"
          type="button"
          onClick={() => goToNextContent(id)}
        >
          {isNextContent(id ?? '') ? 'Up next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default VideoPage;
