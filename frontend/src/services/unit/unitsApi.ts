const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface UnitContent {
  id: string;
  title: string;
  content_type: string;
}

export interface Video {
  id: string;
  title: string;
  content: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
}

export async function fetchUnitContentById(id: string): Promise<UnitContent[]> {
  const response = await fetch(`${BASE_URL}/api/unit_content?unitId=${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch unit content');
  }

  const data: UnitContent[] = await response.json();
  console.log('fetched unit data is', data);
  return data;
}

export async function fetchVideoContentById(id: string): Promise<Video> {
  const response = await fetch(`${BASE_URL}/api/unit_content/video/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch video content');
  }

  const data: Video = await response.json();
  console.log('fetched video data is', data);
  return data;
}

export async function fetchArticleContentById(id: string): Promise<Article> {
  const response = await fetch(`${BASE_URL}/api/unit_content/article/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article content');
  }

  const data: Article = await response.json();
  console.log('fetched article data is', data);
  return data;
}
