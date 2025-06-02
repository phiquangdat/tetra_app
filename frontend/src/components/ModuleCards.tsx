import React, { useEffect, useState } from 'react';
import ModuleCard from './ModuleCard';
import { GetModules } from '../api/http';

interface Module {
  id: React.Key | null | undefined;
  title: string;
  topic: string;
  points: number;
  coverUrl: string;
}

function ModuleCards() {
  const [modules, setModules] = useState<Module[]>([]); // Proper typing for modules
  const [error, setError] = useState<string | null>(null); // Store error message, not just boolean

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await GetModules();
        if (resData && resData.length > 0) {
          setModules(resData);
          setError(null); // Reset error if data is fetched successfully
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

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Learning Modules</h1>
      <ul className="flex flex-col items-center gap-4">
        {error && <p className="text-red-500">Failed to load data</p>} 
        {modules.map((module: Module) => (
          <li key={module.id} className="w-full max-w-4xl">
            <ModuleCard
              title={module.title}
              topic={module.topic}
              points={module.points}
              coverUrl={module.coverUrl}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModuleCards;
