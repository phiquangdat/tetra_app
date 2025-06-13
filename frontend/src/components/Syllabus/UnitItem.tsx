import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnitContentItem from './UnitContentItem';

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

const icons = {
  chevronDown: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronUp: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M5 15l7-7 7 7" />
    </svg>
  ),
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
          isOpen ? 'bg-blue-100' : 'bg-white hover:bg-gray-200'
        }`}
        onClick={() => onToggle()}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleTitleClick(unit.id);
          }}
        >
          <div className="font-bold">
            Unit {index + 1}: {unit.title}
          </div>
        </div>
        {isOpen ? icons.chevronUp : icons.chevronDown}
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
