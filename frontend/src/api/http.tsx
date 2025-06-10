export async function GetModules(): Promise<any> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/modules`,
    );
    const modulesData = await response.json();

    if (!response.ok) throw new Error('Failed to fetch modules');

    return modulesData;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching modules:', error.message);
    } else {
      console.error('Unknown error fetching modules', error);
    }
    return [];
  }
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function GetUnitTitleByModuleId(
  moduleId: string,
): Promise<any> {
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
