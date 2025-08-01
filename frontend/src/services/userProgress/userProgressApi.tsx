const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export interface UserProgress {
  status: string;
  last_visited_unit_id: string;
  last_visited_content_id: string;
  earned_points: number;
}

export async function getModuleProgress(
  moduleId: string,
): Promise<UserProgress> {
  try {
    return await fetchWithAuth(`${BASE_URL}/user-module-progress/${moduleId}`);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get module progress');
  }
}
