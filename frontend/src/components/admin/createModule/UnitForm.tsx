import React, { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import Accordion from '../ui/Accordion';
import UnitItemPreview from './UnitItemPreview';
import { RemoveIcon } from '../../common/Icons';
import AddArticleModal from './AddArticleModal';
import AddVideoModal from './AddVideoModal';
import AddQuizModal from './AddQuizModal';
import AddContentDropdown from './AddContentDropdown';

type UnitFormProps = {
  unitNumber: number;
};

const UnitForm: React.FC<UnitFormProps> = ({ unitNumber }) => {
  const { id: moduleId } = useModuleContext();
  const { unitStates, getUnitState, updateUnitField, saveUnit, removeUnit } =
    useUnitContext();

  const unitState = getUnitState(unitNumber);
  const canRemove = Object.keys(unitStates).length > 1;

  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [successSaved, setSuccessSaved] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Reset success message when editing again
  useEffect(() => {
    if (isEditing) {
      setSuccessSaved(false);
    }
  }, [isEditing]);

  const handleSave = async () => {
    // if there's no state, or we're already saving, do nothing
    if (!unitState || unitState.isSaving) {
      return;
    }

    // if nothing dirty, just close the form (no backend call)
    if (!unitState.isDirty) {
      setIsEditing(false);
      return;
    }

    try {
      await saveUnit(unitNumber, moduleId!);
      setSuccessSaved(true);
      setIsEditing(false);
      setTimeout(() => setSuccessSaved(false), 3000);
    } catch (err) {
      console.error('Error saving unit:', err);
      updateUnitField(
        unitNumber,
        'error',
        err instanceof Error ? err.message : 'Failed to save unit',
      );
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUnitField(unitNumber, 'title', e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateUnitField(unitNumber, 'description', e.target.value);
  };

  const handleRemove = () => {
    if (canRemove) {
      setShowRemoveConfirm(true);
    }
  };

  const confirmRemove = () => {
    removeUnit(unitNumber);
    setShowRemoveConfirm(false);
  };

  const cancelRemove = () => {
    setShowRemoveConfirm(false);
  };

  return (
    <>
      {isEditing ? (
        <form onSubmit={(e) => e.preventDefault()}>
          <Accordion
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xl font-semibold text-gray-700">
                  Unit {unitNumber}
                </h3>
                {canRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    aria-label="Remove Unit"
                  >
                    <RemoveIcon />
                  </button>
                )}
              </div>
            }
            isOpen={isOpen}
            onToggle={() => setIsOpen((o) => !o)}
          >
            {/* Error or Success Messages */}
            {unitState?.error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                {unitState.error}
              </div>
            )}
            {successSaved && (
              <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
                Unit saved successfully!
              </div>
            )}

            {/* Title Input */}
            <div className="mb-6">
              <label
                htmlFor={`unitTitle-${unitNumber}`}
                className="block mb-1 font-medium"
              >
                Title
              </label>
              <input
                id={`unitTitle-${unitNumber}`}
                type="text"
                value={unitState?.title || ''}
                onChange={handleTitleChange}
                className="w-full border-gray-300 border rounded p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label
                htmlFor={`unitDesc-${unitNumber}`}
                className="block mb-1 font-medium"
              >
                Description
              </label>
              <textarea
                id={`unitDesc-${unitNumber}`}
                value={unitState?.description || ''}
                onChange={handleDescriptionChange}
                rows={4}
                className="w-full border-gray-300 border rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={unitState?.isSaving}
              className={`px-4 py-2 rounded-lg transition ${
                unitState?.isSaving
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : unitState?.isDirty
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {unitState?.isSaving ? 'Saving...' : 'Save'}
            </button>
          </Accordion>
        </form>
      ) : (
        <UnitItemPreview
          unitNumber={unitNumber}
          moduleId={moduleId}
          onEdit={() => setIsEditing(true)}
          addContentComponent={
            <AddContentDropdown
              unitNumber={unitNumber}
              disabled={!unitState?.id || unitState.isSaving}
              onOpenArticle={() => setIsArticleModalOpen(true)}
              onOpenVideo={() => setIsVideoModalOpen(true)}
              onOpenQuiz={() => setIsQuizModalOpen(true)}
            />
          }
        />
      )}

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

      {/* Content Block Modals */}
      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        unitId={unitState?.id ?? ''}
        unitNumber={unitNumber}
      />
      <AddVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        unitId={unitState?.id ?? ''}
        unitNumber={unitNumber}
      />
      <AddQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        unitId={unitState?.id ?? ''}
        unitNumber={unitNumber}
      />
    </>
  );
};

export default UnitForm;
