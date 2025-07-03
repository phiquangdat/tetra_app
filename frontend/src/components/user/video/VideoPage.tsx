import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateVideoUrl } from '../../../utils/videoHelpers';
import {
  fetchVideoContentById,
  type Video,
} from '../../../services/unit/unitApi';
import { useUnitContent } from '../../../context/user/UnitContentContext';
import { UploadAltIcon } from '../../common/Icons';

const FallbackVideo = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
    {UploadAltIcon}

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
  const { goToNextContent } = useUnitContent();

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
          onClick={() => goToNextContent(id)}
        >
          Up next
        </button>
      </div>
    </div>
  );
};

export default VideoPage;
