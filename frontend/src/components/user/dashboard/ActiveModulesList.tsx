import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ActiveModuleCard, {
  type ActiveModuleStatus,
} from '../../ui/ActiveModuleCard';
import {
  getUserModuleProgress,
  type BackendModuleProgress,
} from '../../../services/user/userModuleProgressApi';
import { fetchModuleById } from '../../../services/module/moduleApi';

type UiModule = BackendModuleProgress & { topic?: string };

const toActiveModuleStatus = (
  s: BackendModuleProgress['status'],
): ActiveModuleStatus =>
  (s || 'IN_PROGRESS').toLowerCase() as ActiveModuleStatus;

const LIMIT = 3;

const ActiveModulesList = () => {
  const [items, setItems] = useState<UiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const progressData = await getUserModuleProgress('IN_PROGRESS', LIMIT);

      const updateProgressDataWithTopics = await Promise.all(
        progressData.map(async (module) => {
          try {
            const mod = await fetchModuleById(module.moduleId);
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
    console.log('Module clicked:', moduleId); // Placeholder for actual navigation logic
  };

  return (
    <div className="rounded-2xl bg-cardBackground p-6 my-12 shadow-lg">
      <div className="relative -mx-6 mb-10">
        <div className="text-primary text-xl font-semibold pb-3 px-10">
          In Progress
        </div>
        <span className="block absolute left-0 border-b-4 border-highlight w-1/3"></span>
        <span className="block absolute left-1/3 border-b-4 border-accent w-2/3"></span>
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
