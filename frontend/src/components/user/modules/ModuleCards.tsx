import React, { useEffect, useState } from 'react';
import ModuleCard from '../../ui/ModuleCard';
import { fetchModules } from '../../../services/module/moduleApi';

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
  const [error, setError] = useState<string | null>(null); // Store error message, not just boolean

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resData = await fetchModules();
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
    <div className="flex flex-col gap-6 px-0 py-8 w-full mx-auto bg-[#FFFFFF]">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#231942]">
        Learning Modules
      </h1>
      <ul className="flex flex-wrap justify-center items-center gap-8 p-0">
        {error && <p className="text-red-500">Failed to load data</p>}
        {modules
          .filter((module: Module) => module.status === 'published')
          .map(({ id, title, coverUrl, topic, points }: Module) => (
            <li key={id}>
              <ModuleCard
                id={id}
                title={title}
                coverUrl={coverUrl}
                details={[
                  { label: 'Topic', value: topic },
                  { label: 'Points', value: points },
                ]}
                buttonLabel="Open"
                linkBasePath="/user/modules"
              />
            </li>
          ))}
      </ul>
    </div>
  );
}

export default ModuleCards;
