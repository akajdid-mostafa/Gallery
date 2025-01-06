const API_URL = 'https://hono-on-vercel123-54cp.vercel.app/api/galleries';

export interface Album {
  id?: string;
  type: string;
  title: string;
  img: string[];
  dateAlbume: string;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error: ${response.status} ${response.statusText}. ${errorBody}`);
  }
  return response.json();
}

export async function fetchAlbums(): Promise<Album[]> {
  const response = await fetch(API_URL);
  return handleResponse(response);
}

export async function addAlbum(album: Album): Promise<Album> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(album),
  });
  return handleResponse(response);
}

export async function updateAlbum(id: string, album: Album): Promise<Album> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(album),
  });
  return handleResponse(response);
}

export async function deleteAlbum(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

