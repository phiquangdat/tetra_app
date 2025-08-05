import React, { useState } from 'react';
import { useModuleContext } from '../../../context/admin/ModuleContext.tsx';
import ConfirmationModal from '../createModule/ConfirmationModal.tsx';
import { useUnitContext } from '../../../context/admin/UnitContext.tsx';
import { useNavigate } from 'react-router-dom';

interface ModuleDetailsProps {
  onEdit?: () => void;
}

const ModuleDetailsUI: React.FC<ModuleDetailsProps> = ({ onEdit }) => {
  const {
    title,
    status,
    coverPicture,
    description,
    topic,
    pointsAwarded,
    removeModule,
  } = useModuleContext();
  const { setUnitStatesRaw } = useUnitContext();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleConfirmDelete = async () => {
    const success: boolean = await removeModule();

    if (success) {
      setUnitStatesRaw({}); // clear all units
      navigate('/admin/modules');
    }
  };

  return (
    <div className="bg-[#F9F5FF] border border-highlight rounded-3xl p-6 shadow-md text-primary w-full">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-extrabold">{title}</h1>
      </div>

      <p className="text-sm text-secondary mb-4">
        <span className="font-semibold">{status}</span>
      </p>

      <div className="mb-4">
        <p className="font-semibold">Cover picture</p>
        {coverPicture && (
          <img
            src={coverPicture}
            alt="Cover"
            className="rounded-xl mt-2 max-w-xs"
          />
        )}
      </div>

      <div className="mb-4">
        <p className="font-semibold">Description</p>
        <p className="mt-1">{description}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Topic</p>
        <p className="mt-1">{topic}</p>
      </div>

      <div className="mb-6">
        <p className="font-semibold">Points Awarded</p>
        <p className="mt-1">{pointsAwarded}</p>
      </div>

      {onEdit && (
        <div className="flex gap-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover"
          >
            Edit
          </button>
          <button
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            aria-label="Remove Module"
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-errorHover text-sm"
          >
            Delete
          </button>
        </div>
      )}

      {showDeleteModal && (
        <ConfirmationModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Remove Module"
          description="Are you sure you want to remove this module? This cannot be undone."
        />
      )}
    </div>
  );
};

export default ModuleDetailsUI;
