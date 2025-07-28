import ModuleCard from '../../ui/ModuleCard';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchModules } from '../../../services/module/moduleApi.ts';
import LazyLoadModuleCards from '../../ui/LazyLoadModuleCards.tsx';

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
  const [visibleCount, setVisibleCount] = useState(DEFAULT_ITEMS_NUMBER);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleCreateModule = () => {
    if (!modules) {
      console.error('Modules data is not available');
      return;
    }
    navigate('/admin/modules/create');
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + DEFAULT_ITEMS_NUMBER, modules.length),
    );
  };

  const handleShowLess = () => {
    setVisibleCount(DEFAULT_ITEMS_NUMBER);
  };

  return (
    <div className="flex flex-col gap-6 px-0 py-8 w-full mx-auto">
      {/* Title + Button Row */}
      <div className="flex justify-center gap-20 items-center mb-4">
        <h1 className="text-3xl font-bold">Training modules</h1>
        <div>
          <button
            onClick={handleCreateModule}
            className="bg-secondary hover:bg-secondaryHover text-background text-base tracking-wide font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer ease-in-out duration-200"
          >
            Create new module
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-red-500 text-center">Failed to load data</p>
      ) : (
        <ul className="flex flex-wrap justify-center items-center gap-8 p-0">
          {modules.slice(0, visibleCount).map((module: Module) => (
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
      )}

      {/* Load More / Show Less module cards*/}
      <LazyLoadModuleCards
        total={modules.length}
        visibleCount={visibleCount}
        defaulItemsNumber={DEFAULT_ITEMS_NUMBER}
        onLoadMore={handleLoadMore}
        onShowLess={handleShowLess}
      />
    </div>
  );
}

export default ModuleCards;
