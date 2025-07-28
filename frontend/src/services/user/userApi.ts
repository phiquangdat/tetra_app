const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

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

export async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    return await fetchWithAuth(`${BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to create user');
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
    oldPassword: string;
    newPassword: string;
  }>,
): Promise<User> {
  try {
    return await fetchWithAuth(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
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
  newPassword: string,
) => await updateUser(id, { oldPassword, newPassword });
