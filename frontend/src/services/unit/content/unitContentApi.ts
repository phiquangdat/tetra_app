const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

console.log(
  '[moduleApi] Computed BASE_URL:',
  BASE_URL,
  '| VITE_BACKEND_URL:',
  envBaseUrl,
);

export interface SaveVideoRequest {
  unit_id: string;
  content_type: 'video';
  title: string;
  content: string;
  url: string;
  sort_order: number;
}

export async function saveVideoContent(
  data: SaveVideoRequest,
): Promise<{ id: string }> {
  try {
    const response = await fetch(`${BASE_URL}/unit_content/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to save video content: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return { id: result.id };
  } catch (error) {
    console.error(
      'Error saving video content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
