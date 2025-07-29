import React, { type ReactNode, useEffect } from 'react';
import Accordion from './Accordion';
import ContentBlockList from '../module/ContentBlockList';
import { useUnitContext } from '../../../context/admin/UnitContext';

interface UnitItemProps {
  unitNumber: number;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  renderEdit?: ReactNode;
  isEditing?: boolean;
  addContentComponent?: ReactNode;
  onEdit?: () => void;
}

const UnitItem: React.FC<UnitItemProps> = ({
  unitNumber,
  index,
  isOpen,
  onToggle,
  isEditing = false,
  renderEdit,
  onEdit,
  addContentComponent,
}) => {
  const { getUnitState, loadUnitContentIntoState } = useUnitContext();
  const unit = getUnitState(unitNumber);

  useEffect(() => {
    const unitId = unit?.id;
    if (!unit || !unitId || !unitNumber) return;

    // Avoid re-fetching if content already exists
    if (unit.content.length > 0) return;

    void loadUnitContentIntoState(unitId, unitNumber);
  }, [unitNumber, unit?.id, unit?.content.length]);

  if (!unit) {
    return (
      <Accordion
        header={`Unit ${index + 1}: Loading...`}
        isOpen={false}
        onToggle={() => {}}
      >
        <p className="text-sm text-gray-500">Loading unit state...</p>
      </Accordion>
    );
  }

  const { title, description, error } = unit;

  return (
    <Accordion
      header={`Unit ${unitNumber}: ${title}`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {unit.isSaving && <p>Loading unit details…</p>}
      {error && <p className="text-error">{error}</p>}

      {isEditing && renderEdit ? (
        <>{renderEdit}</>
      ) : (
        <>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-semibold">Unit title</p>
              <p>{title}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Unit description</p>
              <p>{description}</p>
            </div>
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover text-sm"
            >
              Edit
            </button>
          )}
        </>
      )}

      {addContentComponent}

      <div className="mt-6">
        <ContentBlockList unitNumber={unitNumber} />
      </div>
    </Accordion>
  );
};

export default UnitItem;
