const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { getAuthToken, fetchWithAuth } from '../../utils/authHelpers';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function createUser(userData: CreateUserRequest): Promise<any> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    return response.text();
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error
      ? error
      : new Error('Unknown error occurred while creating user');
  }
}

export async function getUsers(): Promise<User[]> {
  return fetchWithAuth(`${BASE_URL}/sada/users`);
}
