import React from 'react';
import { type Unit } from '../ModulePage';
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
          isOpen ? 'bg-[#D4C2FC]' : 'bg-white hover:bg-[#F9F5FF]'
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
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
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
