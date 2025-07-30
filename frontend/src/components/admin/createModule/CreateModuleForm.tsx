import React, { useEffect } from 'react';
import {
  initialModuleState,
  useModuleContext,
} from '../../../context/admin/ModuleContext';
import ModuleDetailsUI from '../ui/ModuleDetailsUI';
import ModuleFormFields from './ModuleFormFields';
import SaveButton from './SaveButton';
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

  return (
    <div
      className="max-w-5xl px-16 py-9 rounded-3xl"
      style={{ backgroundColor: '#F2EAEA' }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Module Details
      </h2>

      {Object.keys(formErrors).length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
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
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successSaved && (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
          <p className="text-sm">Module saved successfully!</p>
        </div>
      )}

      {!isEditing ? (
        <ModuleDetailsUI onEdit={() => setIsEditing(true)} />
      ) : (
        <form className="space-y-6 max-w-110 mx-0 mb-11">
          <ModuleFormFields />
          <SaveButton onClick={handleSave} disabled={isSaving} />
        </form>
      )}
    </div>
  );
};

export default CreateModuleForm;
