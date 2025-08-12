const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export interface BackendModuleProgress {
  moduleId: string;
  moduleTitle: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  earned_points?: number;
  last_visited_unit_id?: string | null;
  last_visited_content_id?: string | null;
}

export async function getUserModuleProgress(
  status?: 'IN_PROGRESS' | 'COMPLETED',
  limit?: number,
): Promise<BackendModuleProgress[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const data = await fetchWithAuth(
      `${BASE_URL}/user-module-progress?${params.toString()}`,
      { method: 'GET' },
    );

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get user module progress');
  }
}
