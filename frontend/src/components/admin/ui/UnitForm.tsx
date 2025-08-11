import React, { useEffect, useState } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import SaveButton from './SaveButton.tsx';

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

  const inputBase =
    'w-full max-w-lg rounded-lg p-2 text-primary bg-cardBackground border-2 border-highlight focus:outline-none focus:border-surface transition-colors duration-200';
  const labelBase = 'block mb-1 font-medium text-primary';

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {/* Error or Success Messages */}
      {unitState?.error && (
        <div className="bg-error/10 text-error p-2 rounded mb-4">
          {unitState.error}
        </div>
      )}
      {successSaved && (
        <div className="bg-success/10 text-success p-2 rounded mb-4">
          Unit saved successfully!
        </div>
      )}

      {/* Title Input */}
      <div className="mb-6">
        <label htmlFor={`unitTitle-${unitNumber}`} className={labelBase}>
          Title
        </label>
        <input
          id={`unitTitle-${unitNumber}`}
          type="text"
          value={unitState?.title || ''}
          onChange={handleTitleChange}
          className={inputBase}
        />
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label htmlFor={`unitDesc-${unitNumber}`} className={labelBase}>
          Description
        </label>
        <textarea
          id={`unitDesc-${unitNumber}`}
          value={unitState?.description || ''}
          onChange={handleDescriptionChange}
          rows={4}
          className={`${inputBase} resize-none`}
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <SaveButton
          onClick={handleSave}
          disabled={unitState?.isSaving || localSaving}
          isDirty={!!unitState?.isDirty}
        />
      </div>
    </form>
  );
};

export default UnitForm;
