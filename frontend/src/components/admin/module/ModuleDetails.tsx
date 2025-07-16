import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';

interface ModuleDetailsProps {
  id: string;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ id }) => {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadModule = async () => {
      try {
        const data = await fetchModuleById(id);
        setModule(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load module');
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [id]);

  if (loading) return <div>Loading module...</div>;
  if (error || !module)
    return <div className="text-red-500">{error || 'Module not found'}</div>;

  return (
    <div className="bg-[#F9F5FF] border border-[#D4C2FC] rounded-3xl p-6 shadow-md text-[#231942] w-full">
      {/* Module Title */}
      <h1 className="text-2xl font-extrabold">{module.title}</h1>

      {/* Status */}
      <p className="text-sm text-[#998FC7] mb-4">
        <span className="font-semibold">{module.status}</span>
      </p>

      {/* Cover */}
      <div className="mb-4">
        <p className="font-semibold">Cover picture</p>
        <img
          src={module.coverUrl}
          alt="Cover"
          className="rounded-xl mt-2 max-w-xs"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="font-semibold">Description</p>
        <p className="mt-1">{module.description}</p>
      </div>

      {/* Topic */}
      <div className="mb-4">
        <p className="font-semibold">Topic</p>
        <p className="mt-1">{module.topic}</p>
      </div>

      {/* Points */}
      <div className="mb-6">
        <p className="font-semibold">Points Awarded</p>
        <p className="mt-1">{module.points}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            return;
          }}
          className="px-4 py-2 bg-[#998FC7] text-white rounded-lg hover:bg-[#7d6bb3]"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ModuleDetails;
