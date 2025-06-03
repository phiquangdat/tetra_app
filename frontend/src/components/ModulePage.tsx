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
    <div className="mx-auto px-8 py-8 min-h-screen">
      <div className="flex flex-col items-start gap-4 p-8 text-left">
        <h1 className="text-xl font-bold">{module.title}</h1>
        <button
          className="bg-blue-200 text-blue-900 font-semibold px-8 py-2 rounded-full text-lg shadow hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-fit"
          type="button"
          disabled
        >
          Start
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-stretch mb-8 text-left">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-5">About this module</h2>
          <div className="bg-gray-200 rounded-2xl p-6 text-gray-700 text-base mb-4 shadow-sm">
            {module.description}
          </div>
        </div>

        <div className="border rounded-3xl p-4 flex flex-row gap-8 min-w-[260px] bg-white shadow-sm items-center">
          <div className="flex flex-row items-center gap-2">
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
                d="M12 6v6l4 2"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 19V5a2 2 0 012-2h10a2 2 0 012 2v14"
              />
            </svg>
            <div className="flex flex-col items-start">
              <span className="text-gray-700">Total content</span>
              <span className="text-xl font-bold">Placeholder</span>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
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
          <div className="flex flex-row items-center gap-2">
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

      <div>
        <h2 className="font-bold">Syllabus</h2>
        <div>Syllabus placeholder</div>
      </div>
    </div>
  );
};

export default ModulePage;
