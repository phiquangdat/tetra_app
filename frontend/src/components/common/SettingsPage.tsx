import React, { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../../context/auth/AuthContext';
import { getUserById } from '../../services/user/userApi';
import { updateUserName, updateUserEmail } from '../../services/user/userApi';

const SettingsPage: React.FC = () => {
  const { userId, authToken } = useAuth();
  const [fields, setFields] = useState({ name: '', email: '', role: '' });
  const [edit, setEdit] = useState({ name: false, email: false });
  const [inputs, setInputs] = useState({ name: '', email: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'name' | 'email' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<{
    name: string | null;
    email: string | null;
  }>({ name: null, email: null });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getUserById(userId, authToken);
        setFields({ name: user.name, email: user.email, role: user.role });
        setInputs({ name: user.name, email: user.email });
      } catch (error: any) {
        let message = 'Unexpected error occurred. Please try again.';
        if (error instanceof Error) {
          if (error.message.includes('400') || error.message.includes('401')) {
            message =
              'You are not authorized. Please log in to view this content.';
          } else if (error.message.includes('403')) {
            message =
              'Access denied. You do not have permission to view this user.';
          } else if (error.message.includes('404')) {
            message = 'User not found with the given ID.';
          }
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, authToken]);

  const handleStartEdit = (field: 'name' | 'email') => {
    setInputs((inputs) => ({ ...inputs, [field]: fields[field] }));
    setEdit((edit) => ({ ...edit, [field]: true }));
    setErrorField((prev) => ({ ...prev, [field]: null }));
  };

  const validateField = (field: 'name' | 'email', value: string) => {
    if (!value.trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (field === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      return 'Invalid email address';
    }
    return null;
  };

  const handleSaveField = async (field: 'name' | 'email') => {
    setErrorField((prev) => ({ ...prev, [field]: null }));
    setSaving(field);
    try {
      if (field === 'name' && userId) {
        await updateUserName(userId, inputs.name);
        setFields((f) => ({ ...f, name: inputs.name }));
      } else if (field === 'email' && userId) {
        await updateUserEmail(userId, inputs.email);
        setFields((f) => ({ ...f, email: inputs.email }));
      }
      setEdit((edit) => ({ ...edit, [field]: false }));
    } catch (error: any) {
      setErrorField((prev) => ({
        ...prev,
        [field]:
          error instanceof Error ? 'Email already exists' : 'Failed to update',
      }));
    } finally {
      setSaving(null);
    }
  };

  const handleInputChange = (field: 'name' | 'email', value: string) => {
    setInputs((i) => ({ ...i, [field]: value }));
    // Validate and show error as user types
    setErrorField((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-background"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6">
      <h1 className="text-[#231942] text-3xl font-semibold mb-6">Settings</h1>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg mb-6 w-fit mx-auto text-center">
          {error}
        </div>
      )}

      {/* First Card */}
      <div className="border border-highlight rounded-2xl bg-cardBackground p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label className="text-primary text-sm font-medium">Name</label>
          {edit.name ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveField('name');
              }}
              className="flex items-center justify-between mt-1"
            >
              <input
                type="text"
                className={`text-primary bg-background border rounded-lg p-2 text-base focus:outline-none ${errorField.name ? 'border-error' : 'border-highlight focus:ring-2 focus:ring-secondary'}`}
                value={inputs.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                autoFocus
                placeholder="Enter your name"
                required
                autoComplete="name"
              />
              {errorField.name && (
                <p className="text-error text-base">{errorField.name}</p>
              )}
              <button
                type="submit"
                className="bg-surface hover:bg-surfaceHover text-background px-5 py-2 rounded-lg text-sm font-medium transition flex items-center"
                disabled={saving === 'name'}
              >
                {saving === 'name' ? (
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-background rounded-full"></span>
                ) : null}
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <span className="text-primary text-base">
                {fields.name || ''}
              </span>
              <button
                className="bg-secondary hover:bg-secondaryHover text-background text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStartEdit('name')}
                disabled={!!error || loading}
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="text-primary text-sm font-medium">Email</label>
          {edit.email ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveField('email');
              }}
              className="flex items-center justify-between mt-1"
            >
              <input
                type="email"
                className={`text-primary bg-background border rounded-lg p-2 text-base focus:outline-none ${errorField.email ? 'border-error' : 'border-highlight focus:ring-2 focus:ring-secondary'}`}
                value={inputs.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoFocus
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
              {errorField.email && (
                <p className="text-error text-base">{errorField.email}</p>
              )}
              <button
                type="submit"
                className="bg-surface hover:bg-surfaceHover text-background text-sm font-medium px-5 py-2 rounded-lg transition flex items-center"
                disabled={saving === 'email'}
              >
                {saving === 'email' ? (
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-background rounded-full"></span>
                ) : null}
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <span className="text-primary text-base">
                {fields.email || ''}
              </span>
              <button
                className="bg-secondary hover:bg-secondaryHover text-background text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStartEdit('email')}
                disabled={!!error || loading}
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-primary text-sm font-medium">Role</label>
          <div className="mt-1 text-primary text-base">{fields.role || ''}</div>
        </div>
      </div>

      {/* Second Card */}
      <div className="border border-highlight rounded-2xl bg-[#F9F5FF] p-6 shadow-sm">
        <h2 className="text-surface text-lg font-semibold mb-4">
          Password and Authentication
        </h2>
        <button
          className="bg-surface hover:bg-surfaceHover text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleOpenModal}
          disabled={!!error || loading}
        >
          Change password
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && <ChangePasswordModal onClose={handleCloseModal} />}
    </div>
  );
};

export default SettingsPage;
