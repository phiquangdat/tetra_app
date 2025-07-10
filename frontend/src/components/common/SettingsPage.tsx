import React, { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const SettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <span className="text-primary text-base">Jane Doe</span>
            <button className="bg-secondary hover:bg-secondaryHover text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-primary text-sm font-medium">Email</label>
          <div className="flex items-center justify-between mt-1">
            <span className="text-primary text-base">jane.doe@example.com</span>
            <button className="bg-secondary hover:bg-secondaryHover text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>

        <div>
          <label className="text-primary text-sm font-medium">Role</label>
          <div className="mt-1 text-primary text-base">Administrator</div>
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
