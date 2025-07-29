import React from 'react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { updateUserPassword } from '../../services/user/userApi';
import { useAuth } from '../../context/auth/AuthContext';
interface Props {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const { userId } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setErrors(errors);

    try {
      await updateUserPassword(
        userId!,
        formData.oldPassword,
        formData.newPassword,
      );
      console.log('Password updated successfully');
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes('400')) {
        setErrors((prev) => ({
          ...prev,
          oldPassword: 'Old password is incorrect',
        }));
      }
    }
  };

  const validateForm = (data: typeof formData) => {
    const errors: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    } = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    if (!data.oldPassword) {
      errors.oldPassword = 'Old password is required';
    }
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'New passwords do not match';
    }
    if (data.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }
    return errors;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary hover:text-secondaryHover transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <h2 className="text-surface text-2xl font-semibold mb-6 text-center">
          Change password
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="oldPassword"
              className="text-primary text-sm font-medium mb-1 block"
            >
              Current password
            </label>
            <input
              id="oldPassword"
              type="password"
              className="w-full bg-[#F9F5FF] border border-[#D4C2FC] rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
            />
            {errors.oldPassword && (
              <p className="text-error text-sm mt-1">{errors.oldPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="text-primary text-sm font-medium mb-1 block"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full bg-[#F9F5FF] border border-highlight rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <p className="text-error text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-[#231942] text-sm font-medium mb-1 block"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full bg-[#F9F5FF] border border-highlight rounded-lg p-2.5 text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-error text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary hover:bg-secondaryHover text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-surface hover:bg-surfaceHover text-white px-5 py-2 rounded-lg text-sm font-medium transition"
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
