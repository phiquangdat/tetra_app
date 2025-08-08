import React, { useEffect } from 'react';
import {
  initialModuleState,
  useModuleContext,
} from '../../../context/admin/ModuleContext';
import ModuleDetailsUI from '../ui/ModuleDetailsUI';
import ModuleFormFields from './ModuleFormFields';
import SaveButton from '../ui/SaveButton.tsx';
import { useModuleSave } from '../../../hooks/useModuleSave';

const CreateModuleForm: React.FC = () => {
  const { setModuleState, isEditing, setIsEditing } = useModuleContext();
  const {
    handleSave,
    isSaving,
    formErrors,
    showContextError,
    error,
    successSaved,
  } = useModuleSave();

  useEffect(() => {
    setModuleState(initialModuleState);
    setIsEditing(true);
  }, [setModuleState, setIsEditing]);

  const cardClasses =
    'bg-cardBackground border border-highlight rounded-3xl p-6 shadow-md text-primary w-full';

  return (
    <div className="mb-10 w-full">
      <h2 className="text-xl font-bold text-primary mb-4">Module Details</h2>

      {Object.keys(formErrors).length > 0 && (
        <div className="bg-error/10 text-error p-4 rounded-lg mb-6">
          <ul className="list-disc list-inside">
            {Object.values(formErrors).map((err, idx) => (
              <li key={idx} className="text-sm">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showContextError && error && (
        <div className="bg-error/10 text-error p-4 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successSaved && (
        <div className="bg-success/10 text-success p-4 rounded-lg mb-6">
          <p className="text-sm">Module saved successfully!</p>
        </div>
      )}

      {!isEditing ? (
        <ModuleDetailsUI onEdit={() => setIsEditing(true)} />
      ) : (
        <div className={cardClasses}>
          <form className="space-y-6 mx-0 mb-2">
            <ModuleFormFields />
            <SaveButton onClick={handleSave} disabled={isSaving} />
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateModuleForm;
