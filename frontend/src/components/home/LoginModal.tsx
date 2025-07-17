import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth/authApi';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const loginData = { email, password };
      console.log('Attempting login with:', loginData.email);
      const response = await loginUser(loginData);
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      sessionStorage.setItem('jwt_token', response.token);
      sessionStorage.setItem('user_id', response.id);
      sessionStorage.setItem('user_role', response.role.toLowerCase());

      if (response.role.toLowerCase() === 'admin') {
        navigate('/admin/');
      } else if (response.role.toLowerCase() === 'learner') {
        navigate('/user/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          onSubmit={(e) => {
            e.preventDefault();
            const email = emailInputRef.current?.value || '';
            const password = passwordInputRef.current?.value || '';
            handleLogin(email, password);
          }}
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
              ref={passwordInputRef}
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
            disabled={loading}
          >
            Log in
          </button>
        </form>
      </div>
      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-error px-4 py-2 rounded-lg shadow-md">
          {error}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-background"></div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;
