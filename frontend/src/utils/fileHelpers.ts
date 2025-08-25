import { getAuthToken } from './authHelpers.ts';

const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

export async function fetchFileById(fileId: string) {
  if (!fileId) throw new Error('fetchFileById: missing fileId');

  const token = getAuthToken();
  const url = `${BASE_URL}/uploads/${fileId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`,
      );
    }

    const originalName = response.headers.get('X-File-Name') ?? undefined;
    const mime = response.headers.get('X-File-Mime') ?? undefined;
    const sizeStr = response.headers.get('X-File-Size');
    const size = sizeStr ? parseInt(sizeStr, 10) : undefined;

    return {
      url,
      originalName,
      mime,
      size,
    };
  } catch (error) {
    console.error(
      'Error fetching file:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
