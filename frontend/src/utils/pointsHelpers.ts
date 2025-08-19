// utils/pointsHelpers.ts
import { fetchModuleById, updateModule } from '../services/module/moduleApi';
import { fetchUnitContentDetails } from '../services/unit/unitApi';

export async function adjustModulePoints(
  moduleId: string,
  action: 'create' | 'edit' | 'delete',
  newBlockPoints: number,
  blockId?: string, // needed for edit/delete
) {
  // 1. Fetch current module points
  const module = await fetchModuleById(moduleId);
  let newPoints = module.points ?? 0;

  // 2. Handle each case
  if (action === 'create') {
    newPoints += newBlockPoints;
  }

  if (action === 'edit' && blockId) {
    // fetch old block data
    const oldBlock = await fetchUnitContentDetails(blockId);
    const oldPoints = oldBlock?.points ?? 0;
    newPoints = newPoints - oldPoints + newBlockPoints;
  }

  if (action === 'delete' && blockId) {
    const oldBlock = await fetchUnitContentDetails(blockId);
    const oldPoints = oldBlock?.points ?? 0;
    newPoints -= oldPoints;
  }

  // 3. Save new points
  const updated = await updateModule(moduleId, { points: newPoints });
  return updated;
}
