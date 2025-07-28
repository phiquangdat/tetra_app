import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import ModuleDetailsUI from '../ui/ModuleDetailsUI.tsx';
import { useModuleContext } from '../../../context/admin/ModuleContext';
import { initialModuleState } from '../../../context/admin/ModuleContext';

interface ModuleDetailsProps {
  id: string;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ id }) => {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { setModuleState } = useModuleContext();

  useEffect(() => {
    setModuleState(initialModuleState);

    const loadModule = async () => {
      try {
        const data = await fetchModuleById(id);

        setModuleState({
          id: data.id,
          title: data.title,
          description: data.description,
          topic: data.topic,
          pointsAwarded: data.points,
          coverPicture: data.coverUrl,
          status: data.status,
          isDirty: false,
          error: null,
        });

        setModule(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load module');
      } finally {
        setLoading(false);
      }
    };
    loadModule();
  }, [id, setModuleState]);

  if (loading) return <div>Loading module...</div>;
  if (error || !module)
    return <div className="text-error">{error || 'Module not found'}</div>;

  return (
    <ModuleDetailsUI
      onEdit={() => {
        return;
      }}
    />
  );
};

export default ModuleDetails;
