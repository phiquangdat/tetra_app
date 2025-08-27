import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CloseIcon,
  VideoHeaderIcon,
  VideoUploadIcon,
} from '../../common/Icons';
import { useContentBlockContext } from '../../../context/admin/ContentBlockContext.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  unitNumber: number;
};

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.*[?&]v=|v\/|e\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function AddVideoModal({ isOpen, onClose, unitId, unitNumber }: Props) {
  const {
    updateContentField,
    saveContent,
    clearContent,
    setContentState,
    getContentState,
  } = useContentBlockContext();
  const {
    addContentBlock,
    getUnitState,
    updateUnitField,
    editingBlock,
    setEditingBlock,
    getNextSortOrder,
  } = useUnitContext();

  const contentBlock = getContentState();
  const { data, isSaving, error } = contentBlock;

  const [canSave, setCanSave] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    setCanSave(
      Boolean(
        data?.title?.trim() &&
          data?.url?.trim() &&
          data?.content?.trim() &&
          isValidUrl &&
          !isSaving,
      ),
    );
  }, [data]);

  useEffect(() => {
    if (showConfirmClose || !isOpen) return;

    const block =
      editingBlock?.unitNumber === unitNumber && editingBlock.blockIndex != null
        ? getUnitState(unitNumber)?.content[editingBlock.blockIndex]
        : null;

    if (block && block.type === 'video') {
      setContentState({
        ...block,
        isDirty: false,
        isSaving: false,
        error: null,
      });
    } else {
      const nextSortOrder = getNextSortOrder(unitNumber);
      clearContent();
      setContentState({
        unit_id: unitId,
        type: 'video',
        sortOrder: nextSortOrder,
        isDirty: true,
        isSaving: false,
        error: null,
      });
    }
  }, [isOpen]);

  const isYouTubeUrl = useCallback(
    (url: string) => YOUTUBE_REGEX.test(url),
    [],
  );
  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const match = url.match(YOUTUBE_REGEX);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }, []);

  const isValidUrl =
    data.url && (data.url.endsWith('.mp4') || isYouTubeUrl(data.url));

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

  const handleSave = async () => {
    if (!canSave) return;
    try {
      const savedBlock = await saveContent('video');
      if (!savedBlock) return;

      if (editingBlock) {
        const currentContent = getUnitState(unitNumber)?.content ?? [];
        const newBlocks = [...currentContent];
        newBlocks[editingBlock.blockIndex] = savedBlock;
        updateUnitField(unitNumber, 'content', newBlocks);
      } else {
        addContentBlock(unitNumber, savedBlock);
      }

      clearContent();
      setEditingBlock(null);
      setShowConfirmClose(false);
      onClose();
    } catch (error) {
      console.error('[AddVideoModal] Save failed:', error);
    }
  };

  const attemptClose = () => {
    if (showConfirmClose) return;
    if (
      (data.title?.trim() ?? '') !== '' ||
      (data.content?.trim() ?? '') !== '' ||
      (data.url?.trim() ?? '') !== ''
    ) {
      setShowConfirmClose(true);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    clearContent();
    setShowConfirmClose(false);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      attemptClose();
    }
  };

  const renderVideoInput = () => (
    <div className="flex flex-col items-center py-8">
      <div className="p-2 bg-white rounded-2xl shadow-sm border border-highlight/30 mb-4">
        <VideoUploadIcon />
      </div>
      <input
        type="url"
        placeholder="Paste video URL here (MP4 or YouTube)"
        value={data.url}
        onChange={(e) =>
          updateContentField('data', {
            ...data,
            url: e.target.value,
          })
        }
        className="w-full max-w-md px-4 py-3 border border-primary/50 rounded-lg bg-background text-primary placeholder:text-secondary/70 focus:outline-none focus:border-2 focus:border-surface/70 transition-colors"
      />
      <p className="mt-3 text-sm text-secondary text-center">
        Supports MP4 files and YouTube links
      </p>
    </div>
  );

  const renderPreview = () => (
    <div className="w-full">
      {isYouTubeUrl(data.url ?? '') ? (
        <iframe
          className="w-full aspect-video rounded-xl"
          src={getYouTubeEmbedUrl(data.url ?? '') ?? undefined}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={data.title || 'Video preview'}
          aria-label="video preview"
        />
      ) : (
        <video
          className="w-full aspect-video rounded-xl"
          controls
          src={data.url}
        />
      )}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={() =>
            updateContentField('data', {
              ...data,
              url: '',
            })
          }
          className="bg-accent px-4 py-2 text-base text-white font-semibold hover:text-surfaceHover border border-surface/20 hover:bg-[#FFB74D] rounded-xl transition-colors"
          disabled={isSaving}
        >
          Change Video
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between bg-cardBackground px-8 py-4 border-b border-highlight/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-2xl shadow-sm border border-highlight/30">
              <VideoHeaderIcon color="var(--color-surface)" />
            </div>
            <h2 className="text-xl font-semibold text-primary">
              Add New Video
            </h2>
          </div>
          <button
            type="button"
            onClick={attemptClose}
            className="text-primary hover:text-secondaryHover transition-colors p-2 rounded-lg hover:bg-cardBackground"
            disabled={isSaving}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label
              htmlFor="videoTitle"
              className="block text-base font-semibold text-primary mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="videoTitle"
              value={data.title}
              onChange={(e) =>
                updateContentField('data', {
                  ...data,
                  title: e.target.value,
                })
              }
              placeholder="Enter video title"
              className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-primary mb-2">
              Video
            </label>
            <div className="border-2 border-dashed border-highlight rounded-2xl p-6 bg-cardBackground">
              {isValidUrl ? renderPreview() : renderVideoInput()}
            </div>
          </div>

          <div>
            <label
              htmlFor="videoDescription"
              className="block text-base font-semibold text-primary mb-2"
            >
              Description
            </label>
            <textarea
              id="videoDescription"
              value={data.content}
              onChange={(e) =>
                updateContentField('data', {
                  ...data,
                  content: e.target.value,
                })
              }
              placeholder="Enter video description..."
              rows={5}
              className="w-full px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
              required
              disabled={isSaving}
            />
          </div>

          <div>
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
              placeholder="Enter video points"
              required
              className="px-4 py-3 border border-primary/50 rounded-lg text-primary placeholder:text-primary/40 focus:border-2 focus:border-surface/70 outline-none transition-colors duration-200"
              aria-label="points"
            />
          </div>
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <div className="flex items-center justify-end gap-4 px-8 py-4 border-t border-highlight bg-cardBackground">
          <button
            type="button"
            onClick={attemptClose}
            className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-surface hover:bg-surfaceHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canSave || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {showConfirmClose && (
        <ConfirmationModal
          onCancel={() => {
            setShowConfirmClose(false);
          }}
          onConfirm={() => {
            setShowConfirmClose(false);
            handleClose();
          }}
          title="Discard Changes?"
          description="You have unsaved changes. Are you sure you want to close? This action cannot be undone."
          confirmText="Discard"
          buttonColor="bg-error hover:bg-errorHover"
        />
      )}
    </div>
  );
}

export default AddVideoModal;
