import { EditIcon, CloseIcon } from '../../common/Icons';
import { useEffect, useRef } from 'react';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext';
import { useUnitContext } from '../../../context/admin/UnitContext';
import EditorComposer from '../../../utils/editor/EditorComposer';
import { useEditorStateContext } from '../../../utils/editor/contexts/EditorStateContext';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  unitNumber: number;
}

function AddArticleModal({
  isOpen,
  onClose,
  unitId,
  unitNumber,
}: ArticleModalProps) {
  const {
    data,
    updateContentField,
    saveContent,
    isSaving,
    clearContent,
    setContentState,
    getContentState,
    isDirty,
  } = useContentBlockContext();
  const {
    addContentBlock,
    removeContentBlockFromContext,
    editingBlock,
    setEditingBlock,
    getUnitState,
    updateUnitField,
  } = useUnitContext();
  const { editorContent } = useEditorStateContext();

  const modalRef = useRef<HTMLDivElement>(null);

  const canSave =
    data.title.trim() !== '' &&
    (editorContent?.trim() ?? '') !== '' &&
    !isSaving;

  useEffect(() => {
    if (!isOpen) return;

    const block =
      editingBlock?.unitNumber === unitNumber && editingBlock.blockIndex != null
        ? getUnitState(unitNumber)?.content[editingBlock.blockIndex]
        : null;

    if (block && block.type === 'article') {
      console.log('[AddArticleModal] Loaded block ID:', block.id);
      setContentState({
        ...block,
        isDirty: false,
        isSaving: false,
        error: null,
      });
    } else {
      clearContent();
      setContentState({
        unit_id: unitId,
        type: 'article',
        sortOrder: 0,
        isDirty: true,
        isSaving: false,
        error: null,
      });
    }
  }, [isOpen, editingBlock, getUnitState, unitId, unitNumber]);

  const handleSave = async () => {
    if (!canSave) return;

    try {
      updateContentField('isDirty', true);
      // Save the article to backend
      const savedBlock = await saveContent('article', editorContent);

      if (!savedBlock) {
        console.error('Error: Failed to save content block');
        return;
      }

      if (editingBlock) {
        // Update existing block in unit context
        const currentContent = getUnitState(unitNumber)?.content ?? [];
        const newBlocks = [...currentContent];
        newBlocks[editingBlock.blockIndex] = savedBlock;
        updateUnitField(unitNumber, 'content', newBlocks);
      } else {
        // Add new block to unit context (including the saved `id`)
        addContentBlock(unitNumber, savedBlock);
      }

      // Step 5: Cleanup
      clearContent();
      setEditingBlock(null);
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleClose = () => {
    const wasSaved = !!getContentState().id;
    if (!wasSaved && isDirty && !isSaving) {
      removeContentBlockFromContext(unitNumber, -1);
    }
    clearContent();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="text-gray-600">
              <EditIcon />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Article</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className="p-6 pb-0 flex-1 overflow-y-auto">
            <div className="mb-6 max-w-110">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={data.title}
                onChange={(e) => {
                  updateContentField('data', {
                    ...data,
                    title: e.target.value,
                  });
                  updateContentField('isDirty', true);
                }}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div className="mb-6">
              <EditorComposer initialHTML={data.content || '<p></p>'} />
            </div>
          </div>

          <div className="flex justify-end p-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 w-24 h-10"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddArticleModal;
