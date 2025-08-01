import { EditIcon, CloseIcon } from '../../common/Icons';
import { useEffect, useRef } from 'react';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import EditorComposer from '../../../utils/editor/EditorComposer.tsx';
import { useEditorStateContext } from '../../../utils/editor/contexts/EditorStateContext.tsx';

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
    isDirty,
  } = useContentBlockContext();
  const { addContentBlock, removeContentBlock } = useUnitContext();
  const { editorContent } = useEditorStateContext();

  const modalRef = useRef<HTMLDivElement>(null);

  const canSave =
    data.title.trim() !== '' &&
    (data.content?.trim() ?? '') !== '' &&
    !isSaving;

  useEffect(() => {
    if (editorContent !== data.content) {
      updateContentField('data', {
        ...data,
        content: editorContent,
      });
    }
  }, [editorContent]);

  useEffect(() => {
    if (isOpen) {
      clearContent();
      // Set unit_id in context and add temp block
      setContentState({
        unit_id: unitId,
        type: 'article',
        sortOrder: 0,
        isDirty: true,
        isSaving: false,
        error: null,
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    console.log('editorContent:', editorContent);

    if (!canSave) return;

    updateContentField('data', {
      ...data,
      content: editorContent,
    });

    try {
      await saveContent('article');

      // Update content in unit context
      addContentBlock(unitNumber, {
        type: 'article',
        data: {
          title: data.title.trim(),
          content: editorContent,
        },
        sortOrder: 0,
        unit_id: unitId,
        isDirty: false,
        isSaving: false,
        error: null,
      });

      clearContent();
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleClose = () => {
    // If block is unsaved, remove from unit context
    if (isDirty && !isSaving) {
      removeContentBlock(unitNumber, -1); // remove last (temp) block
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
                onChange={(e) =>
                  updateContentField('data', {
                    ...data,
                    title: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div className="mb-6">
              <EditorComposer />
            </div>
          </div>

          <div className="flex justify-end p-6">
            <button
              type="button"
              aria-label="Save Article"
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
