import React, { useEffect, useState, useRef } from 'react';
import {
  initialModuleState,
  useModuleContext,
} from '../../../context/admin/ModuleContext';
import {
  isValidImageUrl,
  isImageUrlRenderable,
} from '../../../utils/validators';
import ModuleDetailsUI from '../ui/ModuleDetailsUI.tsx';
import ModuleFormFields from './ModuleFormFields.tsx';
import SaveButton from './SaveButton.tsx';

type Props = {};

const CreateModuleForm: React.FC<Props> = () => {
  const {
    title,
    description,
    topic,
    pointsAwarded,
    coverPicture,
    isSaving,
    error,
    setModuleState,
    saveModule,
    isEditing,
    setIsEditing,
  } = useModuleContext();

  const [successSaved, setSuccessSaved] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [showContextError, setShowContextError] = useState(false);

  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setModuleState(initialModuleState);
    setIsEditing(true);
  }, [setModuleState]);

  useEffect(() => {
    if (showFormErrors || showContextError) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      errorTimeoutRef.current = setTimeout(() => {
        setShowFormErrors(false);
        setShowContextError(false);
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [showFormErrors, showContextError]);

  useEffect(() => {
    if (error) {
      setShowContextError(true);
    }
  }, [error]);

  const validateForm = async () => {
    const newformErrors: string[] = [];

    if (!coverPicture) {
      newformErrors.push('Cover picture is required');
    } else if (!isValidImageUrl(coverPicture)) {
      newformErrors.push('Cover picture must be a valid URL');
    } else {
      const isRenderable = await isImageUrlRenderable(coverPicture);
      if (!isRenderable) {
        newformErrors.push(
          'Image URL is not accessible or does not point to an actual image',
        );
      }
    }

    if (!title.trim()) {
      newformErrors.push('Title is required');
    }
    if (!description.trim()) {
      newformErrors.push('Description is required');
    }
    if (!topic) {
      newformErrors.push('Topic is required');
    }

    const pointsStr = String(
      pointsAwarded !== undefined && pointsAwarded !== null
        ? pointsAwarded
        : '',
    ).trim();
    if (!pointsStr && pointsAwarded !== 0) {
      newformErrors.push('Points awarded is required');
    }

    if (newformErrors.length > 0) {
      setSuccessSaved(false);
      setShowFormErrors(true);
    }

    setFormErrors(newformErrors);
    return newformErrors.length === 0;
  };

  const handleSaveModule = async () => {
    const isValid = await validateForm();
    if (!isValid || isSaving) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      await saveModule();
      setSuccessSaved(true);
      setFormErrors([]);
      setShowFormErrors(false);
      setShowContextError(false);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      setTimeout(() => setSuccessSaved(false), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving module:', err);
    }
  };

  return (
    <div
      className="max-w-5xl px-16 py-9 rounded-3xl"
      style={{ backgroundColor: '#F2EAEA' }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Module Details
      </h2>

      {showFormErrors && formErrors.length > 0 ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <ul className="list-disc list-inside">
            {formErrors.map((error, index) => (
              <li key={index} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : showContextError && error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      ) : successSaved ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
          <p className="text-sm">Module saved successfully!</p>
        </div>
      ) : null}

      {!isEditing ? (
        <ModuleDetailsUI onEdit={() => setIsEditing(true)} />
      ) : (
        <form className="space-y-6 max-w-110 mx-0 mb-11">
          <ModuleFormFields />
          <SaveButton onClick={handleSaveModule} disabled={isSaving} />
        </form>
      )}
    </div>
  );
};

export default CreateModuleForm;
