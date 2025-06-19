import { useState, useCallback } from 'react';

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

const icons = {
  videoHeader: (
    <svg
      className="svg-icon"
      style={{
        width: '1em',
        height: '1em',
        verticalAlign: 'middle',
        fill: 'currentColor',
        overflow: 'hidden',
      }}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M39.384615 1024V0h945.23077v1024H39.384615zM196.923077 78.769231H118.153846v78.769231h78.769231V78.769231z m0 157.538461H118.153846v78.769231h78.769231V236.307692z m0 157.538462H118.153846v78.769231h78.769231v-78.769231z m0 157.538461H118.153846v78.769231h78.769231v-78.769231z m0 157.538462H118.153846v78.769231h78.769231v-78.769231z m0 157.538461H118.153846v78.769231h78.769231v-78.769231zM748.307692 78.769231H275.692308v393.846154h472.615384V78.769231z m0 472.615384H275.692308v393.846154h472.615384V551.384615z m157.538462-472.615384h-78.769231v78.769231h78.769231V78.769231z m0 157.538461h-78.769231v78.769231h78.769231V236.307692z m0 157.538462h-78.769231v78.769231h78.769231v-78.769231z m0 157.538461h-78.769231v78.769231h78.769231v-78.769231z m0 157.538462h-78.769231v78.769231h78.769231v-78.769231z m0 157.538461h-78.769231v78.769231h78.769231v-78.769231z" />
    </svg>
  ),
  videoUpload: (
    <svg
      className="svg-icon"
      style={{
        width: '2em',
        height: '2em',
        verticalAlign: 'middle',
        overflow: 'hidden',
      }}
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path
        d="M960 192h-28.384c-16.8 0-32.928 6.624-44.928 18.432L800 295.936V256a96 96 0 0 0-96-96H96C43.072 160 0 203.04 0 256v512a96 96 0 0 0 96 96h608c52.992 0 96-43.008 96-96v-39.072l86.688 85.504c12 11.808 28.128 18.432 44.928 18.432H960a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64zM96 800c-17.664 0-32-14.368-32-32V256a32 32 0 0 1 32-32h608c17.632 0 32 14.336 32 32v512c0 17.632-14.368 32-32 32H96z m864-31.136h-32l-128-128V640l-32-32v-192l160-160h32v512.864z"
        className="text-gray-600"
        fill="currentColor"
      />
    </svg>
  ),
  close: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

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
    []
  );

  const getYouTubeEmbedUrl = useCallback(
    (url: string) => {
      const match = url.match(YOUTUBE_REGEX);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    },
    []
  );

  const renderVideoFile = () => {
    const isValidUrl = videoUrl && (videoUrl.endsWith('.mp4') || isYouTubeUrl(videoUrl));

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
            {icons.videoUpload}
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
              <div className="text-gray-600">{icons.videoHeader}</div>
              <h2 className="text-lg font-medium text-gray-900">Video</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {icons.close}
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
