import { EditIcon, CloseIcon } from '../../common/Icons';
import { useRef } from 'react';
import { useContentBlockContext } from '../../../context/admin/UnitContext';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (article: { title: string; content: string }) => void;
  unitId: string;
}

function AddArticleModal({
  isOpen,
  onClose,
  onAddContent,
  unitId,
}: AddArticleModalProps) {
  const { data, updateContentField, saveContent, isSaving, clearContent } =
    useContentBlockContext();

  const modalRef = useRef<HTMLDivElement>(null);

  const canSave =
    data.title.trim() !== '' &&
    (data.content?.trim() ?? '') !== '' &&
    !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      const title = data.title.trim();
      const content = data.content?.trim();

      await saveContent(unitId, 'quiz');
      onAddContent({ title, content: content ?? '' });
      clearContent();
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
    }
  };

  const handleClose = () => {
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
      className="fixed inset-0 flex items-center justify-center z-10 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
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
              <textarea
                id="content"
                name="content"
                value={data.content}
                onChange={(e) =>
                  updateContentField('data', {
                    ...data,
                    content: e.target.value,
                  })
                }
                placeholder="Start writing your article..."
                className="w-full h-80 px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end p-6">
            <button
              type="button"
              aria-label="Save Article"
              onClick={handleSave}
              disabled={!canSave || isSaving}
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
