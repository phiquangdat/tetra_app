import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import {
  fetchUnitContentById,
  fetchUnitTitleByModuleId,
} from '../../../services/unit/unitApi';
import Syllabus from './syllabus/Syllabus';
import { useNavigate } from 'react-router-dom';
import { OpenBooksIcon, PuzzleIcon, StarIcon } from '../../common/Icons';
interface ModulePageProps {
  id: string;
}

export type Unit = {
  id: string;
  title: string;
  content?: {
    type: 'video' | 'article' | 'quiz';
    title: string;
  }[];
};

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  const [module, setModule] = useState<Module | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const getModuleAndUnits = async () => {
      try {
        const [data, units] = await Promise.all([
          fetchModuleById(id),
          fetchUnitTitleByModuleId(id),
        ]);
        console.log('Fetched module:', data); // Temporary log
        console.log('Fetched units:', units);
        setModule(data);
        setUnits(units);
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

    getModuleAndUnits();
  }, [id]);

  const handleStart = async () => {
    try {
      const units = await fetchUnitTitleByModuleId(id);

      if (units && units.length > 0) {
        const firstUnitId = units[0].id;
        const firstUnitContent = await fetchUnitContentById(firstUnitId);

        if (firstUnitContent && firstUnitContent.length > 0) {
          const firstContent = firstUnitContent[0];
          navigate(`/user/${firstContent.content_type}/${firstContent.id}`, {
            state: { unitId: firstUnitId },
          });
        } else {
          setError('This module has no content to start.');
        }
      } else {
        setError('This module has no units.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Cannot start module.');
      }
    }
  };

  if (loading) return <div>Loading module...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!module) return <div>No module found.</div>;

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate('/user/modules')}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Modules
        </a>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-0 md:mb-0">
          {module.title}
        </h1>
        <button
          className="bg-blue-200 font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit cursor-pointer"
          type="button"
          onClick={handleStart}
        >
          Start
        </button>
      </div>
      <h2 className="text-xl font-bold ml-4 mb-4">About this module</h2>
      <div className="flex flex-col md:flex-row gap-10 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-gray-200 rounded-3xl p-6 text-gray-700 text-base text-left shadow-sm justify-center">
          {module.description}
        </div>

        <div className="border rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
          <div className="flex flex-row items-center gap-4">
            {OpenBooksIcon}
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Total content</span>
              <span className="text-xl font-bold">
                {units.length} {units.length > 1 ? 'Units' : 'Unit'}
              </span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            {PuzzleIcon}
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Quizzes</span>
              <span className="text-xl font-bold">Placeholder</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            {StarIcon}
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Points available</span>
              <span className="text-xl font-bold">{module.points}</span>
            </div>
          </div>
        </div>
      </div>

      <Syllabus units={units} />
    </div>
  );
};

export default ModulePage;
