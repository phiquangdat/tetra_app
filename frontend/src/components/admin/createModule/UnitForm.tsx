import { useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import AddArticleModal from './AddArticleModal';
import AddVideoModal from './AddVideoModal';
import AddQuizModal from './AddQuizModal';

type ContentBlock = {
  type: 'video' | 'article' | 'quiz';
  data: any;
};

type UnitFormProps = {
  unitNumber: number;
};

function UnitForm({ unitNumber }: UnitFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  const { updateUnitField, getUnitState, saveUnit } = useUnitContext();
  const { id: moduleId } = useModuleContext();

  const unitState = getUnitState(unitNumber);
  if (!unitState) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUnitField(unitNumber, 'title', e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateUnitField(unitNumber, 'description', e.target.value);
  };

  const handleContentBlockChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (value === 'addArticle') setIsArticleModalOpen(true);
    if (value === 'addVideo') setIsVideoModalOpen(true);
    if (value === 'addQuiz') setIsQuizModalOpen(true);
    e.target.value = '';
  };

  const handleContentSave = (type: ContentBlock['type'], data: any) => {
    const newBlock = { type, data };
    updateUnitField(unitNumber, 'content', [...unitState.content, newBlock]);
  };

  const handleSaveUnitForm = async () => {
    if (!moduleId) {
      updateUnitField(
        unitNumber,
        'error',
        'Module must be saved before saving units',
      );
      return;
    }
    if (unitState.isSaving) return;
    setSuccessSaved(false);

    try {
      await saveUnit(unitNumber, moduleId);
      setSuccessSaved(true);
      setTimeout(() => {
        setSuccessSaved(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving unit:', err);
      updateUnitField(
        unitNumber,
        'error',
        err instanceof Error ? err.message : 'Failed to save unit',
      );
    }
  };

  const icons = {
    chevronDown: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    ),
    chevronUp: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M5 15l7-7 7 7" />
      </svg>
    ),
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          className={`flex items-center justify-between px-3 py-4 mb-4 ${isOpen ? '' : 'bg-gray-100'} rounded-lg cursor-pointer transition-colors duration-200`}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <h3 className="text-xl font-semibold text-gray-700">
            Unit {unitNumber}
          </h3>
          {isOpen ? icons.chevronUp : icons.chevronDown}
        </div>

        {isOpen && (
          <div className="space-y-6 max-w-110 mx-0 mb-11">
            {unitState.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{unitState.error}</p>
              </div>
            ) : successSaved ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">Unit saved successfully!</p>
              </div>
            ) : null}

            <div className="max-w-90 mb-11">
              <label
                htmlFor="unitTitle"
                className="block mb-2 font-medium text-gray-700"
              >
                Unit Title
              </label>
              <input
                type="text"
                id="unitTitle"
                name="unitTitle"
                value={unitState.title}
                onChange={handleTitleChange}
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div className="mb-11">
              <label
                htmlFor="unitDescription"
                className="block mb-2 font-medium text-gray-700"
              >
                Unit Description
              </label>
              <textarea
                id="unitDescription"
                name="unitDescription"
                value={unitState.description}
                onChange={handleDescriptionChange}
                className="bg-white border-gray-400 border-2 w-full h-60 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                style={{ resize: 'none' }}
              />
            </div>

            <button
              type="button"
              aria-label="Save unit"
              onClick={handleSaveUnitForm}
              disabled={unitState.isSaving}
              className={`border-2 text-sm px-4 py-1 rounded-lg transition-colors duration-200 mr-4 mb-20 w-28 h-10 ${
                unitState.isSaving
                  ? 'bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed'
                  : unitState.isDirty
                    ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                    : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100 cursor-pointer'
              }`}
            >
              {unitState.isSaving ? 'Saving...' : 'Save'}
            </button>

            <div className="w-48 mb-11">
              <label htmlFor="contentBlocks" className="text-xl font-semibold">
                Content Blocks
              </label>
              <select
                id="contentBlocks"
                name="contentBlocks"
                onChange={handleContentBlockChange}
                className="bg-white border-gray-400 text-gray-700 border-2 w-full mt-6 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                defaultValue=""
              >
                <option value="" disabled>
                  + Add content
                </option>
                <option value="addVideo">Add video</option>
                <option value="addArticle">Add article</option>
                <option value="addQuiz">Add quiz</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onSave={(data) => {
          handleContentSave('article', data);
          setIsArticleModalOpen(false);
        }}
      />

      <AddVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSave={(data) => {
          handleContentSave('video', data);
          setIsVideoModalOpen(false);
        }}
      />

      <AddQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSave={(data) => {
          handleContentSave('quiz', data);
          setIsQuizModalOpen(false);
        }}
      />
    </div>
  );
}

export default UnitForm;
