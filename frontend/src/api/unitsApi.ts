const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface UnitContent {
  id: string;
  title: string;
  content_type: string;
}

export async function fetchUnitContentById(id: string): Promise<UnitContent[]> {
  const response = await fetch(`${BASE_URL}/api/unit_content?unitId=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch unit content');
  }

  const data: UnitContent[] = await response.json();
  console.log('fetched data is', data);
  return data;
}
