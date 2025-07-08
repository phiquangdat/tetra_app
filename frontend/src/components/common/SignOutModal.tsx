import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SignOutModalProps {
  open: boolean;
  onCancel: () => void;
}

const SignOutModal = ({ open, onCancel }: SignOutModalProps) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm relative shadow-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[#231942] hover:text-[#7E6BBE] transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-[#14248A] text-2xl font-semibold mb-6 text-center">
          Sign Out
        </h2>
        <p className="mb-8 text-[#231942]">
          Are you sure you want to sign out?
        </p>

        <div className="flex justify-center gap-10 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#7E6BBE] hover:bg-[#6c5aa9] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#14248A] hover:bg-[#101e72] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  );
};

export default SignOutModal;
