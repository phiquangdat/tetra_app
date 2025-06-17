import ModuleCard from '../../ui/ModuleCard';
import React, { useEffect, useState } from 'react';
import { fetchModules } from '../../../services/module/moduleApi.ts';

interface Module {
  id: React.Key | null | undefined;
  title: string;
  topic: string;
  points: number;
  status: string;
  coverUrl: string;
}

function ModuleCards() {
  const [modules, setModules] = useState<Module[]>([]); // Proper typing for modules
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const resData = await fetchModules();
        if (resData && resData.length > 0) {
          setModules(resData);
          setError(null);
          console.log('Response data:', resData);
        } else {
          setError('No modules found in the response');
          console.error('No modules found in the response');
        }
      } catch (err: any) {
        setError('Failed to fetch database');
        console.error('Error fetching data:', err);
      }
    };

    loadModules();
  }, []);

  return (
    <div className="flex flex-col gap-6 px-0 py-8 w-full mx-auto">
      {/* Title + Button Row */}
      <div className="flex justify-center gap-20 items-center mb-4">
        <h1 className="text-3xl font-bold">Training modules</h1>
        <div>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Create new module
          </button>
        </div>
      </div>

      <ul className="flex flex-wrap justify-center items-center gap-8 p-0">
        {error && <p className="text-red-500">Failed to load data</p>}
        {modules.map((module: Module) => (
          <li key={module.id}>
            <ModuleCard
              id={module.id}
              title={module.title}
              coverUrl={module.coverUrl}
              details={[
                { label: 'Topic', value: module.topic },
                { label: 'Points', value: module.points },
                { label: 'Status', value: module.status },
              ]}
              buttonLabel="Open"
              linkBasePath="/admin/modules"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModuleCards;
