import React from 'react';
import { type Module } from '../../../services/module/moduleApi';

interface ModuleDetailsProps {
  module: Module;
  onEdit?: () => void;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ module, onEdit }) => {
  return (
    <div className="bg-[#F9F5FF] border border-highlight rounded-3xl p-6 shadow-md text-primary w-full">
      <h1 className="text-2xl font-extrabold">{module.title}</h1>

      <p className="text-sm text-secondary mb-4">
        <span className="font-semibold">{module.status}</span>
      </p>

      <div className="mb-4">
        <p className="font-semibold">Cover picture</p>
        <img
          src={module.coverUrl}
          alt="Cover"
          className="rounded-xl mt-2 max-w-xs"
        />
      </div>

      <div className="mb-4">
        <p className="font-semibold">Description</p>
        <p className="mt-1">{module.description}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Topic</p>
        <p className="mt-1">{module.topic}</p>
      </div>

      <div className="mb-6">
        <p className="font-semibold">Points Awarded</p>
        <p className="mt-1">{module.points}</p>
      </div>

      {onEdit && (
        <div className="flex gap-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondaryHover"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ModuleDetails;
