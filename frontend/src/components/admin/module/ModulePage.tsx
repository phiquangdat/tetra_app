import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';

interface ModulePageProps {
  id: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  const [module, setModule] = useState<Module | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getModule = async () => {
      try {
        const module = await fetchModuleById(id);
        console.log('Fetched module:', module); // Temporary log
        setModule(module);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unknown error: ');
        }
      } finally {
        setLoading(false);
      }
    };

    getModule();
  }, [id]);

  if (loading) return <div>Loading module...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!module) return <div>No module found.</div>;

  return (
    <div className="mx-auto px-8 py-8 min-h-screen bg-[#FFFFFF] text-left">
      <div className="mb-6">
        <a
          onClick={() => {
            return;
          }}
          className="inline-flex items-center text-[#998FC7] hover:text-[#231942] px-3 py-1 rounded-lg hover:bg-[#F9F5FF] hover:border hover:border-[#D4C2FC] active:bg-[#D4C2FC] transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Modules
        </a>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#231942] tracking-tight">
          {module.title}
        </h1>
      </div>
    </div>
  );
};

export default ModulePage;
