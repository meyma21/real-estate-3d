export interface FloorImageInfo {
  name: string;
  fullPath: string;
  downloadUrl: string;
  size: number;
  contentType: string;
  uploadDate: string;
  isImage: boolean;
}

export interface ImageUploadResponse {
  success: boolean;
  downloadUrl?: string;
  imageInfo?: FloorImageInfo;
  error?: string;
}

export interface MultipleImageUploadResponse {
  success: boolean;
  uploadedImages: {
    fileName: string;
    downloadUrl: string;
    imageInfo: FloorImageInfo;
  }[];
  uploadedCount: number;
  totalCount: number;
  errors?: string[];
}

export interface ImageActionResponse {
  success: boolean;
  message: string;
  imageInfo?: FloorImageInfo;
  error?: string;
}
