import React, { useState, useEffect, useRef } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../../context/auth/AuthContext';
import { getUserById } from '../../services/user/userApi';

const SettingsPage: React.FC = () => {
  const { userId, authToken } = useAuth();
  const [fields, setFields] = useState({
    name: '',
    email: '',
    role: '',
  });
  const [edit, setEdit] = useState({
    name: false,
    email: false,
  });
  const [inputs, setInputs] = useState({
    name: fields.name,
    email: fields.email,
  }); // Inputs used to store the original values
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUser = async () => {
      const user = await getUserById(userId, authToken);
      setFields({
        name: user.name,
        email: user.email,
        role: user.role,
      });
      console.log(user);
    };
    fetchUser();
  }, []);

  const handleStartEdit = (field: 'name' | 'email') => {
    setInputs((inputs) => ({ ...inputs, [field]: fields[field] }));
    setEdit((edit) => ({ ...edit, [field]: true }));
  };

  const handleSaveField = (field: 'name' | 'email') => {
    setEdit((edit) => ({ ...edit, [field]: false }));
    if (inputs[field] !== fields[field]) {
      setFields((f) => ({ ...f, [field]: inputs[field] }));
      console.log(inputs[field]);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6">
      <h1 className="text-[#231942] text-3xl font-semibold mb-6">Settings</h1>

      {/* First Card */}
      <div className="border border-highlight rounded-2xl bg-cardBackground p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label className="text-primary text-sm font-medium">Name</label>
          <div className="flex items-center justify-between mt-1">
            {edit.name ? (
              <>
                <input
                  type="text"
                  className="text-primary bg-background border border-highlight rounded-lg p-2 text-base focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={inputs.name}
                  onChange={(e) =>
                    setInputs((i) => ({ ...i, name: e.target.value }))
                  }
                  ref={nameInputRef}
                  autoFocus
                />
                <button
                  type="button"
                  className="bg-surface hover:bg-surfaceHover text-background px-5 py-2 rounded-lg text-sm font-medium transition"
                  onClick={() => handleSaveField('name')}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="text-primary text-base">{fields.name}</span>
                <button
                  className="bg-secondary hover:bg-secondaryHover text-background text-sm font-medium px-5 py-2 rounded-lg transition"
                  onClick={() => handleStartEdit('name')}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-primary text-sm font-medium">Email</label>
          <div className="flex items-center justify-between mt-1">
            {edit.email ? (
              <>
                <input
                  type="email"
                  className="text-primary bg-background border border-highlight rounded-lg p-2 text-base focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={inputs.email}
                  onChange={(e) =>
                    setInputs((i) => ({ ...i, email: e.target.value }))
                  }
                  ref={emailInputRef}
                  autoFocus
                />
                <button
                  type="button"
                  className="bg-surface hover:bg-surfaceHover text-background text-sm font-medium px-5 py-2 rounded-lg transition"
                  onClick={() => handleSaveField('email')}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="text-primary text-base">{fields.email}</span>
                <button
                  className="bg-secondary hover:bg-secondaryHover text-background text-sm font-medium px-5 py-2 rounded-lg transition"
                  onClick={() => handleStartEdit('email')}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="text-primary text-sm font-medium">Role</label>
          <div className="mt-1 text-primary text-base">{fields.role}</div>
        </div>
      </div>

      {/* Second Card */}
      <div className="border border-highlight rounded-2xl bg-[#F9F5FF] p-6 shadow-sm">
        <h2 className="text-surface text-lg font-semibold mb-4">
          Password and Authentication
        </h2>
        <button
          className="bg-surface hover:bg-surfaceHover text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          onClick={handleOpenModal}
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
