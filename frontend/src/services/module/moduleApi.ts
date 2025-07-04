const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
let BASE_URL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : '/api';
if (BASE_URL !== '/api' && !BASE_URL.endsWith('/api')) {
  BASE_URL = BASE_URL.replace(/\/+$/, '') + '/api';
}

export { BASE_URL }; // Export for debugging if needed

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
    console.log('[fetchModules] BASE_URL:', BASE_URL);
    const url = `${BASE_URL}/api/modules`;
    console.log('[fetchModules] Fetching:', url);
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type') || '';
    if (!response.ok) {
      console.error(`[fetchModules] Bad response status: ${response.status}`);
      throw new Error('Failed to fetch modules');
    }

    if (contentType.includes('application/json')) {
      const modulesData = await response.json();
      return modulesData;
    } else {
      const text = await response.text();
      console.error('[fetchModules] Expected JSON but received:', text);
      return [];
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('[fetchModules] Error:', error.message);
    } else {
      console.error('[fetchModules] Unknown error:', error);
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
