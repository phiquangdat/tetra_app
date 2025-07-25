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
  sort_order: number;
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
