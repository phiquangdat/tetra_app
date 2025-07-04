const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = envBaseUrl && envBaseUrl.trim() !== '' ? envBaseUrl : '/api';

console.log(
  '[moduleApi] Computed BASE_URL:',
  BASE_URL,
  '| VITE_BACKEND_URL:',
  envBaseUrl,
);

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
  const url = `${BASE_URL}/modules/${id}`;
  console.log(`[fetchModuleById] Fetching: ${url}`);
  try {
    const response = await fetch(url);
    console.log(`[fetchModuleById] Response status: ${response.status}`);
    console.log(
      `[fetchModuleById] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(`[fetchModuleById] Error response body:`, text);
      throw new Error(`Failed to fetch module. Status: ${response.status}`);
    }
    const data: Module = await response.json();
    console.log(`[fetchModuleById] Success. Data:`, data);
    return data;
  } catch (error) {
    console.error(`[fetchModuleById] Exception:`, error);
    throw error;
  }
}

export async function fetchModules(): Promise<Module[]> {
  const url = `${BASE_URL}/modules`;
  console.log('[fetchModules] BASE_URL:', BASE_URL);
  console.log('[fetchModules] Fetching:', url);
  try {
    const response = await fetch(url);
    console.log(`[fetchModules] Response status: ${response.status}`);
    console.log(
      `[fetchModules] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[fetchModules] Bad response status: ${response.status}, body:`,
        text,
      );
      throw new Error('Failed to fetch modules');
    }
    const contentType = response.headers.get('Content-Type') || '';
    console.log('[fetchModules] Content-Type:', contentType);
    if (contentType.includes('application/json')) {
      const modulesData: Module[] = await response.json();
      console.log('[fetchModules] Success. Data:', modulesData);
      return modulesData;
    } else {
      const text = await response.text();
      console.error('[fetchModules] Expected JSON but received:', text);
      return [];
    }
  } catch (error) {
    console.error('[fetchModules] Exception:', error);
    return [];
  }
}

export async function createModule(module: Module): Promise<Module> {
  const url = `${BASE_URL}/modules`;
  console.log('[createModule] POST:', url, 'Payload:', module);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(module),
    });
    console.log(`[createModule] Response status: ${response.status}`);
    console.log(
      `[createModule] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(`[createModule] Error response body:`, text);
      throw new Error('Failed to create module');
    }
    const data: Module = await response.json();
    console.log('[createModule] Success. Data:', data);
    return data;
  } catch (error) {
    console.error('[createModule] Exception:', error);
    throw error;
  }
}