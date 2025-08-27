const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export interface UserStats {
  totalPoints: number;
  topicPoints: Array<{ topic: string; points: number }>;

  modulesCompleted: number;
  modulesInProgress: number;
}

export async function getUserStats(): Promise<UserStats> {
  const response = await fetchWithAuth(`${BASE_URL}/user-stats`, { method: 'GET' });
  if (
    typeof response?.totalPoints !== 'number' ||
    !Array.isArray(response?.topicPoints)
  ) {
    throw new Error('Invalid response from user stats API');
  }
  return {
    totalPoints: response.totalPoints,
    topicPoints: response.topicPoints,
    modulesCompleted: response.modulesCompleted,
    modulesInProgress: response.modulesInProgress,
  };
}
