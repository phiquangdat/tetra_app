import React, { useEffect, useState } from 'react';
import ModuleCard from '../../ui/ModuleCard';
import { fetchModules } from '../../../services/module/moduleApi';
import {
  getUserModuleProgress,
  type BackendModuleProgress,
} from '../../../services/user/userModuleProgressApi';
import LazyLoadModuleCards from '../../ui/LazyLoadModuleCards';

interface Module {
  id: React.Key | null | undefined;
  title: string;
  topic: string;
  points: number;
  status: string;
  coverUrl: string;
}

const DEFAULT_ITEMS_NUMBER = 6;

function ModuleCards() {
  const [modules, setModules] = useState<Module[]>([]); // Proper typing for modules
  const [moduleProgressMap, setModuleProgressMap] = useState<
    Map<string, BackendModuleProgress>
  >(new Map());
  const [visibleCount, setVisibleCount] = useState(DEFAULT_ITEMS_NUMBER);
  const [error, setError] = useState<string | null>(null); // Store error message, not just boolean

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resData, moduleProgressData] = await Promise.all([
          fetchModules(),
          getUserModuleProgress(),
        ]);

        setModuleProgressMap(
          new Map(moduleProgressData.map((mp) => [mp.moduleId, mp])),
        );

        if (resData && resData.length > 0) {
          setModules(resData);
          setError(null); // Reset error if data is fetched successfully
          console.log('Response data:', resData);
        } else {
          setError('No modules found in the response');
          console.error('No modules found in the response');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setModuleProgressMap(new Map());
          setError(null);
        } else {
          setError('Failed to fetch database');
        }
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + DEFAULT_ITEMS_NUMBER, publishedModules.length),
    );
  };

  const handleShowLess = () => {
    setVisibleCount(DEFAULT_ITEMS_NUMBER);
  };

  const publishedModules = modules.filter(
    (module) => module.status === 'published',
  );
  const visibleModules = publishedModules.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6 px-0 py-8 w-full mx-auto bg-[#FFFFFF]">
      <h1 className="text-3xl font-bold text-center mb-8 text-[#231942]">
        Learning Modules
      </h1>

      {error ? (
        <p className="text-red-500 text-center">Failed to load data</p>
      ) : (
        <>
          <ul className="flex flex-wrap justify-center items-center gap-8 p-0">
            {visibleModules.map((visibleModule) => (
              <li key={visibleModule.id}>
                <ModuleCard
                  id={visibleModule.id}
                  title={visibleModule.title}
                  coverUrl={visibleModule.coverUrl}
                  details={[
                    { label: 'Topic', value: visibleModule.topic },
                    { label: 'Points', value: visibleModule.points ?? 0 },
                  ]}
                  buttonLabel="Open"
                  linkBasePath="/user/modules"
                  progressStatus={
                    moduleProgressMap.get(visibleModule.id as string)?.status
                  }
                  earnedPoints={
                    moduleProgressMap.get(visibleModule.id as string)
                      ?.earned_points
                  }
                />
              </li>
            ))}
          </ul>

          {/* Load More / Show Less module cards*/}
          <LazyLoadModuleCards
            total={publishedModules.length}
            visibleCount={visibleCount}
            defaulItemsNumber={DEFAULT_ITEMS_NUMBER}
            onLoadMore={handleLoadMore}
            onShowLess={handleShowLess}
          />
        </>
      )}
    </div>
  );
}

export default ModuleCards;
