import React, { useEffect, useRef, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import ModuleDetailsUI from '../ui/ModuleDetailsUI.tsx';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import { initialModuleState } from '../../../context/admin/ModuleContext';
import ModuleFormFields from '../createModule/ModuleFormFields.tsx';
import SaveButton from '../createModule/SaveButton.tsx';
import {
  isImageUrlRenderable,
  isValidImageUrl,
} from '../../../utils/validators.ts';

interface ModuleDetailsProps {
  id: string;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ id }) => {
  const {
    setModuleState,
    isEditing,
    setIsEditing,
    title,
    description,
    topic,
    pointsAwarded,
    coverPicture,
    saveModule,
    isSaving,
    error,
  } = useModuleContext();

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [showContextError, setShowContextError] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setModuleState(initialModuleState);
    setIsEditing(false);

    const loadModule = async () => {
      try {
        const data = await fetchModuleById(id);

        setModuleState({
          id: data.id,
          title: data.title,
          description: data.description,
          topic: data.topic,
          pointsAwarded: data.points,
          coverPicture: data.coverUrl,
          status: data.status,
          isDirty: false,
          error: null,
        });

        setModule(data);
      } catch (err) {
        console.error(err);
        setShowContextError(true);
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [id, setModuleState]);

  useEffect(() => {
    if (showFormErrors || showContextError) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setShowFormErrors(false);
        setShowContextError(false);
      }, 5000);
    }

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [showFormErrors, showContextError]);

  useEffect(() => {
    if (error) {
      setShowContextError(true);
    }
  }, [error]);

  const validateForm = async () => {
    const newErrors: string[] = [];

    if (!coverPicture) {
      newErrors.push('Cover picture is required');
    } else if (!isValidImageUrl(coverPicture)) {
      newErrors.push('Cover picture must be a valid URL');
    } else {
      const isRenderable = await isImageUrlRenderable(coverPicture);
      if (!isRenderable) {
        newErrors.push(
          'Image URL is not accessible or does not point to an image',
        );
      }
    }

    if (!title.trim()) newErrors.push('Title is required');
    if (!description.trim()) newErrors.push('Description is required');
    if (!topic) newErrors.push('Topic is required');

    const pointsStr = String(pointsAwarded ?? '').trim();
    if (!pointsStr && pointsAwarded !== 0) {
      newErrors.push('Points awarded is required');
    }

    setFormErrors(newErrors);
    setShowFormErrors(newErrors.length > 0);
    return newErrors.length === 0;
  };

  const handleSaveModule = async () => {
    const isValid = await validateForm();
    if (!isValid || isSaving) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      await saveModule();
      setFormErrors([]);
      setShowFormErrors(false);
      setShowContextError(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving module:', err);
    }
  };

  if (loading) return <div>Loading module...</div>;
  if (!module) return <div className="text-error">Module not found</div>;

  return isEditing ? (
    <>
      {showFormErrors && formErrors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <ul className="list-disc list-inside">
            {formErrors.map((error, idx) => (
              <li key={idx} className="text-sm">
                {error}
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
      <form>
        <ModuleFormFields />
        <SaveButton onClick={handleSaveModule} disabled={isSaving} />
      </form>
    </>
  ) : (
    <ModuleDetailsUI onEdit={() => setIsEditing(true)} />
  );
};

export default ModuleDetails;
