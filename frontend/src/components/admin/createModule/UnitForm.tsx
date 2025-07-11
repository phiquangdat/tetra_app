import { useEffect, useState } from 'react';
import { useUnitContext } from '../../../context/admin/UnitContext';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import AddArticleModal from './AddArticleModal';
import AddVideoModal from './AddVideoModal';
import AddQuizModal from './AddQuizModal';
import { ChevronDownIcon, ChevronUpIcon, RemoveIcon } from '../../common/Icons';

import type { ContentBlock } from '../../../context/admin/UnitContext';

type UnitFormProps = {
  unitNumber: number;
};

function UnitForm({ unitNumber }: UnitFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [unitID, setUnitID] = useState<string | ''>('');

  const { updateUnitField, getUnitState, saveUnit, removeUnit, unitStates } =
    useUnitContext();
  const { id: moduleId } = useModuleContext();

  const defaultUnitState = {
    id: '',
    title: '',
    description: '',
    content: [],
    isDirty: false,
    isSaving: false,
    error: null,
  };

  const unitState = getUnitState(unitNumber) || defaultUnitState;

  const totalUnits = Object.keys(unitStates).length;
  const canRemove = totalUnits > 1;

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

  const handleAddContent = (type: ContentBlock['type'], data: any) => {
    const newBlock = { type, data };
    updateUnitField(unitNumber, 'content', [...unitState.content, newBlock]);
  };

  useEffect(() => {
    if (unitState?.id) {
      setUnitID(unitState.id);
    }
  }, [unitState?.id]);

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

  const handleRemoveUnit = () => {
    if (canRemove) {
      setShowRemoveConfirm(true);
    }
  };

  const confirmRemoveUnit = () => {
    removeUnit(unitNumber);
    setShowRemoveConfirm(false);
  };

  const cancelRemoveUnit = () => {
    setShowRemoveConfirm(false);
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
          <div className="flex items-center gap-2">
            {canRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveUnit();
                }}
                title="Remove Unit"
                aria-label="Remove Unit"
                className="w-10 h-8"
              >
                <RemoveIcon />
              </button>
            )}
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
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
                disabled={unitState.isSaving}
              >
                <option value="" disabled>
                  + Add content
                </option>
                <option value="addVideo">Add video</option>
                <option value="addArticle">Add article</option>
                <option value="addQuiz">Add quiz</option>
              </select>
              {!unitState.id && (
                <p className="text-md text-gray-500 mt-2">
                  Please save the unit first to add content blocks.
                </p>
              )}
            </div>
          </div>
        )}
      </form>

      <div className="mb-8 space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Added Content</h4>
        {unitState.content.length === 0 ? (
          <p className="text-sm text-gray-500">No content blocks added yet.</p>
        ) : (
          unitState.content.map((block, index) => (
            <div
              key={`${block.type}-${index}`}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h5 className="text-md font-semibold text-gray-800 mb-2">
                {block.type.charAt(0).toUpperCase() + block.type.slice(1)}
              </h5>
              <p className="text-sm text-gray-600 mb-2">
                {block.data.title || 'Untitled'}
              </p>
            </div>
          ))
        )}
      </div>

      {showRemoveConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Remove Unit {unitNumber}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this unit? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelRemoveUnit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveUnit}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        onAddContent={(data) => {
          handleAddContent('article', data);
          setIsArticleModalOpen(false);
        }}
        unitId={unitID || ''}
        unitNumber={unitNumber}
      />

      <AddVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onAddContent={(data) => {
          handleAddContent('video', data);
          setIsVideoModalOpen(false);
        }}
        unitId={unitID || ''}
      />

      <AddQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onAddContent={(data) => {
          handleAddContent('quiz', data);
          setIsQuizModalOpen(false);
        }}
        unitId={unitID || ''}
      />
    </div>
  );
}

export default UnitForm;
