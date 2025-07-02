import { useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
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

  const { updateUnitField, getUnitState, setUnitState } = useUnitContext();

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
    setUnitState(unitNumber, {
      ...unitState,
      isSaving: true,
      isDirty: false,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000)); // API call simulation

    setUnitState(unitNumber, {
      ...unitState,
      isSaving: false,
      error: null,
    });
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
              aria-label="Save "
              onClick={handleSaveUnitForm}
              className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 mb-20 w-28 h-10"
            >
              Save
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
