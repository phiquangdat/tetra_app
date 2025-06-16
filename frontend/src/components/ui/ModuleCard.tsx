import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface CardDetail {
  label: string;
  value: string | number;
}

interface CardProps {
  id: React.Key | null | undefined;
  title: string;
  coverUrl: string;
  details: CardDetail[];
  buttonLabel: string;
  linkBasePath: string;
}

function ModuleCard({
  id,
  title,
  coverUrl,
  details,
  buttonLabel,
  linkBasePath,
}: CardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!coverUrl || coverUrl.trim() === '') {
      setImgError(true);
    }
  }, [coverUrl]);

  const handleClick = () => {
    if (id == null) return;
    navigate(`${linkBasePath}/${id}`);
  };

  return (
    <div className="flex items-center bg-gray-50 rounded-3xl w-125 h-54 shadow-lg shadow-gray-300">
      {/* Cover Image */}
      <div className="w-62 h-54 rounded-s-3xl overflow-hidden">
        <div className="w-full h-full">
          {imgError || !coverUrl || coverUrl.trim() === '' ? (
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
          {details.map((detail, idx) => (
            <p className="text-base text-black" key={idx}>
              <span>{detail.label}:</span> {detail.value}
            </p>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-4 mr-4">
          <button
            onClick={handleClick}
            className="w-30 h-10 cursor-pointer bg-blue-200 hover:bg-blue-400 text-black font-semibold px-8 rounded-full transition-colors duration-200 flex items-center justify-center"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;
