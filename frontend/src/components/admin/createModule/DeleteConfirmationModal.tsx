import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  onCancel,
  onConfirm,
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
          Remove Module
        </h2>

        <p
          id="delete-modal-desc"
          className="text-primary text-center mb-8 leading-relaxed"
        >
          Are you sure you want to remove this module? This cannot be undone.
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
            Remove
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  );
}
