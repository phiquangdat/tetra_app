const BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface Module {
  id: string;
  title: string;
  topic: string;
  description: string;
  points: number;
  coverUrl: string;
}

export async function fetchModuleById(id: string): Promise<Module> {
  const response = await fetch(`${BASE_URL}/api/modules/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch module');
  }
  const data: Module = await response.json();
  return data;
}

export async function fetchModules(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/api/modules`);
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

export async function createModule(module: Module): Promise<Module> {
  const response = await fetch(`${BASE_URL}/api/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(module),
  });

  if (!response.ok) {
    throw new Error('Failed to create module');
  }

  const data: Module = await response.json();
  return data;
}
