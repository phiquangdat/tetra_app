import { useCallback, useEffect, useRef } from 'react';
import {
  CloseIcon,
  VideoHeaderIcon,
  VideoUploadIcon,
} from '../../common/Icons';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';

type Video = {
  title: string;
  content: string;
  url: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (video: Video) => void;
  unitId: string;
  unitNumber: number;
};

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.*[?&]v=|v\/|e\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function AddVideoModal({
  isOpen,
  onClose,
  onAddContent,
  unitId,
  unitNumber,
}: Props) {
  const {
    data,
    updateContentField,
    saveContent,
    isSaving,
    clearContent,
    setContentState,
    isDirty,
  } = useContentBlockContext();
  const { addContentBlock, removeContentBlock } = useUnitContext();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setContentState({
        unit_id: unitId,
        type: 'video',
        sortOrder: 0,
        isDirty: true,
        isSaving: false,
        error: null,
      });
    }
  }, [isOpen]);

  const isYouTubeUrl = useCallback(
    (url: string) => YOUTUBE_REGEX.test(url),
    [],
  );
  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }, []);

  const isValidUrl =
    data.url && (data.url.endsWith('.mp4') || isYouTubeUrl(data.url));
  const canSave =
    data.title.trim() !== '' &&
    (data.content?.trim() ?? '') !== '' &&
    isValidUrl &&
    !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      await saveContent('video');

      addContentBlock(unitNumber, {
        type: 'video',
        data: {
          title: data.title.trim(),
          content: data.content?.trim() ?? '',
          url: data.url?.trim() ?? '',
        },
        sortOrder: 0,
        unit_id: unitId,
        isDirty: false,
        isSaving: false,
        error: null,
      });

      onAddContent({
        title: data.title.trim(),
        content: data.content?.trim() ?? '',
        url: data.url?.trim() ?? '',
      });

      clearContent();
      onClose();
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleClose = () => {
    if (isDirty && !isSaving) {
      removeContentBlock(unitNumber, -1);
    }
    clearContent();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const renderVideoInput = () => (
    <>
      <div className="text-gray-600">
        <VideoUploadIcon />
      </div>
      <div className="mt-4 text-sm">
        <input
          type="url"
          placeholder="https://example.com/video.mp4 or YouTube URL"
          value={data.url}
          onChange={(e) =>
            updateContentField('data', {
              ...data,
              url: e.target.value,
            })
          }
          className="min-w-90 px-4 py-2 text-sm border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="mt-2 text-sm text-gray-400">
        Paste the video URL here (MP4 or YouTube)
      </div>
    </>
  );

  const renderPreview = () =>
    isYouTubeUrl(data.url ?? '') ? (
      <iframe
        width="100%"
        height="315"
        src={getYouTubeEmbedUrl(data.url ?? '') ?? undefined}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={data.title || 'Video preview'}
        aria-label="video preview"
      />
    ) : (
      <video
        className="w-full h-auto rounded-md shadow-lg"
        controls
        src={data.url}
      />
    );

  const renderVideoBlock = () => (
    <div className="text-gray-500 text-center flex flex-col items-center">
      {isValidUrl ? renderPreview() : renderVideoInput()}
      {isValidUrl && (
        <button
          type="button"
          onClick={() =>
            updateContentField('data', {
              ...data,
              url: '',
            })
          }
          className="my-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          disabled={isSaving}
        >
          Change Video
        </button>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div>
      <div
        className="fixed inset-0 flex items-center justify-center z-10 p-4 overflow-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="text-gray-600">
                <VideoHeaderIcon />
              </div>
              <h2 className="text-lg font-medium text-gray-900">Video</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={isSaving}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="p-6 pb-0 flex flex-col h-full">
            <div className="mb-6 max-w-110">
              <label
                htmlFor="videoTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="videoTitle"
                value={data.title}
                onChange={(e) =>
                  updateContentField('data', {
                    ...data,
                    title: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
                disabled={isSaving}
              />
            </div>

            <div className="mb-6 max-w-110 min-h-40 h-auto border border-gray-400 rounded-lg p-4 pb-0">
              {renderVideoBlock()}
            </div>

            <div className="mb-6 max-w-full">
              <label
                htmlFor="videoDescription"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="videoDescription"
                value={data.content}
                onChange={(e) =>
                  updateContentField('data', {
                    ...data,
                    content: e.target.value,
                  })
                }
                placeholder="Enter video description..."
                className="w-full h-40 px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                required
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end p-6 pt-0">
              <button
                type="button"
                aria-label="Save Video"
                onClick={handleSave}
                className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 w-24 h-10"
                disabled={!canSave || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVideoModal;
