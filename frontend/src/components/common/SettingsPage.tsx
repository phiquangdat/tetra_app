import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const SettingsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6">
      <h1 className="text-[#231942] text-3xl font-semibold mb-6">Settings</h1>

      {/* First Card */}
      <div className="border border-[#D4C2FC] rounded-2xl bg-[#F9F5FF] p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <label className="text-[#231942] text-sm font-medium">Name</label>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[#231942] text-base">Jane Doe</span>
            <button className="bg-[#7E6BBE] hover:bg-[#6c5aa9] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[#231942] text-sm font-medium">Email</label>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[#231942] text-base">
              jane.doe@example.com
            </span>
            <button className="bg-[#7E6BBE] hover:bg-[#6c5aa9] text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>

        <div>
          <label className="text-[#231942] text-sm font-medium">Role</label>
          <div className="mt-1 text-[#231942] text-base">Administrator</div>
        </div>
      </div>

      {/* Second Card */}
      <div className="border border-[#D4C2FC] rounded-2xl bg-[#F9F5FF] p-6 shadow-sm">
        <h2 className="text-[#14248A] text-lg font-semibold mb-4">
          Password and Authentication
        </h2>
        <button
          className="bg-[#14248A] hover:bg-[#101e72] text-white text-sm font-medium px-5 py-2 rounded-lg transition"
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
