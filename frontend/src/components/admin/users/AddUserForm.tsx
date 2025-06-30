import { useState } from 'react';

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
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex bg-gray-200 rounded-t-2xl items-center justify-between p-4">
          <h2 className="text-lg font-medium text-gray-900">Add New User</h2>

          <button
            onClick={handleClose}
            className="cursor-pointer hover:bg-gray-300 rounded-full p-1"
          >
            X
          </button>
        </div>

        <div className="text-center">
          <div className="p-6 pb-0 flex-1 overflow-y-auto">
            <div className="flex mb-6 items-center">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2 w-1/2"
              >
                Full Name
              </label>
              <div className="w-full">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    errors.name = undefined;
                    setName(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-400'
                  }`}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex mb-6 items-center">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2 w-1/2"
              >
                Email
              </label>
              <div className="w-full">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    errors.email = undefined;
                    setEmail(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-400'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex mb-6 items-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2 w-1/2"
              >
                Password
              </label>
              <div className="w-full">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    errors.password = undefined;
                    setPassword(e.target.value);
                  }}
                  className={`w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-400'
                  }`}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 text-left">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex mb-6 items-center">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2 w-1/2"
              >
                Role
              </label>
              <div className="w-full">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Learner">Learner</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end p-6">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 mr-4 w-24 h-10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-500 text-white text-sm px-4 py-1 rounded-lg cursor-pointer hover:bg-blue-600 w-24 h-10"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
