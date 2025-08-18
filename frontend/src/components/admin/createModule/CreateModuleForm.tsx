import React, { useEffect, useRef, useCallback } from 'react';
import {
  initialModuleState,
  useModuleContext,
} from '../../../context/admin/ModuleContext';
import ModuleDetailsUI from '../ui/ModuleDetailsUI';
import ModuleFormFields from './ModuleFormFields';
import SaveButton from '../ui/SaveButton.tsx';
import { useModuleSave } from '../../../hooks/useModuleSave';
import {
  useOutsideClick,
  type UseOutsideClickParams,
} from '../../../hooks/useOutSideClick.ts';

const CreateModuleForm: React.FC = () => {
  const { setModuleState, isEditing, setIsEditing, isDirty, id } =
    useModuleContext();
  const {
    handleSave,
    isSaving,
    formErrors,
    showContextError,
    error,
    successSaved,
  } = useModuleSave();

  const formContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setModuleState(initialModuleState);
    setIsEditing(true);
  }, [setModuleState, setIsEditing]);

  const exitEditMode = useCallback(() => {
    if (isEditing) setIsEditing(false);
  }, [isEditing, setIsEditing]);

  const outsideClickParams: UseOutsideClickParams = {
    getElement: () => formContainerRef.current,
    onOutside: exitEditMode,
    options: {
      eventType: 'pointerdown',
      enabled: isEditing && !!id,
      ignore: (target) =>
        !!(target as HTMLElement | null)?.closest?.(
          '[role="dialog"], [data-portal-root], [data-ignore-outside="true"]',
        ),
    },
  };

  useOutsideClick(outsideClickParams);

  const cardClasses =
    'bg-cardBackground border border-highlight rounded-3xl p-6 shadow-md text-primary w-full';

  return (
    <div className="mb-10 w-full" ref={formContainerRef}>
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
            <SaveButton
              onClick={handleSave}
              disabled={isSaving}
              isDirty={isDirty}
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateModuleForm;
