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
  try {
    return await fetchWithAuth(`${BASE_URL}/users`);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to get users');
  }
}

export async function getUserById(
  id: string | null,
  token: string | null,
): Promise<User> {
  try {
    return await fetchWithAuth(`${BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get user by id');
  }
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    password: string;
    oldPassword: string;
  }>,
): Promise<User> {
  try {
    const token = getAuthToken();
    return await fetchWithAuth(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to update user');
  }
}

export const updateUserName = async (id: string, name: string) =>
  await updateUser(id, { name });

export const updateUserEmail = async (id: string, email: string) =>
  await updateUser(id, { email });

export const updateUserPassword = async (
  id: string,
  oldPassword: string,
  password: string,
) => await updateUser(id, { oldPassword, password });

export async function deleteUser(id: string): Promise<string> {
  const token = getAuthToken();
  const url = `${BASE_URL}/users/${id}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Failed to delete user');
    }
    return text || 'User deleted successfully';
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to delete user');
  }
}
