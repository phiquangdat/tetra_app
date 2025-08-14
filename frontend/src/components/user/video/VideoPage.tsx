import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateVideoUrl, getYouTubeId } from '../../../utils/videoHelpers';
import {
  fetchVideoContentById,
  type Video,
} from '../../../services/unit/unitApi';
import {
  getContentProgress,
  createContentProgress,
  updateContentProgress,
  type ContentProgress,
} from '../../../services/userProgress/userProgressApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext.tsx';
import { UploadAltIcon, CheckIcon } from '../../common/Icons';

declare global {
  var YT: any;
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isValid, isYouTube, embedUrl } = validateVideoUrl(video?.url);

  if (!video?.url) {
    console.warn('No Video URL provided');
  }

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
  }, [id, unitIdFromState]);

  const markAsCompleted = async () => {
    if (!(contentProgress && contentProgress.status !== 'COMPLETED')) return;

    try {
      const response = await updateContentProgress(contentProgress.id, {
        status: 'COMPLETED',
      });
      setContentProgress((prev) =>
        prev ? { ...prev, status: 'COMPLETED' } : prev,
      );
      console.log('[updateContentProgress]', response);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    if (!video?.url || !isValid || !isYouTube) return;

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT?.Player) {
          resolve();
          return;
        }

        window.onYouTubeIframeAPIReady = resolve;
      });
    };

    const initPlayer = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube', {
        videoId: getYouTubeId(video.url),
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
              }

              progressIntervalRef.current = setInterval(async () => {
                const currentTime = playerRef.current?.getCurrentTime();
                const duration = playerRef.current?.getDuration();

                if (duration > 0) {
                  const progress = Math.round((currentTime / duration) * 100);

                  if (progress >= 90 && contentProgress) {
                    clearInterval(progressIntervalRef.current!);
                    progressIntervalRef.current = null;

                    markAsCompleted();
                  }
                }
              }, 1000);
            }

            if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
            }
          },
        },
      });
    };

    loadYouTubeAPI().then(initPlayer);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [video?.url, contentProgress?.id]);

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

      {contentProgress?.status?.toLowerCase() === 'completed' && (
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
            <div
              id="youtube"
              className="w-full h-full border-none"
              title={video?.title}
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
          onClick={() => {
            markAsCompleted();
            goToNextContent(id);
          }}
        >
          {isNextContent(id ?? '') ? 'Up next' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default VideoPage;
