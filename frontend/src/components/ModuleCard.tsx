import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
  id: React.Key | null | undefined;
  title: string;
  topic: string;
  points: number;
  coverUrl: string;
}

function ModuleCard({ id, title, topic, points, coverUrl }: ModuleCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/modules/${id}`);
  };

  return (
    <div className="flex items-center bg-gray-50 rounded-3xl w-125 h-54 shadow-lg shadow-gray-300">
      {/* Cover Image */}
      <div className="w-62 h-54 rounded-s-3xl overflow-hidden">
        <div className="w-full h-full">
          {imgError ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-black text-sm">Image not available</span>
            </div>
          ) : (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-62 h-54 border-l-2 border-gray-300 flex flex-col justify-between">
        <div className="text-start mt-4 ml-4 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-black">{title}</h2>
          <p className="text-base text-black">
            <span>Topic:</span> {topic}
          </p>
          <p className="text-base text-black">
            <span>Earn:</span> {points} points
          </p>
        </div>

        {/* View Button */}
        <div className="flex justify-end mb-4 mr-4">
          <button
            onClick={handleViewClick}
            className="w-30 h-10 cursor-pointer bg-blue-200 hover:bg-blue-400 text-black font-semibold px-8 rounded-full transition-colors duration-200 flex items-center justify-center"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;
