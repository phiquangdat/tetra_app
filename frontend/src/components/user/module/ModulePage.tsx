import React, { useEffect, useState } from 'react';
import {
  fetchModuleById,
  type Module,
} from '../../../services/module/moduleApi';
import { fetchUnitTitleByModuleId } from '../../../services/unit/unitApi';
import {
  getModuleProgress,
  getUnitProgressByModuleId,
  createModuleProgress,
  type ModuleProgress,
  type UnitProgress,
} from '../../../services/userProgress/userProgressApi';
import Syllabus from './syllabus/Syllabus';
import { useNavigate } from 'react-router-dom';
import { OpenBooksIcon, PuzzleIcon, StarIcon } from '../../common/Icons';
import toast from 'react-hot-toast';

interface ModulePageProps {
  id: string;
}
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { useUnitContent } from '../../../context/user/UnitContentContext.tsx';

export type Unit = {
  id: string;
  title: string;
  content?: {
    type: 'video' | 'article' | 'quiz';
    title: string;
  }[];
  hasProgress?: boolean;
};

type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

const ModulePage: React.FC<ModulePageProps> = ({ id }: ModulePageProps) => {
  const {
    setModuleId,
    setUnits: setModuleUnits,
    moduleProgressStatus,
    setModuleProgressStatus,
    goToStart,
    goToLastVisited,
    initFirstUnitAndContentProgress,
  } = useModuleProgress();
  const { setUnitContent } = useUnitContent();
  const [module, setModule] = useState<Module | null>(null);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(
    null,
  );
  const [unitsProgress, setUnitsProgress] = useState<UnitProgress[] | null>(
    null,
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const [visibleStatus, setVisibleStatus] = useState<ProgressStatus | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    setUnitContent('', []);
    setModuleId(id);

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
        setModuleUnits(units);

        try {
          const progress = await getModuleProgress(id);

          setModuleProgress(progress);
          setModuleProgressStatus(progress.status.toLowerCase());
          console.log('User Module Progress:', progress);
        } catch (err) {
          if (err instanceof Error && err.message.includes('404')) {
            setModuleProgress(null);
            setModuleProgressStatus('not_started');
          } else {
            throw err;
          }
        }

        try {
          const progress = await getUnitProgressByModuleId(id);

          setUnitsProgress(progress);

          const unitIdsWithProgress = new Set(progress.map((p) => p.unitId));

          const updatedUnits = units.map((u) => ({
            ...u,
            hasProgress: unitIdsWithProgress.has(u.id), //Return true if progress list has unit ID
          }));
          setUnits(updatedUnits);
        } catch (err) {
          const msg = err instanceof Error ? err.message.toLowerCase() : '';
          const onlyFirstClickable = units.map((u, i) => ({
            ...u,
            hasProgress: i === 0, //Set clickable to first item
          }));

          if (msg.includes('404')) {
            setUnits(onlyFirstClickable);
          } else if (msg.includes('401') || msg.includes('network')) {
            console.warn('Failed to fetch unit progress:', err);
            toast.error('Try login again.');
            setUnits(onlyFirstClickable);
          } else {
            throw err;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error: ' + err);
      } finally {
        setLoading(false);
      }
    };

    getModuleAndUnits();
  }, [id]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;

    if (moduleProgressStatus === 'completed') {
      setVisibleStatus('completed');
      return;
    }

    t = setTimeout(() => {
      if (
        moduleProgressStatus === 'not_started' ||
        moduleProgressStatus === 'in_progress'
      ) {
        setVisibleStatus(moduleProgressStatus);
      } else {
        setVisibleStatus(null);
      }
    }, 150);

    return () => {
      if (t) clearTimeout(t);
    };
  }, [moduleProgressStatus]);

  const handleStart = async () => {
    try {
      if (moduleProgressStatus !== 'not_started' || isStarting) return;
      setIsStarting(true);
      setVisibleStatus(null);

      const response = await createModuleProgress(id, {
        lastVisitedContent: moduleProgress?.last_visited_content_id,
        lastVisitedUnit: moduleProgress?.last_visited_unit_id,
      });

      const progress = {
        status: response.status,
        last_visited_unit_id: response.lastVisitedUnit.id || '',
        last_visited_content_id: response.lastVisitedContent.id || '',
        earned_points: response.earnedPoints || 0,
      };

      setModuleProgress(progress);
      setModuleProgressStatus('in_progress');
      const preload = await initFirstUnitAndContentProgress();
      await goToStart(preload ?? undefined);
    } catch (err) {
      err instanceof Error
        ? console.error(err.message)
        : setError('Cannot start module.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleContinue = async () => {
    try {
      if (isContinuing) return;
      if (
        moduleProgress?.last_visited_content_id &&
        moduleProgress?.last_visited_unit_id
      ) {
        setIsContinuing(true);
        setVisibleStatus(null);
        await goToLastVisited(
          moduleProgress.last_visited_unit_id,
          moduleProgress.last_visited_content_id,
        );
      } else {
        throw new Error(
          'Cannot continue module: last visited content or unit id not provided.',
        );
      }
    } catch (err) {
      err instanceof Error
        ? console.error(err.message)
        : setError('Cannot continue module.');
    } finally {
      setIsContinuing(false);
    }
  };

  if (loading) return <div>Loading module...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!module) return <div>No module found.</div>;

  return (
    <div className="mx-auto px-8 py-8 min-h-screen bg-[#FFFFFF] text-left">
      <div className="mb-6">
        <button
          onClick={() => navigate('/user/modules')}
          className="inline-flex items-center text-[#998FC7] hover:text-[#231942] px-3 py-1 rounded-lg hover:bg-[#F9F5FF] hover:border hover:border-[#D4C2FC] active:bg-[#D4C2FC] transition-all cursor-pointer"
          type="button"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Modules
        </button>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#231942] tracking-tight">
          {module.title}
        </h1>

        {isStarting && (
          <button
            className="bg-surface text-white font-semibold px-16 py-3 rounded-full text-lg shadow-md opacity-80 cursor-wait w-fit"
            type="button"
            disabled
            aria-busy="true"
          >
            Starting…
          </button>
        )}
        {isContinuing && (
          <button
            className="bg-secondary text-white font-semibold px-14 py-3 rounded-full text-lg shadow-md opacity-80 cursor-wait w-fit"
            type="button"
            disabled
            aria-busy="true"
          >
            Continuing…
          </button>
        )}

        {!isStarting && !isContinuing && visibleStatus === 'not_started' && (
          <button
            className="bg-surface text-white font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition w-fit"
            type="button"
            onClick={handleStart}
          >
            Start
          </button>
        )}

        {!isStarting && !isContinuing && visibleStatus === 'in_progress' && (
          <button
            className="bg-secondary text-white font-semibold px-14 py-3 rounded-full text-lg shadow-md hover:bg-secondaryHover focus:outline-none focus:ring-2 focus:ring-surface transition w-fit"
            type="button"
            onClick={handleContinue}
          >
            Continue
          </button>
        )}

        {!isStarting && !isContinuing && visibleStatus === 'completed' && (
          <span className="self-start w-fit inline-flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-6 py-1.5 rounded-full shadow-sm">
            <span aria-hidden>✓</span>
            <span>Module completed</span>
          </span>
        )}
      </div>

      <h2 className="text-xl font-bold ml-4 mb-4 text-[#231942]">
        About this module
      </h2>

      <div className="flex flex-col md:flex-row gap-10 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-[#F9F5FF] rounded-3xl p-6 text-[#231942] text-base shadow-sm justify-center">
          {module.description}
        </div>

        <div className="border border-[#D4C2FC] rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
          <div className="flex flex-row items-center gap-4">
            <OpenBooksIcon width={30} height={30} />
            <div className="flex flex-col items-start">
              <span className="text-[#231942]">Total content</span>
              <span className="text-xl font-bold text-[#14248A]">
                {units.length} {units.length > 1 ? 'Units' : 'Unit'}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <PuzzleIcon width={30} height={30} />
            <div className="flex flex-col items-start">
              <span className="text-[#231942]">Quizzes</span>
              <span className="text-xl font-bold text-[#14248A]">
                Placeholder
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            <StarIcon width={30} height={30} />
            <div className="flex flex-col items-start">
              <span className="text-[#231942]">Points available</span>
              <span className="text-xl font-bold text-[#14248A]">
                {module.points}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Syllabus units={units} />
    </div>
  );
};

export default ModulePage;
