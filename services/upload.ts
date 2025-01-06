import { put } from '@vercel/blob';

export async function uploadImage(file: File): Promise<string> {
  const filename = `${Date.now()}-${file.name}`;
  const { url } = await put(filename, file, { access: 'public' });
  return url;
}

