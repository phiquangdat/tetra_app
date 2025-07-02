import { useEffect, useRef } from 'react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="relative bg-[#F3F3F3] rounded-3xl shadow-xl w-full max-w-md mx-4 p-8"
        role="document"
      >
        {/* Close button */}
        <button
          aria-label="Close login modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={0}
        >
          ×
        </button>
        <h2 className="text-3xl font-bold text-center mb-8 text-black">
          Login
        </h2>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-lg font-medium text-gray-800 mb-2"
            >
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-base"
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block text-lg font-medium text-gray-800 mb-2"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-base"
              required
            />
          </div>
          <div className="flex justify-end">
            <a
              href="#"
              tabIndex={0}
              className="text-sm text-gray-700 hover:underline focus:underline"
            >
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full mt-2 bg-blue-200 hover:bg-blue-300 text-black font-semibold py-3 rounded-full text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
