import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import imageCompression from 'browser-image-compression';

export async function uploadImage(file: File): Promise<string> {
  try {
    // Options for image compression
    const options = {
      maxSizeMB: 0.4, 
      maxWidthOrHeight: 1024, 
      useWebWorker: true, 
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);

    
    if (compressedFile.size > 400 * 1024) {
      throw new Error('Compressed image size is still larger than 400 KB');
    }

    // Create a reference to the storage location
    const storageRef = ref(storage, `Gallery/${Date.now()}-${compressedFile.name}`);

    // Upload the compressed file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, compressedFile);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}