const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

export interface Quiz {
  id: string;
  unit_id: string;
  title: string;
  content: string;
  points: number;
  questions_number: number;
}

export interface Answer {
  id: string;
  title: string;
  is_correct?: boolean;
  sort_order: number;
}

export interface Question {
  id: string;
  title: string;
  type: string;
  sort_order: number;
  answers: Answer[];
}

export async function fetchQuizById(id: string): Promise<Quiz> {
  const token = sessionStorage.getItem('jwt_token');
  try {
    const response = await fetch(`${BASE_URL}/unit_content/quiz/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch UNIT title: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error fetching QUIZ data:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function fetchQuizQuestionsByQuizId(
  quizId: string,
  includeCorrect: boolean = false,
): Promise<Question[]> {
  try {
    const queryParams = new URLSearchParams({ contentId: quizId });
    if (includeCorrect) {
      queryParams.append('includeCorrect', 'true');
    }

    const token = sessionStorage.getItem('jwt_token');
    const response = await fetch(
      `${BASE_URL}/questions?${queryParams.toString()}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch QUIZ questions for ${quizId}`);
    }

    const data = await response.json();
    console.log('Fetched questions are', data.questions);
    return data.questions;
  } catch (error) {
    console.error(`Error fetching QUIZ questions for ${quizId}:`);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
