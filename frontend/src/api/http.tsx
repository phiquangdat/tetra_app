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
