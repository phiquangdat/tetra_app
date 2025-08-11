const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export async function getUserTotalPoints(): Promise<number> {
  const data = await fetchWithAuth(`${BASE_URL}/user-stats`, { method: 'GET' });

  const total = Number(data?.totalPoints);
  if (!Number.isFinite(total)) {
    throw new Error('Invalid response from user stats API');
  }
  return total;
}
