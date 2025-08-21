import { getAuthToken } from '../../utils/authHelpers.ts';

const envBaseUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL =
  envBaseUrl && envBaseUrl.trim() !== '' ? `${envBaseUrl}/api` : '/api';

export interface UnitContent {
  id: string;
  unit_id: string;
  title: string;
  content_type: string;
  content: string;
  sort_order: number;
  status: string;
  points: number;
  hasProgress?: boolean;
}

export interface UnitDetailsResponse {
  id: string;
  title: string;
  description: string;
  moduleId?: string;
}

export interface Video {
  id: string;
  unit_id: string;
  title: string;
  content: string;
  url: string;
  points: number;
}

export interface Article {
  id: string;
  unit_id: string;
  title: string;
  content: string;
  points: number;
}

export interface Unit {
  id: string;
  module_id: string;
  title: string;
  description: string;
}

export type UnitInput = Omit<Unit, 'id'>;

export interface CreateUnitResponse {
  id: string;
  title: string;
}

export async function fetchUnitTitleByModuleId(moduleId: string): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/units?moduleId=${encodeURIComponent(moduleId)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch UNIT title: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error fetching UNIT title:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function fetchUnitById(unitId: string): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/units/${encodeURIComponent(unitId)}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch UNIT details: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Error fetching UNIT details:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function fetchUnitContentDetails(
  id: string,
): Promise<UnitContent> {
  const response = await fetch(`${BASE_URL}/unit_content/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch unit content');
  }

  const data: UnitContent = await response.json();
  console.log('fetched unit details are', data);
  return data;
}

export async function fetchUnitContentById(id: string): Promise<UnitContent[]> {
  const response = await fetch(`${BASE_URL}/unit_content?unitId=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch unit content');
  }

  const data: UnitContent[] = await response.json();
  console.log('fetched unit data is', data);
  return data;
}

export async function fetchVideoContentById(id: string): Promise<Video> {
  const response = await fetch(`${BASE_URL}/unit_content/video/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video content');
  }

  const data: Video = await response.json();
  return data;
}

export async function fetchArticleContentById(id: string): Promise<Article> {
  const response = await fetch(`${BASE_URL}/unit_content/article/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article content');
  }

  const data: Article = await response.json();
  return data;
}

export async function createUnit(
  unitData: UnitInput,
): Promise<CreateUnitResponse> {
  try {
    const response = await fetch(`${BASE_URL}/units`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unitData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create unit: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(
      'Error creating unit:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error instanceof Error
      ? error
      : new Error('Unknown error occurred while creating unit');
  }
}

export async function updateUnit(id: string, unit: UnitInput): Promise<Unit> {
  const url = `${BASE_URL}/units/${id}`;
  console.log('[updateModule] Updating:', url, 'Payload:', unit);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unit),
    });
    console.log(`[updateUnit] Response status: ${response.status}`);
    console.log(
      `[updateUnit] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(`[updateUnit] Error response body:`, text);
      throw new Error(`Failed to update unit. Status: ${response.status}`);
    }
    const data: Unit = await response.json();
    console.log(`[updateUnit] Success. Data:`, data);
    return data;
  } catch (error) {
    console.error(`[updateUnit] Exception:`, error);
    throw error;
  }
}

export async function deleteUnit(id: string): Promise<string> {
  const token = getAuthToken();
  const url = `${BASE_URL}/units/${id}`;
  console.log('[deleteUnit] DELETE:', url);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    console.log(`[deleteUnit] Response status: ${response.status}`);
    console.log(
      `[deleteUnit] Response headers:`,
      Object.fromEntries(response.headers.entries()),
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(`[deleteUnit] Error response body:`, text);
      throw new Error('Failed to delete unit');
    }

    return text;
  } catch (error) {
    console.error(`[deleteUnit] Exception:`, error);
    throw error;
  }
}
