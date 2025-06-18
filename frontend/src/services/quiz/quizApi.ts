const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface Quiz {
  id: string;
  title: string;
  content: string;
  points: number;
  questions_number: number;
}

export async function fetchQuizById(id: string): Promise<Quiz> {
  try {
    const response = await fetch(`${BASE_URL}/api/unit_content/quiz/${id}`);

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
