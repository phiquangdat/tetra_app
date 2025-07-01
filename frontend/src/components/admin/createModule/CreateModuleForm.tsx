import React, { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext';

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

  const handleSaveModule = async () => {
    if (isSaving) return;
    window.scrollTo(0, 0);
    setSuccessSaved(false);

    try {
      await saveModule();
      setSuccessSaved(true);
      setTimeout(() => {
        setSuccessSaved(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving module:', err);
    }
  };
  const coverPreviewUrl = useMemo(() => {
    if (coverPicture) {
      return URL.createObjectURL(coverPicture);
    }
    return null;
  }, [coverPicture]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const handleCoverPictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateModuleField('coverPicture', file);
      markModuleAsDirty();
    } else {
      updateModuleField('coverPicture', null);
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
    updateModuleField('pointsAwarded', parseInt(e.target.value) || 0);
    markModuleAsDirty();
  };

  const handleRemoveCoverPicture = () => {
    updateModuleField('coverPicture', null);
    markModuleAsDirty();
  };

  const icons = {
    upload: (
      <svg
        className="w-24 h-24 text-gray-500"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M504 434.944L301.664 647.552l57.92 55.152L464 593.024V848h80V593.008l104.4 109.696 57.936-55.152L504 434.944z m265.68-82.112C733.6 220.896 614.88 128 476.96 128c-90.112 0-170.576 33.28-226.592 93.712-50.16 54.096-77.264 127.328-77.84 208.752C85.04 464.384 32 540.128 32 634.528 32 752.24 127.296 848 244.416 848H352v-80h-107.584C171.408 768 112 708.128 112 634.528c0-67.76 41.632-118.752 111.36-136.432l32.608-8.256-2.56-33.536c-5.52-72.688 13.712-135.008 55.632-180.208C349.728 232.16 409.36 208 476.96 208c108.928 0 201.648 79.04 220.448 187.92l5.312 30.704 31.04 2.384C838.72 437.056 912 506.768 912 598.544 912 691.984 836.656 768 744.032 768H656v80h88.032C880.768 848 992 736.096 992 598.544c0-126.128-89.984-223.728-222.32-245.712z"
          fill="#565D64"
        />
      </svg>
    ),
  };

  const renderCoverPicture = () => {
    if (coverPicture && coverPreviewUrl) {
      return (
        <div>
          <img
            id="moduleCoverPicture"
            className="max-w-full h-auto max-h-60 rounded-md"
            src={coverPreviewUrl}
            alt="Module Cover Picture"
          />
          <button
            type="button"
            onClick={handleRemoveCoverPicture}
            className="mt-2 bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200"
          >
            <span className="text-sm">Change Cover Picture</span>
          </button>
        </div>
      );
    }

    return (
      <div>
        <label
          htmlFor="moduleCoverPicture"
          className="bg-white border-gray-400 border-2 rounded-lg cursor-pointer w-full h-60 flex items-center justify-center focus:border-transparent"
        >
          {icons.upload}
        </label>

        <input
          type="file"
          id="moduleCoverPicture"
          name="moduleCoverPicture"
          accept="image/*"
          className="hidden"
          onChange={handleCoverPictureChange}
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
      {error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          <p className="text-sm">{error}</p>
        </div>
      ) : successSaved ? (
        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
          <p className="text-sm">Module saved successfully!</p>
        </div>
      ) : null}

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
              type="number"
              id="pointsAwarded"
              name="pointsAwarded"
              value={pointsAwarded}
              onChange={handlePointsChange}
              min={0}
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
    </div>
  );
};

export default CreateModuleForm;
