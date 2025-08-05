import React, { type ReactNode, useEffect, useState } from 'react';
import Accordion from './Accordion';
import ContentBlockList from '../module/ContentBlockList';
import { useUnitContext } from '../../../context/admin/UnitContext';
import DeleteConfirmationModal from '../createModule/DeleteConfirmationModal.tsx';

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
  const { getUnitState, loadUnitContentIntoState, removeUnit } =
    useUnitContext();
  const unit = getUnitState(unitNumber);
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

  const handleConfirmDelete = async () => {
    const success = await removeUnit(unitNumber);
    if (success) {
      setShowRemoveConfirm(false);
    }
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

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-lg text-sm text-white bg-secondary hover:bg-secondaryHover"
              >
                Edit
              </button>
            )}

            {addContentComponent}
            <button
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveConfirm(true);
              }}
              aria-label="Remove Unit"
              className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm"
            >
              Delete
            </button>
          </div>
        </>
      )}

      <div className="mt-6">
        {unit.content.length > 0 ? (
          <ContentBlockList unitNumber={unitNumber} />
        ) : (
          <p className="text-sm text-gray-500">Loading content blocks…</p>
        )}
      </div>
      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <DeleteConfirmationModal
          title={`Remove Unit ${unitNumber}`}
          description="Are you sure you want to remove this unit? This cannot be undone."
          onCancel={cancelRemove}
          onConfirm={handleConfirmDelete}
        />
      )}
    </Accordion>
  );
};

export default UnitItem;
