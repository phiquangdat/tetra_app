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
  earnedPoints?: number;
  progressStatus?: 'IN_PROGRESS' | 'COMPLETED';
}

function ModuleCard({
  id,
  title,
  coverUrl,
  details,
  buttonLabel,
  linkBasePath,
  earnedPoints,
  progressStatus,
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
    <div className="flex items-center bg-[#F9F5FF] rounded-3xl w-125 h-54 shadow-lg shadow-gray-300">
      {/* Cover Image */}
      <div className="w-62 h-54 rounded-s-3xl overflow-hidden">
        <div className="w-full h-full">
          {imgError || !coverUrl || coverUrl.trim() === '' ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[#231942] text-sm">
                Image not available
              </span>
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
          <div className="overflow-y-hidden">
            <span className="text-lg font-bold text-[#231942] leading-tight">
              {title.length > 60 ? `${title.substring(0, 59)}...` : title}
            </span>
            {progressStatus ? (
              <span
                className={`inline-flex ml-1 shadow-sm rounded-full px-2.5 py-1.5 text-xs font-semibold text-white capitalize whitespace-nowrap ${
                  progressStatus === 'COMPLETED' ? 'bg-success' : 'bg-accent'
                }`}
              >
                {progressStatus.toLowerCase().replace('_', ' ')}
              </span>
            ) : null}
          </div>

          <div className="space-y-2">
            {details.map((detail, idx) => (
              <p className="text-base text-[#14248A]" key={idx}>
                {detail.label === 'Topic' && (
                  <p className="text-base text-[#14248A]">
                    <span className="font-medium">{detail.label}:</span>{' '}
                    {detail.value}
                  </p>
                )}
                {detail.label === 'Points' && (
                  <p className="text-base text-[#14248A]">
                    <span className="font-medium">
                      {Boolean(earnedPoints) && <span>Earned </span>}
                      {detail.label}:
                    </span>{' '}
                    {earnedPoints ?? detail.value}
                  </p>
                )}
              </p>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-4 mr-4">
          <button
            onClick={handleClick}
            className="w-30 h-10 cursor-pointer bg-[#14248A] hover:bg-[#998FC7] text-white font-semibold px-8 rounded-full transition-colors duration-200 flex items-center justify-center"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;
