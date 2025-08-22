import { getAuthToken } from '../../../utils/authHelpers.ts';

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
  points: number;
  sort_order: number;
}

export interface SaveArticleRequest {
  unit_id: string;
  content_type: 'article';
  title: string;
  content: string;
  points: number;
  sort_order: number;
  attachment_id?: string | null;
}

export type QuizQuestionAnswer = {
  title: string;
  is_correct: boolean;
  sort_order: number;
};

export type QuizQuestion = {
  title: string;
  type: 'true/false' | 'multiple';
  sort_order: number;
  answers: QuizQuestionAnswer[];
};

export interface SaveQuizRequest {
  unit_id: string;
  content_type: 'quiz';
  title: string;
  content: string;
  sort_order: number;
  points: number;
  questions_number: number;
  questions: QuizQuestion[];
  attachment_id?: string | null;
}

export async function uploadFile(file: File): Promise<{ id: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();

    const response = await fetch(`${BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload file: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return { id: result.id };
  } catch (error) {
    console.error(
      'Error uploading file:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
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

export async function saveArticleContent(
  data: SaveArticleRequest,
): Promise<{ id: string }> {
  try {
    const response = await fetch(`${BASE_URL}/unit_content/article`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to save article content: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return { id: result.id };
  } catch (error) {
    console.error(
      'Error saving article content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function saveQuizContent(
  data: SaveQuizRequest,
): Promise<{ id: string }> {
  try {
    const response = await fetch(`${BASE_URL}/unit_content/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to save quiz content: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return { id: result.id };
  } catch (error) {
    console.error(
      'Error saving quiz content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function updateArticleContent(
  id: string,
  article: SaveArticleRequest,
): Promise<{ id: string }> {
  const token = getAuthToken();
  const url = `${BASE_URL}/unit_content/article/${id}`;
  console.log('[updateArticle] UPDATE:', url);
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(article),
    });

    console.log(`[updateArticle] Response status: ${response.status}`);
    console.log(
      `[updateArticle] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update article content: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error updating article content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function updateVideoContent(
  id: string,
  video: SaveVideoRequest,
): Promise<{ id: string }> {
  const token = getAuthToken();
  const url = `${BASE_URL}/unit_content/video/${id}`;
  console.log('[updateVideo] UPDATE:', url);
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(video),
    });

    console.log(`[updateVideo] Response status: ${response.status}`);
    console.log(
      `[updateVideo] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update video content: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error updating video content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function updateQuizContent(
  id: string,
  quiz: SaveQuizRequest,
): Promise<{ id: string }> {
  const token = getAuthToken();
  const url = `${BASE_URL}/unit_content/quiz/${id}`;
  console.log('[updateQuiz] UPDATE:', url);
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(quiz),
    });

    console.log(`[updateQuiz] Response status: ${response.status}`);
    console.log(
      `[updateQuiz] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update video content: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error updating video content:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function deleteUnitContent(id: string): Promise<string> {
  const token = getAuthToken();
  const url = `${BASE_URL}/unit_content/${id}`;
  console.log('[deleteUnitContent] DELETE:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log(`[deleteUnitContent] Response status: ${response.status}`);
    console.log(
      `[deleteUnitContent] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(`[deleteUnitContent] Error response body:`, text);
      throw new Error('Failed to delete unit');
    }

    return text;
  } catch (error) {
    console.error(`[deleteUnitContent] Exception:`, error);
    throw error;
  }
}
