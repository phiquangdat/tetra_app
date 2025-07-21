import React, { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import {
  isValidImageUrl,
  isImageUrlRenderable,
} from '../../../utils/validators';
import ModuleDetailsPreview from './ModuleDetailsPreview.tsx';

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
    updateModuleField,
    markModuleAsDirty,
    saveModule,
  } = useModuleContext();

  const [successSaved, setSuccessSaved] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [showContextError, setShowContextError] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(true);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const validateCoverPicture = async () => {
      if (coverPicture && isValidImageUrl(coverPicture)) {
        const exists = await isImageUrlRenderable(coverPicture);
        if (!cancelled) {
          if (exists) {
            setCoverPreviewUrl(coverPicture);
          } else {
            setCoverPreviewUrl(null);
          }
        }
      } else {
        setCoverPreviewUrl(null);
      }
    };

    validateCoverPicture();

    return () => {
      cancelled = true;
    };
  }, [coverPicture]);

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
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateModuleField('title', e.target.value);
    markModuleAsDirty();
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateModuleField('description', e.target.value);
    markModuleAsDirty();
  };

  const handleTopicChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateModuleField('topic', e.target.value);
    markModuleAsDirty();
  };

  const handlePointsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      updateModuleField('pointsAwarded', '');
      markModuleAsDirty();
      return;
    }

    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      updateModuleField('pointsAwarded', numValue);
      markModuleAsDirty();
    }
  };

  const handleCoverPictureChange = async () => {
    if (!coverInputRef.current) return;

    const value = coverInputRef.current.value;

    await updateModuleField('coverPicture', value);
    markModuleAsDirty();
  };

  const renderCoverPicture = () => {
    return (
      <div className="space-y-3">
        {coverPreviewUrl && (
          <div>
            <img
              id="moduleCoverPicture"
              className="max-w-full h-auto max-h-60 rounded-md"
              src={coverPreviewUrl}
              alt="Module Cover"
            />
          </div>
        )}

        <label
          htmlFor="coverPictureUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Cover Picture URL
        </label>
        <input
          ref={coverInputRef}
          type="text"
          id="coverPictureUrl"
          name="coverPictureUrl"
          placeholder="https://example.com/image.jpg"
          value={coverPicture ?? ''}
          onChange={handleCoverPictureChange}
          className="text-xs bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />
      </div>
    );
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
        <ModuleDetailsPreview onEdit={() => setIsEditing(true)} />
      ) : (
        <form className="space-y-6 max-w-110 mx-0 mb-11">
          <div>
            <div className="mb-8">
              <label
                htmlFor="moduleCoverPicture"
                className="block mb-2 font-medium text-gray-700"
              >
                Module Cover Picture
              </label>
              {renderCoverPicture()}
            </div>

            <div className="max-w-90 mb-11">
              <label
                htmlFor="moduleTitle"
                className="block mb-2 font-medium text-gray-700"
              >
                Module Title
              </label>
              <input
                type="text"
                id="moduleTitle"
                name="moduleTitle"
                value={title}
                onChange={handleTitleChange}
                required
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div className="w-full mb-11">
              <label
                htmlFor="moduleDescription"
                className="block mb-2 font-medium text-gray-700"
              >
                Module Description
              </label>
              <textarea
                id="moduleDescription"
                name="moduleDescription"
                value={description}
                onChange={handleDescriptionChange}
                rows={4}
                required
                className="bg-white border-gray-400 border-2 w-full h-60 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                style={{ resize: 'none' }}
              />
            </div>

            <div className="max-w-90 mb-11">
              <label
                htmlFor="moduleTopic"
                className="block mb-2 font-medium text-gray-700"
              >
                Module Topic
              </label>
              <select
                id="moduleTopic"
                name="moduleTopic"
                value={topic}
                onChange={handleTopicChange}
                required
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              >
                <option value="" disabled>
                  Select topic
                </option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="artificial-intelligence">
                  Artificial Intelligence
                </option>
                <option value="esg">ESG</option>
                <option value="occupational-safety">Occupational Safety</option>
              </select>
            </div>

            <div className="max-w-48">
              <label
                htmlFor="pointsAwarded"
                className="block mb-0 font-medium text-gray-700"
              >
                Points Awarded
              </label>
              <input
                type="text"
                id="pointsAwarded"
                name="pointsAwarded"
                value={
                  pointsAwarded !== undefined && pointsAwarded !== null
                    ? String(pointsAwarded)
                    : ''
                }
                onChange={handlePointsChange}
                required
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>
          <button
            type="button"
            aria-label="Save Module"
            disabled={isSaving}
            onClick={handleSaveModule}
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 mt-8 w-28 h-10"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateModuleForm;
