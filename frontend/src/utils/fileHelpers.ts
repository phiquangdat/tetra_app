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

export async function downloadFileById(fileId: string, fileName?: string) {
  const token = getAuthToken();
  const url = `${BASE_URL}/uploads/${fileId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName || 'attachment';
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function deleteFileById(fileId: string): Promise<void> {
  if (!fileId) throw new Error('deleteFileById: missing fileId');

  const token = getAuthToken();
  const url = `${BASE_URL}/uploads/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    if (res.status === 404) return;
    const text = await res.text().catch(() => '');
    throw new Error(
      `deleteFileById failed: ${res.status} ${res.statusText} ${text}`,
    );
  }
}
