import React, { useEffect, useState } from 'react';
import { fetchModuleById, type Module } from '../api/modules';

interface ModulePageProps {
  id: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getModule = async () => {
      try {
        const data = await fetchModuleById(id);
        console.log('Fetched module:', data); // Temporary log
        setModule(data);
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
    <div>
      <h1>{module.title}</h1>
      <button type='button' disabled>Start</button>

      <section>
        <h2>About this module</h2>
        <div>{module.description}</div>
        <div>Points available: {module.points}</div>
      </section>

      <section>
        <h2>Syllabus</h2>
        <div>Syllabus placeholder</div>
      </section>
    </div>
  );
};

export default ModulePage;
