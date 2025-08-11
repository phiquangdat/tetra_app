const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

import { fetchWithAuth } from '../../utils/authHelpers';

export interface ModuleProgress {
  status: string;
  last_visited_unit_id: string;
  last_visited_content_id: string;
  earned_points: number;
}

export interface UnitProgress {
  id: string;
  userId: string;
  moduleId: string;
  unitId: string;
  status: string;
}

export interface ContentProgress {
  id: string;
  userId: string;
  unitId: string;
  unitContentId: string;
  status: string;
  points: number;
}

export interface CreateModuleProgressRequest {
  lastVisitedContent?: string;
  lastVisitedUnit?: string;
}

export async function getModuleProgress(
  moduleId: string,
): Promise<ModuleProgress> {
  try {
    return await fetchWithAuth(`${BASE_URL}/user-module-progress/${moduleId}`);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get module progress');
  }
}

export async function createModuleProgress(
  moduleId: string,
  data: CreateModuleProgressRequest,
): Promise<any> {
  try {
    return await fetchWithAuth(`${BASE_URL}/user-module-progress`, {
      method: 'POST',
      body: JSON.stringify({ moduleId, ...data }),
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to create module progress');
  }
}

export async function getUnitProgress(unitId: string): Promise<UnitProgress> {
  try {
    return await fetchWithAuth(`${BASE_URL}/user-unit-progress/${unitId}`);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get unit progress');
  }
}

export async function createUnitProgress(
  unitId: string,
  moduleId: string,
): Promise<UnitProgress> {
  try {
    return await fetchWithAuth(`${BASE_URL}/user-unit-progress`, {
      method: 'POST',
      body: JSON.stringify({ unitId, moduleId, status: 'IN_PROGRESS' }),
    });
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to create unit progress');
  }
}

export async function getContentProgress(
  unitId: string,
): Promise<ContentProgress[]> {
  try {
    return await fetchWithAuth(
      `${BASE_URL}/users-content-progress?unitId=${unitId}`,
    );
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Failed to get content progress');
  }
}
