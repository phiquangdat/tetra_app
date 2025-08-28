import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateVideoUrl, getYouTubeId } from '../../../utils/videoHelpers';
import {
  fetchVideoContentById,
  fetchUnitById,
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
  const [playbackError, setPlaybackError] = useState(false);

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

  // Cache hydrated IDs for later calls
  const idsRef = useRef<{ unitId?: string; moduleId?: string }>({});

  // Keep latest moduleProgress for async
  const moduleProgressRef = useRef(moduleProgress);
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

  // Flag no-URL as playback error immediately
  useEffect(() => {
    if (!video) return;
    if (!video.url) {
      console.warn('No Video URL provided');
      setPlaybackError(true);
    }
  }, [video?.url]);

  const ensureIds = useCallback(async () => {
    let u =
      idsRef.current.unitId ||
      unitId ||
      unitIdFromState ||
      video?.unit_id ||
      '';
    let m = idsRef.current.moduleId || moduleId || '';

    // If we have unitId but no moduleId, fetch the unit to derive moduleId
    if (u && !m) {
      try {
        const unit = await fetchUnitById(u);
        m = (unit as any).moduleId || (unit as any).module_id || '';
        if (m) setModuleId(m);
      } catch (e) {
        console.warn('[ensureIds] fetchUnitById failed:', e);
      }
    }

    // If still missing either, fall back to hydrateContextFromContent
    if (!u || !m) {
      try {
        const hydrated = await hydrateContextFromContent(id, {
          setUnitId,
          setModuleId,
        });
        u ||= hydrated.unitId;
        m ||= hydrated.moduleId;
      } catch (e) {
        console.warn('[ensureIds] hydrateContextFromContent failed:', e);
      }
    }

    // Write back into refs and context if we resolved anything
    if (u && !unitId) setUnitId(u);
    if (m && !moduleId) setModuleId(m);
    idsRef.current = { unitId: u || undefined, moduleId: m || undefined };

    if (!u || !m) {
      console.warn('[ensureIds] Missing ids after hydration', { u, m });
    }
    return { unitId: u, moduleId: m };
  }, [
    id,
    moduleId,
    setModuleId,
    setUnitId,
    unitId,
    unitIdFromState,
    video?.unit_id,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const data = await fetchVideoContentById(id);
        setVideo(data);
        // Immediately flag as error if there’s no URL
        if (!data?.url) setPlaybackError(true);
      }

      await ensureIds();

      try {
        const next = await isNextContentAsync(id);
        setHasNext(next);
      } catch {
        setHasNext(false);
      }

      let progress: ContentProgress | undefined;
      try {
        progress = await getContentProgress(id);
      } catch (error: any) {
        if (String(error?.message ?? '').includes('404')) {
          try {
            const ids = await ensureIds();
            const resolvedUnitId =
              ids.unitId || resolveUnitId(video) || idsRef.current.unitId;
            if (resolvedUnitId) {
              progress = await createContentProgress({
                unitId: resolvedUnitId as string,
                unitContentId: id,
                status: 'IN_PROGRESS',
                points: 0,
              });
            } else {
              console.warn(
                '[VideoPage] Unable to create content progress: missing unitId',
              );
            }
          } catch (e) {
            console.error('[VideoPage] createContentProgress failed:', e);
          }
        } else {
          console.error(error);
        }
      }

      if (progress) {
        setContentProgress(progress);

        const ids = idsRef.current;
        const resolvedUnitId =
          ids.unitId || resolveUnitId(video) || unitIdFromState || unitId;

        if (
          resolvedUnitId &&
          (moduleProgress?.last_visited_unit_id !== resolvedUnitId ||
            moduleProgress?.last_visited_content_id !== id) &&
          String(progress.status || '').toUpperCase() !== 'COMPLETED'
        ) {
          try {
            await safePatchModule({
              lastVisitedUnit: resolvedUnitId,
              lastVisitedContent: id,
              // status omitted intentionally to respect your backend state machine
            });
          } catch (error) {
            console.error('[patchModuleProgress]', error);
          }
        }
      }
    };

    fetchData();
  }, [
    id,
    isNextContentAsync,
    moduleProgress,
    safePatchModule,
    setModuleProgress,
    ensureIds,
  ]);

  useEffect(() => {
    if (!video) return;
    if (!isValid) setPlaybackError(true);
  }, [video?.url, isValid]);

  const ensureContentProgress = useCallback(async () => {
    if (contentProgress) return contentProgress;

    try {
      const existing = await getContentProgress(id);
      setContentProgress(existing);
      return existing;
    } catch (e: any) {
      if (!String(e?.message ?? '').includes('404')) {
        // non-404 -> bubble up
        throw e;
      }
    }

    const ids = await ensureIds();
    const resolvedUnitId = ids.unitId || resolveUnitId(video);
    if (!resolvedUnitId)
      throw new Error('[ensureContentProgress] missing unitId');

    const created = await createContentProgress({
      unitId: resolvedUnitId as string,
      unitContentId: id,
      status: 'IN_PROGRESS',
      points: 0,
    });
    setContentProgress(created);
    return created;
  }, [contentProgress, id, video, ensureIds]);

  const markAsCompleted = useCallback(async () => {
    const currentModuleProgress = moduleProgressRef.current;
    if (!video) return;

    const cp = await ensureContentProgress();
    if (cp.status === 'COMPLETED' || !currentModuleProgress) return;

    const videoPoints = video.points ?? 0;

    try {
      const response = await updateContentProgress(cp.id, {
        status: 'COMPLETED',
        points: videoPoints,
      });

      const ids = await ensureIds();
      const resolvedUnitId = ids.unitId || resolveUnitId(video);
      if (resolvedUnitId) {
        await finalizeUnitIfComplete(resolvedUnitId, ids.moduleId || moduleId);
      }

      setContentProgress((prev) =>
        prev ? { ...prev, status: 'COMPLETED', points: videoPoints } : prev,
      );
      console.log('[updateContentProgress]', response);
      toast.success(`Complete watching! + ${videoPoints} pts`);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    try {
      if (videoPoints > 0) {
        const response = await safePatchModule({
          earnedPoints:
            (currentModuleProgress.earned_points || 0) + videoPoints,
        });
        console.log('[patchModuleProgress], Update Total Points: ', response);
      }
    } catch (error) {
      console.error(
        '[patchModuleProgress] Failed to increment module points',
        error,
      );
    }
  }, [
    ensureContentProgress,
    ensureIds,
    finalizeUnitIfComplete,
    moduleId,
    video,
  ]);

  // Force-complete (0 pts) when video is unavailable or has no URL
  const forceCompleteDueToError = useCallback(async () => {
    try {
      const cp = await ensureContentProgress();
      if (cp.status !== 'COMPLETED') {
        await updateContentProgress(cp.id, { status: 'COMPLETED', points: 0 });

        const ids = await ensureIds();
        const resolvedUnitId = ids.unitId || resolveUnitId(video);
        if (resolvedUnitId) {
          await finalizeUnitIfComplete(
            resolvedUnitId,
            ids.moduleId || moduleId,
          );
        }

        setContentProgress((prev) =>
          prev ? { ...prev, status: 'COMPLETED', points: 0 } : cp,
        );
        toast.error('Video unavailable. Marked as complete without points.');
      }
    } catch (err) {
      console.error('[forceCompleteDueToError] failed:', err);
    }
  }, [
    ensureContentProgress,
    ensureIds,
    finalizeUnitIfComplete,
    moduleId,
    video,
  ]);

  useEffect(() => {
    const rawUrl = video?.url;

    if (!rawUrl) {
      setPlaybackError(true);
      return;
    }
    if (!isValid) {
      setPlaybackError(true);
      return;
    }

    // Non-YouTube but valid: let the <video> element handle real playback errors.
    if (!isYouTube) {
      setPlaybackError(false);
      return;
    }

    const ytId = getYouTubeId(rawUrl);
    if (!ytId) {
      setPlaybackError(true);
      return;
    }

    // At this point we have a valid YouTube ID — clear any previous error
    setPlaybackError(false);

    const loadYouTubeAPI = () =>
      new Promise<void>((resolve) => {
        if (window.YT?.Player) {
          resolve();
          return;
        }

        window.onYouTubeIframeAPIReady = resolve;
      });

    const initPlayer = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }

      try {
        playerRef.current = new window.YT.Player('youtube', {
          videoId: ytId,
          playerVars: { controls: 1, modestbranding: 1, rel: 0 },
          events: {
            onError: (event: any) => {
              console.warn('[YouTube] onError:', event?.data);
              setPlaybackError(true);
            },
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
      } catch (e) {
        console.warn('[YouTube] Player init failed:', e);
        setPlaybackError(true);
      }
    };

    loadYouTubeAPI().then(initPlayer);

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [video?.url, isValid, isYouTube, markAsCompleted]);

  const isButtonDisabled =
    contentProgress?.status !== 'COMPLETED' && !playbackError;

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

      {playbackError && (
        <div className="mb-4 w-full max-w-4xl">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            The video is unavailable right now. You can continue without points.
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
              onError={() => setPlaybackError(true)}
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
            className="bg-surface text-background font-semibold px-12 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200 w-fit disabled:bg-surface/50 disabled:cursor-not-allowed"
            type="button"
            onClick={async () => {
              const ids = await ensureIds();

              await ensureContentProgress();

              if (playbackError && contentProgress?.status !== 'COMPLETED') {
                await forceCompleteDueToError();
              } else if (contentProgress?.status !== 'COMPLETED') {
                await markAsCompleted();
              }

              await goToNextContent(id, {
                unitId: ids.unitId,
                moduleId: ids.moduleId,
              });
            }}
            disabled={isButtonDisabled}
            title={
              isButtonDisabled
                ? 'Finish the video to continue'
                : playbackError
                  ? 'Video unavailable — continue without points'
                  : ''
            }
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
