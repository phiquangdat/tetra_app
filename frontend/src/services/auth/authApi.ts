const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

export interface LoginProps {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  role: string;
  token: string;
}

export async function loginUser(loginData: LoginProps): Promise<LoginResponse> {
  const url = `${BASE_URL}/auth/login`;
  console.log(`[login] Fetching: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to login: ${response.status === 401 ? 'Invalid credentials' : response.statusText}`,
      );
    }
    const data: LoginResponse = await response.json();
    console.log('[login] Response data:', data);
    return data;
  } catch (error) {
    console.error(
      '[login] Error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
