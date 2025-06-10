import React, { useEffect, useState } from 'react';
import { fetchModuleById, type Module } from '../api/modules';
import Syllabus from './Syllabus.tsx';

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
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-0 md:mb-0">
          {module.title}
        </h1>
        <button
          className="bg-blue-200 font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit"
          type="button"
          disabled
        >
          Start
        </button>
      </div>
      <h2 className="text-xl font-bold ml-4 mb-4">About this module</h2>
      <div className="flex flex-col md:flex-row gap-10 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-gray-200 rounded-3xl p-6 text-gray-700 text-base text-left shadow-sm justify-center">
          {module.description}
          {module.description}
          {module.description}
        </div>

        <div className="border rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
          <div className="flex flex-row items-center gap-4">
            <svg
              className="w-6 h-6 text-gray-700 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6.5C4 5 5.5 4 7 4c2.5 0 5 1 5 1v15s-2.5-1-5-1c-1.5 0-3-1-3-2.5V6.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 6.5C20 5 18.5 4 17 4c-2.5 0-5 1-5 1v15s2.5-1 5-1c1.5 0 3-1 3-2.5V6.5z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v15" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Total content</span>
              <span className="text-xl font-bold">Placeholder</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <svg
              className="w-6 h-6 text-gray-700 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13v-2a2 2 0 00-2-2h-2V7a2 2 0 00-2-2h-2V3a2 2 0 00-2-2H7a2 2 0 00-2 2v2H3a2 2 0 00-2 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 002-2v-2h2a2 2 0 002-2z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Quizzes</span>
              <span className="text-xl font-bold">Placeholder</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <svg
              className="w-6 h-6 text-gray-700 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Points available</span>
              <span className="text-xl font-bold">{module.points}</span>
            </div>
          </div>
        </div>
      </div>

      <Syllabus moduleID={module.id}/>
    </div>
  );
};

export default ModulePage;
