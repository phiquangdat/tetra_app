import React, { useEffect, useState } from 'react';
import {
  fetchVideoContentById,
  type Video,
} from '../../../services/unit/unitApi';
import { validateVideoUrl } from '../../../utils/videoHelpers';
import { UploadAltIcon } from '../../common/Icons';

interface VideoBlockProps {
  id: string;
}

const FallbackVideo = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
    <UploadAltIcon />
    <span className="text-gray-500 text-lg font-medium">
      No video available
    </span>
  </div>
);

const VideoBlock: React.FC<VideoBlockProps> = ({ id }) => {
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideoContentById(id).then(setVideo).catch(console.error);
  }, [id]);

  const { isValid, isYouTube, embedUrl } = validateVideoUrl(video?.url);

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Video title</p>
          <p>{video?.title || 'No title available'}</p>
        </div>

        <div className="aspect-video rounded-2xl overflow-hidden shadow">
          {isValid ? (
            isYouTube ? (
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title={video?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full object-cover"
                src={embedUrl}
                controls
              />
            )
          ) : (
            <FallbackVideo />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">About</p>
          <p>{video?.content || 'No description provided'}</p>
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm">
            Edit
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoBlock;
