import React, { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import { isImageUrlRenderable } from '../../../utils/validators.ts';

const ModuleFormFields: React.FC = () => {
  const {
    title,
    description,
    topic,
    coverPicture,
    updateModuleField,
    markModuleAsDirty,
  } = useModuleContext();

  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const validateCoverPicture = async () => {
      if (coverPicture) {
        const exists = await isImageUrlRenderable(coverPicture);
        if (!cancelled) {
          if (exists) {
            setCoverPreviewUrl(coverPicture);
            setCoverError(null);
          } else {
            setCoverPreviewUrl(null);
            setCoverError('Image could not be loaded. Please check the URL.');
          }
        }
      } else {
        setCoverPreviewUrl(null);
        setCoverError(null);
      }
    };

    validateCoverPicture();

    return () => {
      cancelled = true;
    };
  }, [coverPicture]);

  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const handleCoverPictureChange = async () => {
    if (!coverInputRef.current) return;
    await updateModuleField('coverPicture', coverInputRef.current.value);
    markModuleAsDirty();
  };

  const inputBase =
    'w-full max-w-lg rounded-lg p-2 text-primary bg-cardBackground border-2 border-highlight focus:outline-none focus:border-surface transition-colors duration-200';
  const labelBase = 'block mb-2 font-medium text-primary';

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

        <label htmlFor="coverPictureUrl" className={labelBase}>
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
          className={`text-xs ${inputBase} ${coverError ? 'border-red-500' : ''}`}
          aria-invalid={!!coverError}
        />
        {coverError && <p className="text-red-500 text-xs">{coverError}</p>}
      </div>
    );
  };

  return (
    <>
      <div>
        <div className="mb-8">{renderCoverPicture()}</div>

        <div className="mb-8">
          <label htmlFor="moduleTitle" className={labelBase}>
            Module Title
          </label>
          <input
            type="text"
            id="moduleTitle"
            name="moduleTitle"
            value={title}
            onChange={handleTitleChange}
            required
            className={inputBase}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="moduleDescription" className={labelBase}>
            Module Description
          </label>
          <textarea
            id="moduleDescription"
            name="moduleDescription"
            value={description}
            onChange={handleDescriptionChange}
            rows={4}
            required
            className={`${inputBase} h-60`}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="moduleTopic" className={labelBase}>
            Module Topic
          </label>
          <select
            id="moduleTopic"
            name="moduleTopic"
            value={topic}
            onChange={handleTopicChange}
            required
            className={inputBase}
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
            <option value="digitalization">Digitalization</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default ModuleFormFields;
