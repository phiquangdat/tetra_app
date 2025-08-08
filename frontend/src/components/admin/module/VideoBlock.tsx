import React, { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import {
  fetchVideoContentById,
  type Video,
} from '../../../services/unit/unitApi';
import { validateVideoUrl } from '../../../utils/videoHelpers';
import { UploadAltIcon } from '../../common/Icons';
import ConfirmationModal from '../createModule/ConfirmationModal.tsx';

interface VideoBlockProps {
  unitNumber?: number;
  blockIndex?: number;
  id?: string;
}

const FallbackVideo = () => (
  <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-2xl">
    <UploadAltIcon />
    <span className="text-gray-500 text-lg font-medium">
      No video available
    </span>
  </div>
);

const VideoBlock: React.FC<VideoBlockProps> = ({
  unitNumber,
  blockIndex,
  id,
}) => {
  const { getUnitState, setUnitState, setEditingBlock, removeUnitContent } =
    useUnitContext();
  const unitContent =
    unitNumber != null && blockIndex != null
      ? getUnitState(unitNumber)?.content[blockIndex]
      : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const shouldUseContext =
    !!unitContent?.data?.url && !!unitContent?.data?.content;
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!shouldUseContext && id) {
      fetchVideoContentById(id)
        .then((fetched) => {
          setVideo(fetched);

          // Inject content into unit content
          if (unitNumber != null && blockIndex != null) {
            const unit = getUnitState(unitNumber);
            if (!unit) return;

            const updatedBlock = {
              ...unit.content[blockIndex],
              data: {
                ...unit.content[blockIndex].data,
                content: fetched.content,
                title: fetched.title,
                url: fetched.url,
              },
            };

            const updatedContent = [...unit.content];
            updatedContent[blockIndex] = updatedBlock;

            // Update context
            setUnitState(unitNumber, {
              content: updatedContent,
            });
          }
        })
        .catch(console.error);
    }
  }, [shouldUseContext, id]);

  const data = shouldUseContext
    ? unitContent!.data
    : {
        title: video?.title,
        content: video?.content,
        url: video?.url,
      };

  const { isValid, isYouTube, embedUrl } = validateVideoUrl(data?.url);

  const handleConfirmDelete = async () => {
    if (unitNumber != null && blockIndex != null) {
      const success = await removeUnitContent(unitNumber, blockIndex);
      if (success) {
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <div className="px-6 pb-4 text-primary text-base">
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm font-semibold">Video title</p>
          <p>{data?.title || 'No title available'}</p>
        </div>

        <div className="max-w-2xl mx-auto aspect-video rounded-2xl overflow-hidden shadow">
          {isValid ? (
            isYouTube ? (
              <iframe
                className="w-full h-full"
                src={embedUrl!}
                title={data?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full object-cover"
                src={embedUrl!}
                controls
              />
            )
          ) : (
            <FallbackVideo />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold">About</p>
          <p>{data?.content || 'No description provided'}</p>
        </div>

        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
            onClick={() => {
              if (unitNumber != null && blockIndex != null) {
                setEditingBlock({ unitNumber, blockIndex, type: 'video' });
              }
            }}
          >
            Edit
          </button>
          <button
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmationModal
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Video"
          description="Are you sure you want to delete this video? This action cannot be undone."
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default VideoBlock;
