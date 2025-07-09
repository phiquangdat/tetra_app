import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl"
        role="document"
      >
        {/* Close button */}
        <button
          aria-label="Close login modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#231942] hover:text-[#7E6BBE] transition"
          tabIndex={0}
        >
          <X size={20} />
        </button>
        <h2 className="text-[#14248A] text-2xl font-semibold mb-6 text-center">
          Login
        </h2>
        <form
          className="space-y-4"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
        >
          <div>
            <label
              htmlFor="login-email"
              className="text-[#231942] text-sm font-medium mb-1 block"
            >
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-[#231942] focus:outline-none focus:ring-2 focus:ring-[#7E6BBE]"
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="text-[#231942] text-sm font-medium mb-1 block"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-[#231942] focus:outline-none focus:ring-2 focus:ring-[#7E6BBE]"
              required
            />
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              tabIndex={0}
              className="text-sm text-[#231942] hover:underline focus:underline"
            >
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            className="w-1/2 bg-[#14248A] hover:bg-[#101e72] text-white px-5 py-3 rounded-lg text-sm font-medium transition block mx-auto"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
