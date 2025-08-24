const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export interface UserStats {
  totalPoints: number;
  topicPoints: { topic: string; points: number }[];
}

export async function getUserStats(): Promise<UserStats> {
  const data = await fetchWithAuth(`${BASE_URL}/user-stats`, { method: 'GET' });
  if (
    typeof data?.totalPoints !== 'number' ||
    !Array.isArray(data?.topicPoints)
  ) {
    throw new Error('Invalid response from user stats API');
  }
  return {
    totalPoints: data.totalPoints,
    topicPoints: data.topicPoints,
  };
}