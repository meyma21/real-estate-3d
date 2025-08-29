import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../config/firebase';

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  type: 'model' | 'texture' | 'environment' | 'image';
  uploadedAt: Date;
}

export const storageService = {
  // Upload 3D model
  uploadModel: async (file: File, floorId: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `3d-models/${floorId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Upload environment (EXR/HDR)
  uploadEnvironment: async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `environments/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Upload texture
  uploadTexture: async (file: File, category: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `textures/${category}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Upload apartment image
  uploadApartmentImage: async (file: File, apartmentId: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `apartment-images/${apartmentId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Upload floor image (360° view)
  uploadFloorImage: async (floorId: string, filename: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `floors/${floorId}/${filename}`);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Get floor images (360° view images)
  getFloorImages: async (floorId: string): Promise<string[]> => {
    try {
      const storageRef = ref(storage, `floors/${floorId}`);
      const result = await listAll(storageRef);
      
      const imageUrls: string[] = [];
      for (const item of result.items) {
        const url = await getDownloadURL(item);
        imageUrls.push(url);
      }
      
      // Sort by filename to maintain order
      return imageUrls.sort();
    } catch (error) {
      console.warn('Failed to load floor images from storage:', error);
      return [];
    }
  },

  // Delete file
  deleteFile: async (url: string): Promise<void> => {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  },

  // List all models for a floor
  listModels: async (floorId: string): Promise<StorageFile[]> => {
    const storageRef = ref(storage, `3d-models/${floorId}`);
    const result = await listAll(storageRef);
    
    const files: StorageFile[] = [];
    for (const item of result.items) {
      const url = await getDownloadURL(item);
      files.push({
        name: item.name,
        url,
        size: 0, // Would need metadata for actual size
        type: 'model',
        uploadedAt: new Date()
      });
    }
    return files;
  },

  // List all environments
  listEnvironments: async (): Promise<StorageFile[]> => {
    const storageRef = ref(storage, 'environments');
    const result = await listAll(storageRef);
    
    const files: StorageFile[] = [];
    for (const item of result.items) {
      const url = await getDownloadURL(item);
      files.push({
        name: item.name,
        url,
        size: 0,
        type: 'environment',
        uploadedAt: new Date()
      });
    }
    return files;
  },

  // Get default environment
  getDefaultEnvironment: async (): Promise<string> => {
    try {
      const storageRef = ref(storage, 'environments/default-sky.exr');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn('Default environment not found, using fallback');
      return '';
    }
  },

  // Get default floor texture
  getDefaultFloorTexture: async (): Promise<string> => {
    try {
      const storageRef = ref(storage, 'textures/floors/default-floor.jpg');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn('Default floor texture not found');
      return '';
    }
  }
}; 