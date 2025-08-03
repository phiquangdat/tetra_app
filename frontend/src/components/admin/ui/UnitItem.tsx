import React, { type ReactNode, useEffect, useState } from 'react';
import Accordion from './Accordion';
import ContentBlockList from '../module/ContentBlockList';
import { useUnitContext } from '../../../context/admin/UnitContext';
import { RemoveIcon } from '../../common/Icons.tsx';

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
  const { unitStates, getUnitState, loadUnitContentIntoState } =
    useUnitContext();
  const unit = getUnitState(unitNumber);
  const canRemove = Object.keys(unitStates).length > 1;
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    const unitId = unit?.id;
    if (!unit || !unitId || !unitNumber) return;

    if (unit.content.length === 0 && !unit.wasJustCreated) {
      console.log(`[UnitItem] Loading content for unit ${unitNumber}`);
      void loadUnitContentIntoState(unitId, unitNumber);
    }
  }, [unitNumber, unit?.id, unit?.wasJustCreated]);

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

  const handleRemove = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    setShowRemoveConfirm(false);
  };
  const cancelRemove = () => {
    setShowRemoveConfirm(false);
  };

  const { title, description, error } = unit;

  return (
    <Accordion
      header={
        <div className="flex items-center justify-between w-full">
          <h3 className="text-xl font-semibold text-gray-700">
            Unit {unitNumber}: {title}
          </h3>
          {canRemove && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              aria-label="Remove Unit"
              className="cursor-pointer p-1"
            >
              <RemoveIcon />
            </span>
          )}
        </div>
      }
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
        {unit.content.length > 0 ? (
          <ContentBlockList unitNumber={unitNumber} />
        ) : (
          <p className="text-sm text-gray-500">Loading content blocks…</p>
        )}
      </div>
      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h4 className="text-lg font-semibold mb-4">
              Remove Unit {unitNumber}
            </h4>
            <p className="mb-6">
              Are you sure you want to remove this unit? This cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </Accordion>
  );
};

export default UnitItem;
