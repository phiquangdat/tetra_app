import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  patchModuleProgress,
  type ContentProgress,
} from '../../../services/userProgress/userProgressApi';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { UploadAltIcon, CheckIcon } from '../../common/Icons';
import toast from 'react-hot-toast';
import { hydrateContextFromContent } from '../../../utils/contextHydration';

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
  const [hasNext, setHasNext] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;

  const {
    moduleId,
    unitId,
    goToNextContent,
    isNextContentAsync,
    moduleProgress,
    setModuleProgress,
    finalizeUnitIfComplete,
    setUnitId,
    setModuleId,
    getOrCreateModuleProgress,
  } = useModuleProgress();

  // Cache hydrated IDs for all later calls
  const idsRef = useRef<{ unitId?: string; moduleId?: string }>({});

  // Refs to access latest values without triggering effects
  const moduleProgressRef = useRef(moduleProgress);

  // Update refs when values change
  useEffect(() => {
    moduleProgressRef.current = moduleProgress;
  }, [moduleProgress]);

  // Helper: ensures module progress id exists before PATCH and updates context
  const safePatchModule = useCallback(
    async (payload: Parameters<typeof patchModuleProgress>[1]) => {
      const mid = idsRef.current.moduleId || moduleId;
      if (!mid) throw new Error('[safePatchModule] Missing moduleId');
      const mp = await getOrCreateModuleProgress(mid);
      const resp = await patchModuleProgress(mp.id, payload);
      setModuleProgress({
        id: resp.id,
        status: resp.status,
        last_visited_unit_id: resp.lastVisitedUnit?.id || '',
        last_visited_content_id: resp.lastVisitedContent?.id || '',
        earned_points: resp.earnedPoints || 0,
      });
      return resp;
    },
    [getOrCreateModuleProgress, moduleId, setModuleProgress],
  );

  const resolveUnitId = (v?: Video | null) =>
    unitIdFromState || unitId || v?.unit_id || '';

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isValid, isYouTube, embedUrl } = validateVideoUrl(video?.url);

  if (!video?.url) {
    console.warn('No Video URL provided');
  }

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await fetchVideoContentById(id);
        setVideo(data);
      }

      // Hydrate context if missing (after refresh) and cache IDs
      let effectiveUnitId = unitId || unitIdFromState || '';
      let effectiveModuleId = moduleId;

      if (!effectiveUnitId || !effectiveModuleId) {
        const hydrated = await hydrateContextFromContent(id, {
          setUnitId,
          setModuleId,
        });
        effectiveUnitId ||= hydrated.unitId;
        effectiveModuleId ||= hydrated.moduleId;
      }
      idsRef.current = { unitId: effectiveUnitId, moduleId: effectiveModuleId };

      try {
        const next = await isNextContentAsync(id);
        setHasNext(next);
      } catch {
        setHasNext(false);
      }

      try {
        const progress = await getContentProgress(id);
        console.log('[getContentProgress]', progress);

        setContentProgress(progress);

        const resolvedUnitId = resolveUnitId(video) || effectiveUnitId;

        if (
          (moduleProgress?.last_visited_unit_id !== resolvedUnitId ||
            moduleProgress?.last_visited_content_id !== id) &&
          progress.status !== 'COMPLETED'
        ) {
          try {
            const response = await safePatchModule({
              lastVisitedUnit: resolvedUnitId,
              lastVisitedContent: id,
            });

            console.log('[patchModuleProgress], Update IDs:', response);
          } catch (error) {
            console.error('[patchModuleProgress]', error);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('404')) {
          const resolvedUnitId = idsRef.current.unitId || resolveUnitId(video);

          const progress = await createContentProgress({
            unitId: resolvedUnitId as string,
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
  }, [
    id,
    unitIdFromState,
    unitId,
    moduleId,
    isNextContentAsync,
    moduleProgress,
    setUnitId,
    setModuleId,
    safePatchModule,
    setModuleProgress,
  ]);

  const markAsCompleted = useCallback(async () => {
    const currentModuleProgress = moduleProgressRef.current;

    if (
      !contentProgress ||
      contentProgress.status === 'COMPLETED' ||
      !currentModuleProgress ||
      !video
    )
      return;

    try {
      const response = await updateContentProgress(contentProgress.id, {
        status: 'COMPLETED',
        points: video.points || 0,
      });

      const resolvedUnitId = resolveUnitId(video) || idsRef.current.unitId!;
      await finalizeUnitIfComplete(
        resolvedUnitId,
        idsRef.current.moduleId || moduleId,
      );
      setContentProgress((prev) =>
        prev
          ? { ...prev, status: 'COMPLETED', points: video.points || 0 }
          : prev,
      );
      console.log('[updateContentProgress]', response);
      toast.success(`Complete watching! + ${video.points} points`);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    try {
      const response = await safePatchModule({
        earnedPoints:
          (currentModuleProgress.earned_points || 0) + (video.points || 0),
      });

      console.log('[patchModuleProgress], Update Total Points: ', response);
    } catch (error) {
      console.error(
        '[patchModuleProgress] Failed to increment module points',
        error,
      );
    }
  }, [contentProgress?.id]);

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

                  if (progress >= 90) {
                    clearInterval(progressIntervalRef.current!);
                    progressIntervalRef.current = null;
                    await markAsCompleted();
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
  }, [video?.url, contentProgress?.id, isValid, isYouTube, markAsCompleted]);

  const isButtonDisabled = contentProgress?.status !== 'COMPLETED';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl mb-6 text-left">
        <a
          onClick={() => navigate(`/user/unit/${resolveUnitId(video)}`)}
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

            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold shadow-sm">
              {contentProgress?.points ?? 0} PTS
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
        <div className="relative group">
          <button
            className="bg-surface text-background font-semibold px-12 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200 w-fit
            disabled:bg-surface/50 disabled:cursor-not-allowed"
            type="button"
            onClick={async () => {
              if (contentProgress?.status !== 'COMPLETED') {
                await markAsCompleted();
              }
              goToNextContent(id);
            }}
            disabled={isButtonDisabled}
            title={isButtonDisabled ? 'Finish the video to continue' : ''}
          >
            {hasNext ? 'Up next' : 'Finish'}
          </button>
          {isButtonDisabled && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Finish the video to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
