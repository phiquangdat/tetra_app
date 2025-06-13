const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface UnitContent {
  id: string;
  title: string;
  content_type: string;
}

export async function GetUnitTitleByModuleId(moduleId: string): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/units?moduleId=${encodeURIComponent(moduleId)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch UNIT title: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error fetching UNIT title:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function GetUnitDetailsById(unitId: string): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/units/${encodeURIComponent(unitId)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch UNIT details: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error fetching UNIT details:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}