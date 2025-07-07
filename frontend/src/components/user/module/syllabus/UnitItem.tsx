import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnitContentItem from './UnitContentItem';
import { ChevronDownIcon, ChevronUpIcon } from '../../../common/Icons';

type UnitItemProps = {
  unit: {
    id: string;
    title: string;
    content?: {
      type: 'video' | 'article' | 'quiz';
      title: string;
    }[];
  };
  isOpen: boolean;
  onToggle: () => void;
  index: number;
};

const UnitItem: React.FC<UnitItemProps> = ({
  unit,
  isOpen,
  onToggle,
  index,
}) => {
  const navigate = useNavigate();

  const handleTitleClick = (unitId: string) => {
    navigate(`/user/unit/${unitId}`);
  };

  return (
    <div key={unit.id} className="mb-4">
      <div
        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors ${
          isOpen ? 'bg-[#D4C2FC]' : 'bg-white hover:bg-[#F9F5FF]'
        }`}
        onClick={() => onToggle()}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleTitleClick(unit.id);
          }}
          className="font-semibold text-xl text-[#14248A] hover:underline flex items-center cursor-pointer"
        >
          Unit {index + 1}: {unit.title}
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-6 h-6  text-[#998FC7]" />
        ) : (
          <ChevronDownIcon className="w-6 h-6  text-[#998FC7]" />
        )}
      </div>

      {isOpen && unit.content && (
        <div className="mt-2 ml-4 space-y-1 text-sm">
          {unit.content && unit.content.length > 0 ? (
            unit.content.map((contentItem, idx) => (
              <UnitContentItem
                key={idx}
                type={contentItem.type}
                title={contentItem.title}
              />
            ))
          ) : (
            <div className="italic text-gray-500 pl-2">
              No content available for this unit.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitItem;
