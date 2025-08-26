import React from 'react';
import { type Unit } from '../ModulePage';
import { CheckIcon } from '../../../common/Icons.tsx';
import { useNavigate } from 'react-router-dom';
import UnitContentItem from './UnitContentItem';
import { ChevronDownIcon, ChevronUpIcon } from '../../../common/Icons';
import { useModuleProgress } from '../../../../context/user/ModuleProgressContext';

type UnitItemProps = {
  unit: Unit;
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
  const { ensureModuleStarted, setUnitId } = useModuleProgress();
  const navigate = useNavigate();

  const handleTitleClick = async (unitId: string) => {
    // Ensure the module is started if user bypassed the Start button
    await ensureModuleStarted();

    setUnitId(unitId);

    navigate(`/user/unit/${unitId}`);
  };

  return (
    <div key={unit.id} className="mb-4">
      <div
        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors ${
          isOpen
            ? 'bg-[#D4C2FC]'
            : unit.status?.toUpperCase() === 'COMPLETED'
              ? 'bg-green-100/70 border border-green-300'
              : 'bg-white hover:bg-[#F9F5FF]'
        }`}
        onClick={() => onToggle()}
      >
        <div
          onClick={async (e) => {
            if (!unit.hasProgress) return;
            e.stopPropagation();
            await handleTitleClick(unit.id);
          }}
          title={
            !unit.hasProgress ? 'Start the module to unlock this unit' : ''
          }
          className={`font-semibold text-xl flex items-center ${
            unit.hasProgress
              ? 'text-[#14248A] cursor-pointer hover:underline'
              : 'text-[#14248A]/50 cursor-not-allowed'
          }`}
        >
          Unit {index + 1}: {unit.title}
        </div>
        <div className="flex items-center justify-center">
          {unit.status?.toUpperCase() === 'COMPLETED' && (
            <div className="mx-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <CheckIcon width={14} height={14} color="white" />
            </div>
          )}
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
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
