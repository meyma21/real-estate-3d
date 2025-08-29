import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadModel = async (file: File, floorId: string): Promise<string> => {
  try {
    // Validate file type
    if (!file.type.match(/^model\/(gltf-binary|gltf\+json)$/) && 
        !file.type.match(/^application\/octet-stream$/)) {
      throw new Error('Invalid file type. Only GLTF models are supported.');
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit.');
    }

    // Create storage reference
    const storageRef = ref(storage, `models/${floorId}/${file.name}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        floorId,
        uploadedAt: new Date().toISOString()
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading model:', error);
    throw error;
  }
};

export const validateModelFile = (file: File): boolean => {
  // Check file type
  const validTypes = [
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream'
  ];
  
  if (!validTypes.includes(file.type)) {
    return false;
  }

  // Check file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return false;
  }

  return true;
}; 