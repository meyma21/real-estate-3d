import api from './api';
import { Floor } from '../types/floor';
import { storageService } from './storageService';

export interface FloorImageData {
  imageIndex: number;
  imageUrl: string;
  angle: number;
}

export interface Hotspot {
  id?: string;         // optional id for frontend display
  apartmentId: string; // reference to the apartment doc / id
  x: number;           // percentage (0-100) from the left of the image
  y: number;           // percentage (0-100) from the top of the image
  width?: number;      // optional rectangle width (% of image width)
  height?: number;     // optional rectangle height
  label?: string;      // optional label for display
}

export const floorService = {
  // Get all floors
  getAll: async (): Promise<Floor[]> => {
    const response = await api.get('/floors');
    return response.data;
  },

  // Get floor by ID
  getById: async (id: string): Promise<Floor> => {
    const response = await api.get(`/floors/${id}`);
    return response.data;
  },

  // Create new floor
  create: async (floor: Omit<Floor, 'id'>): Promise<Floor> => {
    const response = await api.post('/floors/simple', floor);
    return response.data;
  },

  // Update floor
  update: async (id: string, floor: Partial<Floor>): Promise<Floor> => {
    const response = await api.put(`/floors/${id}/simple`, floor);
    return response.data;
  },

  // Delete floor
  delete: async (id: string): Promise<void> => {
    await api.delete(`/floors/${id}`);
  },

  // Get floor by level
  getByLevel: async (level: number): Promise<Floor> => {
    const response = await api.get(`/floors/level/${level}`);
    return response.data;
  },

  // Get floor images (360° view images)
  getFloorImages: async (floorId: string): Promise<FloorImageData[]> => {
    try {
      // Try to get from backend API first
      const response = await api.get(`/floors/${floorId}/images`);
      const imageUrls = response.data;
      
      if (imageUrls && imageUrls.length > 0) {
        return imageUrls.map((url: string, index: number) => ({
          imageIndex: index,
          imageUrl: url,
          angle: (index * 360) / imageUrls.length,
        }));
      }
      
      // Fallback to Firebase Storage
      const floorImageUrls = await storageService.getFloorImages(floorId);
      if (floorImageUrls && floorImageUrls.length > 0) {
        return floorImageUrls.map((url, index) => ({
          imageIndex: index,
          imageUrl: url,
          angle: (index * 360) / floorImageUrls.length,
        }));
      }
      
      return [];
    } catch (error) {
      console.warn('Failed to load floor images:', error);
      return [];
    }
  },

  // Get floor hotspots
  getFloorHotspots: async (floorId: string, imageIndex: number): Promise<Hotspot[]> => {
    try {
      const response = await api.get(`/floors/${floorId}/hotspots/${imageIndex}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to load floor hotspots:', error);
      return [];
    }
  },

  // Upload floor images
  uploadFloorImages: async (floorId: string, images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const filename = `floor-${floorId}-angle-${index}.jpg`;
      return await storageService.uploadFloorImage(floorId, filename, image);
    });
    
    return Promise.all(uploadPromises);
  },

  // Upload floor images using backend API
  uploadFloorImagesViaAPI: async (floorId: string, images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append('files', image);
    });
    
    const response = await api.post(`/floors/${floorId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update hotspots for a floor
  updateHotspots: async (floorId: string, hotspots: { 
    topViewHotspots?: Hotspot[], 
    angleHotspots?: { [imageNumber: string]: Hotspot[] } 
  }): Promise<void> => {
    await api.put(`/floors/${floorId}/hotspots`, hotspots);
  }
}; 