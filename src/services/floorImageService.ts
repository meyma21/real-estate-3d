import api from './api';
import { FloorImageInfo, ImageUploadResponse, MultipleImageUploadResponse, ImageActionResponse } from '../types/floorImage';

export const floorImageService = {
  // Get all images for a floor with detailed information
  getFloorImageDetails: async (floorId: string): Promise<FloorImageInfo[]> => {
    const response = await api.get(`/floors/${floorId}/images/details`);
    return response.data;
  },

  // Upload a single image to a floor
  uploadFloorImage: async (floorId: string, file: File, customFileName?: string): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (customFileName) {
      formData.append('fileName', customFileName);
    }

    const response = await api.post(`/floors/${floorId}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple images to a floor
  uploadMultipleFloorImages: async (floorId: string, files: File[]): Promise<MultipleImageUploadResponse> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post(`/floors/${floorId}/images/upload-multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete an image from a floor
  deleteFloorImage: async (floorId: string, fileName: string): Promise<ImageActionResponse> => {
    const response = await api.delete(`/floors/${floorId}/images/${fileName}`);
    return response.data;
  },

  // Rename an image in a floor
  renameFloorImage: async (floorId: string, fileName: string, newFileName: string): Promise<ImageActionResponse> => {
    const response = await api.put(`/floors/${floorId}/images/${fileName}/rename`, null, {
      params: { newFileName }
    });
    return response.data;
  },

  // Get information about a specific image
  getFloorImageInfo: async (floorId: string, fileName: string): Promise<FloorImageInfo> => {
    const response = await api.get(`/floors/${floorId}/images/${fileName}/info`);
    return response.data;
  },

  // Helper function to format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Helper function to get file extension
  getFileExtension: (fileName: string): string => {
    return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  // Helper function to validate image file
  isValidImageFile: (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    return validTypes.includes(file.type);
  },

  // Helper function to validate file name
  isValidFileName: (fileName: string): boolean => {
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255;
  }
};
