import { useState } from 'react';
import { X } from 'lucide-react';

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const AddUserForm = ({ isOpen, onClose }: AddUserFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Learner');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log('Creating user:', { name, email, role, password });

    if (!validateForm()) {
      return;
    }

    setName('');
    setEmail('');
    setRole('Learner');
    setPassword('');
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('Learner');
    setPassword('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl w-full max-w-md">
        <div className="flex bg-cardBackground rounded-t-2xl items-center justify-between px-6 py-4">
          <h2 className="text-surface text-xl font-semibold text-center">
            Add New User
          </h2>

          <button
            onClick={handleClose}
            className="top-4 right-4 text-primary hover:text-secondaryHover transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-center">
          <div className="p-6 pb-0 flex-1 overflow-y-auto">
            <form className="space-y-4">
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="name"
                    className="text-primary text-sm font-medium min-w-[120px]"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      errors.name = undefined;
                      setName(e.target.value);
                    }}
                    className={`flex-1 bg-cardBackground border ${errors.name ? 'border-error' : 'border-highlight'} rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary`}
                    required
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-4 mt-1">
                    <div className="min-w-[120px]" />
                    <p className="text-error text-xs font-medium text-left flex-1">
                      {errors.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="email"
                    className="text-primary text-sm font-medium min-w-[120px]"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      errors.email = undefined;
                      setEmail(e.target.value);
                    }}
                    className={`flex-1 bg-cardBackground border ${errors.email ? 'border-error' : 'border-highlight'} rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary`}
                    required
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-4 mt-1">
                    <div className="min-w-[120px]" />
                    <p className="text-error text-xs font-medium text-left flex-1">
                      {errors.email}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="password"
                    className="text-primary text-sm font-medium min-w-[120px]"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      errors.password = undefined;
                      setPassword(e.target.value);
                    }}
                    className={`flex-1 bg-cardBackground border ${errors.password ? 'border-error' : 'border-highlight'} rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary`}
                    required
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center gap-4 mt-1">
                    <div className="min-w-[120px]" />
                    <p className="text-error text-xs font-medium text-left flex-1">
                      {errors.password}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="role"
                    className="text-primary text-sm font-medium min-w-[120px]"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 bg-cardBackground border border-highlight rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option value="Learner">Learner</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-secondary hover:bg-secondaryHover text-background px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-surface hover:bg-surfaceHover text-background px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
