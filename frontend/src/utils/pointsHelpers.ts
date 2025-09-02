import { fetchModuleById, updateModule } from '../services/module/moduleApi';

const locks = new Map<string, Promise<void>>();

function withModuleLock<T>(
  moduleId: string,
  task: () => Promise<T>,
): Promise<T> {
  const prev = locks.get(moduleId) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((res) => (release = res));
  locks.set(
    moduleId,
    prev.then(() => next),
  );

  return prev.then(task).finally(() => release());
}

const n = (v: unknown) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : 0;
};

export async function applyModulePointsDelta(moduleId: string, delta: number) {
  return withModuleLock(moduleId, async () => {
    const mod = await fetchModuleById(moduleId);
    const current = n(mod.points);
    let next = current + n(delta);
    if (!Number.isFinite(next) || next < 0) next = 0;
    return updateModule(moduleId, { points: next });
  });
}
