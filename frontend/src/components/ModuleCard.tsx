import { useState } from 'react';

interface ModuleCardProps {
  title: string;
  topic: string;
  points: number;
  coverUrl: string;
}

function ModuleCard({ title, topic, points, coverUrl }: ModuleCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center border-2 border-blue-500 bg-gray-50 rounded-lg p-6 max-w-4xl w-150 h-50">
      {/* Cover Image */}
      <div className="flex-shrink-0 w-24 h-24 mr-8">
        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
          {imgError ? (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
              <span className="text-white text-sm">Image not available</span>
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
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
        <p className="text-lg text-gray-700 mb-1">
          <span className="font-medium">Topic:</span> {topic}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-medium">Earn:</span> {points} points
        </p>
      </div>

      {/* View Button */}
      <div className="flex-shrink-0 ml-8">
        <button className="bg-blue-300 hover:bg-blue-400 text-black font-medium py-3 px-8 rounded-full transition-colors duration-200">
          View
        </button>
      </div>
    </div>
  );
}

export default ModuleCard;
