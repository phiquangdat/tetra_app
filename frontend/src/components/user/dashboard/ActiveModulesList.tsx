import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ActiveModuleCard, {
  type ActiveModuleStatus,
} from '../../ui/ActiveModuleCard';
import {
  getUserModuleProgress,
  type BackendModuleProgress,
} from '../../../services/user/userModuleProgressApi';
import { fetchModuleById } from '../../../services/module/moduleApi';
import {
  getUnitProgressByModuleId,
  type UnitProgress,
} from '../../../services/userProgress/userProgressApi';

type UiModule = BackendModuleProgress & { topic?: string };

const toActiveModuleStatus = (
  s: BackendModuleProgress['status'],
): ActiveModuleStatus =>
  (s || 'IN_PROGRESS').toLowerCase() as ActiveModuleStatus;

const LIMIT = 3;

const ActiveModulesList = () => {
  const [items, setItems] = useState<UiModule[]>([]);
  const [unitsProgress, setUnitsProgress] = useState<UnitProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const progressData = await getUserModuleProgress('IN_PROGRESS', LIMIT);

      const updateProgressDataWithTopics = await Promise.all(
        progressData.map(async (module) => {
          try {
            const mod = await fetchModuleById(module.moduleId);
            const unitProgresses = await getUnitProgressByModuleId(
              module.moduleId,
            );

            setUnitsProgress((prev) => [...prev, ...unitProgresses]);
            return { ...module, topic: mod.topic } as UiModule;
          } catch (e) {
            console.warn(
              '[ActiveModulesList] Failed to fetch module topic for',
              module.moduleId,
              e,
            );
            return { ...module, topic: '' } as UiModule;
          }
        }),
      );

      setItems(updateProgressDataWithTopics);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadModules();
  }, [loadModules]);

  const handleClickModule = (moduleId: string) => {
    if (moduleId == null) return;
    navigate(`/user/modules/${moduleId}`);
  };

  const percent = useMemo(() => {
    if (unitsProgress.length === 0) return 0;
    let count = unitsProgress.filter(
      (progress) => progress.status === 'COMPLETED',
    ).length;

    console.log('Data used inside percent calculation:', unitsProgress);

    return Math.round((count / unitsProgress.length) * 100);
  }, [unitsProgress]);
  return (
    <div className="rounded-2xl bg-cardBackground p-6 my-12 shadow-lg">
      <div className="mb-8">
        <div className="flex items-center justify-between px-6 mb-4">
          <h1 className="text-2xl font-bold text-primary mb-2">In Progress</h1>

          <span className="text-sm font-medium text-white bg-success/90 px-4 py-1.5 rounded-full">
            {percent}% Completed
          </span>
        </div>

        <div className="relative w-full h-2">
          <span
            className="block absolute top-0 left-0 rounded-l-xl border-b-6 border-success/80"
            style={{ width: `${percent}%` }}
          ></span>
          <span
            className="block absolute top-0 rounded-r-xl border-b-6 border-accent"
            style={{ left: `${percent}%`, width: `${100 - percent}%` }}
          ></span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {!loading && !error && items.length === 0 && (
          <div className="text-muted-foreground">
            No modules in progress yet.
          </div>
        )}

        {!loading &&
          !error &&
          items.map((m) => (
            <ActiveModuleCard
              key={m.moduleId}
              title={m.moduleTitle}
              topic={m.topic ?? ''}
              earnedPoints={m.earned_points ?? 0}
              status={toActiveModuleStatus(m.status)}
              onClick={() => handleClickModule(m.moduleId)}
            />
          ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link
          to="/user/modules"
          className="flex text-primary hover:text-secondaryHover items-center gap-2 text-lg font-semibold transition-colors duration-300"
        >
          View all Modules <span className="text-xl">&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default ActiveModulesList;
