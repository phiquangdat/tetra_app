import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
}

export default function ConfirmationModal({
  onCancel,
  onConfirm,
  title = 'Remove Item',
  description = 'Are you sure you want to remove this item? This cannot be undone.',
  confirmText = 'Remove',
}: Props) {
  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl p-8 max-w-sm w-full relative shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-primary hover:text-secondaryHover transition p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2
          id="delete-modal-title"
          className="text-surface text-2xl font-semibold mb-4 text-center"
        >
          {title}
        </h2>

        <p
          id="delete-modal-desc"
          className="text-primary text-center mb-8 leading-relaxed"
        >
          {description}
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-secondary hover:bg-secondaryHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-error hover:bg-errorHover text-background px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  );
}
