import React, { useEffect, useState } from 'react';
import ModuleCard from './ModuleCard';
import { GetModules } from '../api/http';

function ModuleCards() {
  const [modules, setModules] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await GetModules();
        if (resData && resData.length > 0) {
          setModules(resData);
          setError(false);
          console.log('Response data:', resData);
        } else if (!error) {
          setError(true);
          console.error('No modules found in the response');
        }
      } catch (err) {
        setError(true);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Learning Modules</h1>
      <div className="flex flex-col items-center gap-4">
        {error && <p className="text-red-500">Failed to fetch database</p>}{' '}
        {modules.map(
          (module: {
            id: React.Key | null | undefined;
            title: string;
            topic: string;
            points: number;
            coverUrl: string;
          }) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              topic={module.topic}
              points={module.points}
              coverUrl={module.coverUrl}
            />
          ),
        )}
      </div>
    </div>
  );
}

export default ModuleCards;
