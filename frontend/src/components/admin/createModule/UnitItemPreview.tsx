import React, { useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import UnitItem, { type UnitDetails } from '../ui/UnitItem';

interface Props {
  unitNumber: number;
  moduleId: string | null;
  onEdit: () => void;
}

const UnitItemPreview: React.FC<Props> = ({ unitNumber, moduleId, onEdit }) => {
  const { getUnitState } = useUnitContext();
  const unit = getUnitState(unitNumber);

  const [isOpen, setIsOpen] = useState(true);

  if (!unit) return <div>No such unit</div>;

  const details: UnitDetails = {
    id: unit.id ?? '',
    title: unit.title,
    description: unit.description,
    moduleId: moduleId ?? undefined,
  };

  return (
    <UnitItem
      id={unit.id ?? ''}
      // UnitItem displays "Unit {index+1}", so pass zero-based
      index={unitNumber - 1}
      title={unit.title}
      details={details}
      isOpen={isOpen}
      onToggle={() => setIsOpen((o) => !o)}
      onEdit={onEdit}
    />
  );
};

export default UnitItemPreview;
