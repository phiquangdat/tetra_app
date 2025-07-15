import React, { useEffect, useState } from 'react';
import { fetchUnitById } from '../../../services/unit/unitApi';
import { ChevronDownIcon, ChevronUpIcon } from '../../common/Icons';
import ContentBlockList from './ContentBlockList.tsx';

interface UnitItemProps {
  id: string;
  title: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

interface UnitDetails {
  id: string;
  title: string;
  description: string;
  moduleId: string;
}

const UnitItem: React.FC<UnitItemProps> = ({
  id,
  title,
  index,
  isOpen,
  onToggle,
}) => {
  const [details, setDetails] = useState<UnitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !details && !loading) {
      setLoading(true);
      fetchUnitById(id)
        .then(setDetails)
        .catch(() => setError('Failed to fetch unit details'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <div className="bg-[#F9F5FF] border border-highlight rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full text-left px-6 py-4 font-semibold text-primary flex justify-between items-center hover:bg-[#EFE8FF] transition"
      >
        <span>
          Unit {index + 1}: {title}
        </span>
        <span>
          {isOpen ? (
            <ChevronUpIcon width={20} height={20} />
          ) : (
            <ChevronDownIcon width={20} height={20} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-4 text-primary text-base">
          {loading && <p>Loading unit details...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {details && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="font-semibold">Unit title</p>
                <p>{details.title}</p>
              </div>
              <div>
                <p className="font-semibold">Unit description</p>
                <p>{details.description}</p>
              </div>
              <button
                onClick={() => {}}
                className="mt-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover"
              >
                Edit
              </button>

              {/* Content blocks */}
              <div className="mt-6">
                <ContentBlockList unitId={id} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitItem;
