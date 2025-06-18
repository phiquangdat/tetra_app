import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateVideoUrl } from '../utils/videoHelpers';
import { fetchVideoContentById, type Video } from '../services/unit/unitApi';

const FallbackVideo = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
    <svg
      className="w-24 h-24 text-gray-400 mb-4"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      strokeWidth={1}
    >
      <path d="M918.613333 305.066667a42.666667 42.666667 0 0 0-42.666666 0L725.333333 379.306667A128 128 0 0 0 597.333333 256H213.333333a128 128 0 0 0-128 128v256a128 128 0 0 0 128 128h384a128 128 0 0 0 128-123.306667l151.893334 75.946667A42.666667 42.666667 0 0 0 896 725.333333a42.666667 42.666667 0 0 0 22.613333-6.4A42.666667 42.666667 0 0 0 938.666667 682.666667V341.333333a42.666667 42.666667 0 0 0-20.053334-36.266666zM640 640a42.666667 42.666667 0 0 1-42.666667 42.666667H213.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V384a42.666667 42.666667 0 0 1 42.666666-42.666667h384a42.666667 42.666667 0 0 1 42.666667 42.666667z m213.333333-26.453333l-128-64v-75.093334l128-64z" />
    </svg>

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
  const navigate = useNavigate();
  const location = useLocation();
  const unitIdFromState = (location.state as { unitId?: string })?.unitId;

  useEffect(() => {
    if (id) {
      fetchVideoContentById(id).then((data) => setVideo(data));
    }
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
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Unit page
        </a>
      </div>

      <h1 className="text-3xl font-semibold mb-6 text-center">
        {video?.title}
      </h1>
      <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-lg">
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

      <div className="w-full max-w-4xl text-left mt-5">
        <h2 className="text-xl font-bold ml-4 mb-4">About</h2>
        <div className="bg-gray-200 rounded-3xl p-6 text-gray-700 text-base shadow-sm">
          {video?.content}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 flex justify-end">
        <button
          className="bg-blue-200 font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit"
          type="button"
        >
          Up next
        </button>
      </div>
    </div>
  );
};

export default VideoPage;
