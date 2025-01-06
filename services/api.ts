const API_URL = 'https://hono-on-vercel123-54cp.vercel.app/api/galleries';

export interface Album {
  type: string;
  title: string;
  img: string[];
  dateAlbume: string;
}

export async function fetchAlbums(): Promise<Album[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  return response.json();
}

export async function addAlbum(album: Album): Promise<Album> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(album),
  });
  if (!response.ok) {
    throw new Error('Failed to add album');
  }
  return response.json();
}

export async function updateAlbum(id: string, album: Album): Promise<Album> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(album),
  });
  if (!response.ok) {
    throw new Error('Failed to update album');
  }
  return response.json();
}

export async function deleteAlbum(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete album');
  }
}

