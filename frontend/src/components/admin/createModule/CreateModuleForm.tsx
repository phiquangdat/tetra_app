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
  const coverPreviewUrl = coverPicture || null;

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

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
          type="text"
          id="coverPictureUrl"
          name="coverPictureUrl"
          value={coverPicture || ''}
          placeholder="https://example.com/image.jpg"
          onChange={(e) => updateModuleField('coverPicture', e.target.value)}
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
