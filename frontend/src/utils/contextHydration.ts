import {
  fetchUnitById,
  fetchUnitContentDetails,
} from '../services/unit/unitApi.ts';

export async function hydrateContextFromContent(
  contentId: string,
  {
    setUnitId,
    setModuleId,
  }: { setUnitId: (id: string) => void; setModuleId: (id: string) => void },
): Promise<{ unitId: string; moduleId: string }> {
  const content = await fetchUnitContentDetails(contentId);
  setUnitId(content.unitId);
  const unit = await fetchUnitById(content.unitId);
  setModuleId(unit.moduleId);

  return { unitId: content.unitId, moduleId: unit.moduleId };
}
