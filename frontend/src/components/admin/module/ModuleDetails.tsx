import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import ModuleDetailsUI from '../ui/ModuleDetails';

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
    return <div className="text-error">{error || 'Module not found'}</div>;

  return (
    <ModuleDetailsUI
      module={module}
      onEdit={() => {
        return;
      }}
    />
  );
};

export default ModuleDetails;
