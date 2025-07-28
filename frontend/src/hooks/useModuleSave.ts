import { useCallback, useEffect, useRef, useState } from 'react';
import { useModuleContext } from '../context/admin/ModuleContext';
import { isImageUrlRenderable, isValidImageUrl } from '../utils/validators';

type FieldErrors = Partial<{
  title: string;
  description: string;
  topic: string;
  pointsAwarded: string;
  coverPicture: string;
}>;

export const useModuleSave = () => {
  const {
    title,
    description,
    topic,
    pointsAwarded,
    coverPicture,
    isSaving,
    error,
    saveModule,
    setIsEditing,
  } = useModuleContext();

  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [showContextError, setShowContextError] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validateForm = useCallback(async () => {
    const errors: FieldErrors = {};

    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!topic) errors.topic = 'Topic is required';

    const pointsStr = String(pointsAwarded ?? '').trim();
    if (!pointsStr && pointsAwarded !== 0) {
      errors.pointsAwarded = 'Points awarded is required';
    }

    if (!coverPicture) {
      errors.coverPicture = 'Cover picture is required';
    } else if (!isValidImageUrl(coverPicture)) {
      errors.coverPicture = 'Cover picture must be a valid URL';
    } else {
      const isRenderable = await isImageUrlRenderable(coverPicture);
      if (!isRenderable) {
        errors.coverPicture = 'Image URL is not accessible or invalid';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, description, topic, pointsAwarded, coverPicture]);

  const handleSave = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid || isSaving) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      await saveModule();
      setSuccessSaved(true);
      setShowContextError(false);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setSuccessSaved(false), 3000);
      setIsEditing(false);
    } catch (e) {
      console.error('Error saving module:', e);
      setShowContextError(true);
    }
  }, [validateForm, isSaving, saveModule]);

  // Live clearing of field errors
  useEffect(() => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (title.trim()) delete next.title;
      return next;
    });
  }, [title]);

  useEffect(() => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (description.trim()) delete next.description;
      return next;
    });
  }, [description]);

  useEffect(() => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (topic) delete next.topic;
      return next;
    });
  }, [topic]);

  useEffect(() => {
    setFormErrors((prev) => {
      const next = { ...prev };
      const valid = /^\d+$/.test(String(pointsAwarded ?? ''));
      if (valid) delete next.pointsAwarded;
      return next;
    });
  }, [pointsAwarded]);

  useEffect(() => {
    const checkCover = async () => {
      if (coverPicture && isValidImageUrl(coverPicture)) {
        const isRenderable = await isImageUrlRenderable(coverPicture);
        if (isRenderable) {
          setFormErrors((prev) => {
            const next = { ...prev };
            delete next.coverPicture;
            return next;
          });
        }
      }
    };
    checkCover();
  }, [coverPicture]);

  return {
    handleSave,
    isSaving,
    formErrors,
    showContextError,
    error,
    successSaved,
  };
};
