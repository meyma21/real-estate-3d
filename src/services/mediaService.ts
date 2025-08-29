import api from './api';

export const mediaService = {
  // Upload a file (3D model or image)
  uploadFile: async (file: File, type: '3d' | 'image'): Promise<{ url: string; type: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/media/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a file
  deleteFile: async (type: '3d' | 'image', fileName: string): Promise<void> => {
    await api.delete(`/media/${type}/${fileName}`);
  },

  // Get file URL
  getFileUrl: async (type: '3d' | 'image', fileName: string): Promise<string> => {
    const response = await api.get(`/media/url/${type}/${fileName}`);
    return response.data.url;
  },

  // Check if file exists
  checkFileExists: async (type: '3d' | 'image', fileName: string): Promise<boolean> => {
    const response = await api.get(`/media/exists/${type}/${fileName}`);
    return response.data.exists;
  },

  // Helper function to get file name from URL
  getFileNameFromUrl: (url: string): string => {
    return url.split('/').pop() || '';
  },

  // Helper function to get file type from file
  getFileType: (file: File): '3d' | 'image' => {
    return file.type.startsWith('image/') ? 'image' : '3d';
  }
}; 