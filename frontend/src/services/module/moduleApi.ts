const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : '/api';

export interface Module {
  id: string;
  title: string;
  topic: string;
  description: string;
  points: number;
  coverUrl: string;
}

export async function fetchModuleById(id: string): Promise<Module> {
  const response = await fetch(`${BASE_URL}/modules/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch module');
  }
  const data: Module = await response.json();
  return data;
}

export async function fetchModules(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/modules`);
    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok) throw new Error('Failed to fetch modules');

    if (contentType.includes('application/json')) {
      const modulesData = await response.json();
      return modulesData;
    } else {
      const text = await response.text();
      console.error('Expected JSON but received:', text);
      return [];
    }
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
  const response = await fetch(`${BASE_URL}/modules`, {
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
