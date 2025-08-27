import { fetchWithAuth } from '../../utils/authHelpers';

const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

export interface AdminStats {
  total_users: number;
  total_points_issued: number;
  active_modules: number;
}
export interface ModuleCompletionsByTopic {
  topic: string;
  completions: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    return await fetchWithAuth(`${BASE_URL}/admin/stats`);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    throw error;
  }
}

export async function getModuleCompletionsByTopic(): Promise<
  ModuleCompletionsByTopic[]
> {
  try {
    return await fetchWithAuth(
      `${BASE_URL}/admin/stats/module-completions-by-topic`,
    );
  } catch (error) {
    console.error('Failed to fetch module completions by topic:', error);
    throw error;
  }
}
