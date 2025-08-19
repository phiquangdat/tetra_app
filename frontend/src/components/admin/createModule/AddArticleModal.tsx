import { EditIcon, CloseIcon } from '../../common/Icons';
import { useEffect, useRef, useState } from 'react';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import EditorComposer from '../../../utils/editor/EditorComposer.tsx';
import { useEditorStateContext } from '../../../utils/editor/contexts/EditorStateContext.tsx';

import { validateAttachment } from '../../../utils/validateAttachment.ts';

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
  } = useContentBlockContext();
  const {
    addContentBlock,
    editingBlock,
    setEditingBlock,
    getUnitState,
    updateUnitField,
    getNextSortOrder,
  } = useUnitContext();
  const { editorContent } = useEditorStateContext();

  const modalRef = useRef<HTMLDivElement>(null);

  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setFileError(null);
    } else {
      const nextSortOrder = getNextSortOrder(unitNumber);
      clearContent();
      setContentState({
        unit_id: unitId,
        type: 'article',
        sortOrder: nextSortOrder,
        isDirty: true,
        isSaving: false,
        error: null,
      });
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    clearContent();
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setFileError(null);
      // Placeholder for clearing the file input in context
      return;
    }

    const result = validateAttachment(file);

    if (result.ok) {
      setFileError(null);
      // Placeholder for updating the file in context
    } else {
      setFileError(result.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Placeholder for clearing the file input in context
    }
  };

  const handleChangePoints = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      updateContentField('data', { ...data, points: '' });
      return;
    }

    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      updateContentField('data', { ...data, points: numValue });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center bg-black/60 backdrop-blur-sm justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        <div className="flex items-center justify-between bg-cardBackground px-8 py-4 border-b border-highlight/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-2xl shadow-sm border border-highlight/30">
              <EditIcon color="var(--color-surface)" />
            </div>
            <h2 className="text-xl font-semibold text-primary">
              Add New Article
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-primary hover:text-secondaryHover transition-colors p-2 rounded-lg hover:bg-cardBackground"
            disabled={isSaving}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
          <div className="p-8 pb-0 flex-1 overflow-y-auto">
            <div className="mb-6 max-w-110">
              <label
                htmlFor="title"
                className="block text-base font-semibold text-primary mb-2 flex items-center gap-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Enter article title"
                value={data.title}
                onChange={(e) => {
                  updateContentField('data', {
                    ...data,
                    title: e.target.value,
                  });
                  updateContentField('isDirty', true);
                }}
                className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                required
              />
            </div>

            <div className="mb-6 max-w-110">
              <label
                htmlFor="attachment"
                className="block text-base font-semibold text-primary mb-2 items-center gap-2"
              >
                Attachment
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="attachment"
                name="attachment"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-surface file:text-background file:cursor-pointer hover:file:bg-surfaceHover"
                aria-describedby="attachment-error"
                aria-invalid={fileError ? true : false}
              />
              {fileError && (
                <p
                  id="attachment-error"
                  className="mt-2 text-sm text-red-500"
                  role="alert"
                  aria-live="polite"
                >
                  {fileError}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-base font-semibold text-primary mb-2 flex items-center gap-2">
                Content
              </label>
              <EditorComposer initialHTML={data.content || '<p></p>'} />
            </div>

            <div className="mb-6">
              <label
                htmlFor="points"
                className="block text-base font-semibold text-primary mb-2"
              >
                Points
              </label>
              <input
                type="text"
                id="points"
                value={
                  data.points !== undefined && data.points !== null
                    ? String(data.points)
                    : ''
                }
                onChange={handleChangePoints}
                placeholder="Enter article points"
                required
                className="px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
                aria-label="points"
              />
            </div>
          </div>

          <div className="flex justify-end px-8 py-4 border-t border-highlight bg-cardBackground gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="bg-surface hover:bg-surfaceHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
