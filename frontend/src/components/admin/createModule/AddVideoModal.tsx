import { useState, useCallback } from 'react';
import {
  CloseIcon,
  VideoHeaderIcon,
  VideoUploadIcon,
} from '../../common/Icons';

type Video = {
  title: string;
  description: string;
  videoUrl: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: Video) => void;
};

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.*[?&]v=|v\/|e\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function AddVideoModal({ isOpen, onClose, onSave }: Props) {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const resetForm = () => {
    setVideoTitle('');
    setVideoDescription('');
    setVideoUrl('');
  };

  const handleSave = () => {
    onSave({
      title: videoTitle,
      description: videoDescription,
      videoUrl: videoUrl,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isYouTubeUrl = useCallback(
    (url: string) => YOUTUBE_REGEX.test(url),
    [],
  );

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }, []);

  const renderVideoFile = () => {
    const isValidUrl =
      videoUrl && (videoUrl.endsWith('.mp4') || isYouTubeUrl(videoUrl));

    return (
      <div className="text-gray-500 text-center flex flex-col items-center">
        {isValidUrl ? (
          isYouTubeUrl(videoUrl) ? (
            <div className="w-full">
              <iframe
                width="100%"
                height="315"
                src={getYouTubeEmbedUrl(videoUrl) ?? undefined}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full">
              <video
                className="w-full h-auto rounded-md shadow-lg"
                controls
                src={videoUrl}
              />
            </div>
          )
        ) : (
          <>
            <div className="text-gray-600">
              <VideoUploadIcon />
            </div>
            <div className="mt-4 text-sm">
              <input
                type="url"
                placeholder="https://example.com/video.mp4 or YouTube URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="min-w-90 px-4 py-2 text-sm border-2 border-gray-400 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Paste the video URL here (MP4 or YouTube)
            </div>
          </>
        )}

        {isValidUrl && (
          <button
            type="button"
            onClick={() => setVideoUrl('')}
            className="my-4 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
          >
            Change Video
          </button>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div>
      <div
        className="fixed inset-0 flex items-center justify-center z-10 p-4 overflow-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
            >
              {<CloseIcon />}
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
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div className="mb-6 max-w-110 min-h-40 h-auto border border-gray-400 rounded-lg p-4 pb-0">
              {renderVideoFile()}
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
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Enter video description..."
                className="w-full h-40 px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                required
              />
            </div>

            <div className="flex justify-end p-6 pt-0">
              <button
                type="button"
                aria-label="Save Video"
                onClick={handleSave}
                className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 w-24 h-10"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVideoModal;
