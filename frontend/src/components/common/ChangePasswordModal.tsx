import React from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#231942] hover:text-[#7E6BBE] transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <h2 className="text-[#14248A] text-2xl font-semibold mb-6 text-center">
          Change password
        </h2>

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="text-[#231942] text-sm font-medium mb-1 block">
              Current password
            </label>
            <input
              type="password"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-[#231942] focus:outline-none focus:ring-2 focus:ring-[#7E6BBE]"
            />
          </div>

          <div>
            <label className="text-[#231942] text-sm font-medium mb-1 block">
              New password
            </label>
            <input
              type="password"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-[#231942] focus:outline-none focus:ring-2 focus:ring-[#7E6BBE]"
            />
          </div>

          <div>
            <label className="text-[#231942] text-sm font-medium mb-1 block">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-[#231942] focus:outline-none focus:ring-2 focus:ring-[#7E6BBE]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#7E6BBE] hover:bg-[#6c5aa9] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#14248A] hover:bg-[#101e72] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
