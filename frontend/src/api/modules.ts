export interface Module {
  id: string;
  title: string;
  topic: string;
  description: string;
  points: number;
  coverUrl: string;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchModuleById(id: string): Promise<Module> {
  const response = await fetch(`${BASE_URL}/api/modules/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch module');
  }
  const data: Module = await response.json();
  return data;
}
