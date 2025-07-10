import React, { useState } from 'react';
import { fetchUnitById } from '../../../services/unit/unitApi';
import { ChevronDownIcon, ChevronUpIcon } from '../../common/Icons';

interface UnitItemProps {
  id: string;
  title: string;
  index: number;
}

interface UnitDetails {
  id: string;
  title: string;
  description: string;
  moduleId: string;
}

const UnitItem: React.FC<UnitItemProps> = ({ id, title, index }) => {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<UnitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDropdown = async () => {
    setOpen((prev) => !prev);
    if (!open && !details) {
      setLoading(true);
      try {
        const data = await fetchUnitById(id);
        setDetails(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch unit details');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#F9F5FF] border border-[#D4C2FC] rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={toggleDropdown}
        className="w-full text-left px-6 py-4 font-semibold text-[#231942] flex justify-between items-center hover:bg-[#EFE8FF] transition"
      >
        <span>
          Unit {index + 1}: {title}
        </span>
        <span>
          {open ? (
            <ChevronUpIcon width={20} height={20} />
          ) : (
            <ChevronDownIcon width={20} height={20} />
          )}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-4 text-[#231942] text-base">
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
                className="mt-2 px-4 py-2 bg-[#998FC7] text-white rounded-lg hover:bg-[#7d6bb3]"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitItem;
