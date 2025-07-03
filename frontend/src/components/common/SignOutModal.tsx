interface SignOutModalProps {
  open: boolean;
  onCancel: () => void;
}

const SignOutModal = ({ open, onCancel }: SignOutModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center text-center backdrop-blur">
      <div className="bg-white rounded-lg border border-[#282626] p-8 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-6 text-[#14248A]">Sign Out</h2>
        <p className="mb-8 text-gray-700">Are you sure you want to sign out?</p>

        <div className="flex justify-center gap-10 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-[#998fc7] text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-[#14248A] text-white cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;
