import React from 'react';
import UnitItem from './UnitItem';

export interface UnitPreview {
  id: string;
  title: string;
  description?: string;
}

interface UnitsBlockProps {
  units: UnitPreview[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

const UnitsBlock: React.FC<UnitsBlockProps> = ({
  units,
  expandedId,
  onToggle,
}) => {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-[#231942] mb-4">Units</h2>
      <div className="flex flex-col gap-4">
        {units.map((unit, index) => (
          <UnitItem
            key={unit.id}
            index={index}
            id={unit.id}
            title={`Unit: ${unit.title}`}
            isOpen={expandedId === unit.id}
            onToggle={() => onToggle(unit.id)}
            onEdit={() => {
              return;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UnitsBlock;
