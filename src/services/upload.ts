import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import imageCompression from 'browser-image-compression';

/**
 * Uploads an image to Firebase Storage after compressing it.
 * @param file - The image file to upload.
 * @returns The download URL of the uploaded image.
 */
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

    // Check if the compressed file size is still too large
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

/**
 * Deletes an image from Firebase Storage using its URL.
 * @param imageUrl - The URL of the image to delete.
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const filePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);

    // Create a reference to the file in Firebase Storage
    const fileRef = ref(storage, filePath);

    // Delete the file
    await deleteObject(fileRef);

    console.log('Image deleted successfully:', imageUrl);
  } catch (error: any) {
    // Check if the error is due to the image not existing
    if (error.code === 'storage/object-not-found') {
      console.warn('Image not found in Firebase Storage:', imageUrl);
      return; // Silently ignore the error
    }

    // Log and rethrow other errors
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}