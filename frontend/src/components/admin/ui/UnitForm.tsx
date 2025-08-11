import React, { useEffect, useState } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';

interface UnitFormProps {
  unitNumber: number;
  onSaved: () => void;
}

const UnitForm: React.FC<UnitFormProps> = ({ unitNumber, onSaved }) => {
  const { id: moduleId } = useModuleContext();
  const { getUnitState, updateUnitField, saveUnit } = useUnitContext();

  const unitState = getUnitState(unitNumber);

  // const [isOpen, setIsOpen] = useState(true);
  const [localSaving, setLocalSaving] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  // Clear the green “saved!” banner after 3s
  useEffect(() => {
    if (successSaved) {
      const t = setTimeout(() => setSuccessSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [successSaved]);

  const handleSave = async () => {
    if (!unitState || unitState.isSaving || localSaving) return;

    if (!moduleId) {
      updateUnitField(unitNumber, 'error', 'Please save the module first.');
      setTimeout(() => {
        updateUnitField(unitNumber, 'error', null);
      }, 5000);
      return;
    }

    // If nothing changed, just exit edit mode
    if (!unitState.isDirty) {
      onSaved();
      return;
    }

    setLocalSaving(true);
    try {
      await saveUnit(unitNumber, moduleId!);
      setSuccessSaved(true);
      onSaved();
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

  return (
    <form onSubmit={(e) => e.preventDefault()}>
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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={unitState?.isSaving || localSaving}
          className={`px-4 py-2 rounded-lg transition ${
            unitState?.isSaving || localSaving
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : unitState?.isDirty
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {unitState?.isSaving || localSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default UnitForm;
