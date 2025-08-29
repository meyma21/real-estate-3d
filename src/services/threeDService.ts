import { db, storage } from '../config/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface ThreeDPlan {
  id: string;
  floorId: string;
  modelUrl: string;
  buttons: ThreeDButton[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ThreeDButton {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  label: string;
  apartmentId: string;
  customPosition: boolean;
}

const COLLECTION_NAME = 'threeDPlans';

// Development proxy URL for CORS bypass
const PROXY_BASE_URL = 'http://localhost:3001/firebase-storage';
const isDevelopment = import.meta.env.DEV;
const FIREBASE_BUCKET = 'real-estate-vis-management-sys.firebasestorage.app';
const FIREBASE_BUCKET_ALT = 'real-estate-vis-management-sys.appspot.com';

// Cache configuration
const CACHE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB max per file
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB total cache limit
  EXPIRY_HOURS: 24
};

// Firebase Storage file configuration
const FIREBASE_FILES = {
  floors: {
    'Ground Floor': {
      file: 'floors/ground-floor.glb',
      token: 'c859e710-8888-472e-a2e0-19f844cdbf37'
    },
    'First Floor': {
      file: 'floors/first-floor.glb', 
      token: '001ec21d-b21f-4be4-8983-9c683a2f7f33'
    },
    'Second Floor': {
      file: 'floors/second-floor.glb',
      token: '08d99c83-25ef-49e6-9cc5-dd8ca63f0df4'
    },
    'Third Floor': {
      file: 'floors/third-floor.glb',
      token: '61efcece-8072-4f67-9c44-b18f45c5f2c9'
    }
  },
  environment: {
    file: 'environments/my_sky_panorama.exr',
    token: '230334bb-3aae-4563-a5be-2a9b98d03d82'
  },
  textures: {
    floor: {
      file: 'textures/floor-texture.jpg',
      token: '070ae9b3-e861-4786-a11c-aed3a5618404'
    }
  }
};

interface CachedFile {
  data: string;
  timestamp: number;
}

// Enhanced cache management
const getCacheStats = (): { totalSize: number; fileCount: number; files: Array<{key: string; size: number; timestamp: number}> } => {
  const files: Array<{key: string; size: number; timestamp: number}> = [];
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('realestate_3d_')) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          const size = new Blob([value]).size;
          files.push({ key, size, timestamp: data.timestamp });
          totalSize += size;
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    }
  }
  
  return { totalSize, fileCount: files.length, files };
};

const cleanupCache = (targetSize: number = CACHE_CONFIG.MAX_TOTAL_SIZE * 0.7): void => {
  console.log('🧹 Starting cache cleanup...');
  const stats = getCacheStats();
  
  if (stats.totalSize <= targetSize) {
    console.log('✅ Cache size within limits, no cleanup needed');
    return;
  }
  
  // Sort by timestamp (oldest first) and size (largest first for same timestamp)
  const sortedFiles = stats.files.sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return b.size - a.size;
  });
  
  let currentSize = stats.totalSize;
  let removedCount = 0;
  
  for (const file of sortedFiles) {
    if (currentSize <= targetSize) break;
    
    localStorage.removeItem(file.key);
    currentSize -= file.size;
    removedCount++;
    console.log(`🗑️ Removed cached file: ${file.key.substring(0, 50)}... (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }
  
  console.log(`✅ Cache cleanup completed: removed ${removedCount} files, freed ${((stats.totalSize - currentSize) / 1024 / 1024).toFixed(2)}MB`);
};

const canCacheFile = (dataUrl: string, url: string): boolean => {
  const fileSize = new Blob([dataUrl]).size;
  
  // Don't cache environment files (panoramas) as they're typically very large
  if (url.includes('environments/') || url.includes('panorama') || url.includes('.exr') || url.includes('.hdr')) {
    console.log(`⚠️ Skipping cache for environment file: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    return false;
  }
  
  // Check if file is too large
  if (fileSize > CACHE_CONFIG.MAX_FILE_SIZE) {
    console.log(`⚠️ File too large to cache: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max: ${(CACHE_CONFIG.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`);
    return false;
  }
  
  // Check if adding this file would exceed total cache limit
  const stats = getCacheStats();
  if (stats.totalSize + fileSize > CACHE_CONFIG.MAX_TOTAL_SIZE) {
    console.log(`⚠️ Adding file would exceed cache limit: ${((stats.totalSize + fileSize) / 1024 / 1024).toFixed(2)}MB (max: ${(CACHE_CONFIG.MAX_TOTAL_SIZE / 1024 / 1024).toFixed(2)}MB)`);
    
    // Try cleanup and check again
    cleanupCache();
    const newStats = getCacheStats();
    if (newStats.totalSize + fileSize > CACHE_CONFIG.MAX_TOTAL_SIZE) {
      console.log(`⚠️ Still exceeds limit after cleanup, skipping cache for this file`);
      return false;
    }
  }
  
  return true;
};

const getCachedFile = async (url: string): Promise<string | null> => {
  try {
    const cacheKey = `realestate_3d_${btoa(url)}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      console.log('📥 No cached version found, downloading...');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      // Check if we can cache this file
      if (canCacheFile(dataUrl, url)) {
        const cacheData = {
          data: dataUrl,
          timestamp: Date.now(),
          url: url
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          console.log(`💾 File cached successfully: ${(new Blob([dataUrl]).size / 1024 / 1024).toFixed(2)}MB`);
        } catch (error) {
          if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            console.log('⚠️ Storage quota exceeded, attempting cleanup...');
            cleanupCache();
            
            // Try caching again after cleanup
            try {
              localStorage.setItem(cacheKey, JSON.stringify(cacheData));
              console.log('💾 File cached successfully after cleanup');
            } catch (retryError) {
              console.log('⚠️ Could not cache file even after cleanup, proceeding without cache');
            }
          } else {
            console.log('⚠️ Could not cache file:', error);
          }
        }
      }
      
      return dataUrl;
    }
    
    // Check if cached version is still valid
    const cacheData = JSON.parse(cached);
    const isExpired = Date.now() - cacheData.timestamp > CACHE_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000;
    
    if (isExpired) {
      console.log('⏰ Cached version expired, removing...');
      localStorage.removeItem(cacheKey);
      return getCachedFile(url); // Retry to download fresh version
    }
    
    console.log('📦 Using cached file:', url);
    return cacheData.data;
    
  } catch (error) {
    console.error('❌ Error in getCachedFile:', error);
    throw error;
  }
};

export const threeDService = {
  // Get all 3D plans
  getAll: async (): Promise<ThreeDPlan[]> => {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as ThreeDPlan[];
  },

  // Get 3D plan by ID
  getById: async (id: string): Promise<ThreeDPlan | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate()
    } as ThreeDPlan;
  },

  // Get 3D plan by floor ID
  getByFloorId: async (floorId: string): Promise<ThreeDPlan | null> => {
    const q = query(collection(db, COLLECTION_NAME), where('floorId', '==', floorId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as ThreeDPlan;
  },

  // Create new 3D plan
  create: async (data: Omit<ThreeDPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThreeDPlan> => {
    const now = new Date();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: now,
      updatedAt: now
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  },

  // Update 3D plan
  update: async (id: string, data: Partial<ThreeDPlan>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  },

  // Delete 3D plan
  delete: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Upload 3D model file to Storage
  uploadModel: async (file: File, floorName: string): Promise<string> => {
    const fileName = `${floorName.toLowerCase().replace(/\s+/g, '-')}.glb`;
    const storageRef = ref(storage, `floors/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  // Delete 3D model file from Storage
  deleteModel: async (modelUrl: string): Promise<void> => {
    // Extract the path from the URL
    const urlParts = modelUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    const storageRef = ref(storage, `floors/${fileName}`);
    await deleteObject(storageRef);
  },

  // Get floor model URL with caching
  getFloorModelUrl: async (floorName: string): Promise<string | null> => {
    const floorConfig = FIREBASE_FILES.floors[floorName as keyof typeof FIREBASE_FILES.floors];
    if (!floorConfig) {
      console.warn(`No configuration found for floor: ${floorName}`);
      return null;
    }

    try {
      // Use proxy in development to bypass CORS
      if (window.location.hostname === 'localhost') {
        const proxyUrl = `http://localhost:3001/firebase-storage/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(floorConfig.file)}?alt=media&token=${floorConfig.token}`;
        console.log(`🔗 Using proxy URL: ${proxyUrl}`);
        return await getCachedFile(proxyUrl);
      }

      // Direct Firebase Storage URL for production
      const directUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(floorConfig.file)}?alt=media&token=${floorConfig.token}`;
      console.log(`🔗 Using direct Firebase URL: ${directUrl}`);
      return await getCachedFile(directUrl);
    } catch (error) {
      console.error(`Failed to get floor model for ${floorName}:`, error);
      return null;
    }
  },

  // Get environment background URL with caching
  getEnvironmentUrl: async (): Promise<string | null> => {
    try {
      // Use proxy in development to bypass CORS
      if (window.location.hostname === 'localhost') {
        const proxyUrl = `http://localhost:3001/firebase-storage/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(FIREBASE_FILES.environment.file)}?alt=media&token=${FIREBASE_FILES.environment.token}`;
        console.log(`🌅 Using proxy environment URL: ${proxyUrl}`);
        return await getCachedFile(proxyUrl);
      }

      // Direct Firebase Storage URL for production
      const directUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(FIREBASE_FILES.environment.file)}?alt=media&token=${FIREBASE_FILES.environment.token}`;
      console.log(`🌅 Using direct environment URL: ${directUrl}`);
      return await getCachedFile(directUrl);
    } catch (error) {
      console.error('Failed to get environment background:', error);
      return null;
    }
  },

  // Get floor texture URL with caching
  getFloorTextureUrl: async (): Promise<string | null> => {
    try {
      // Use proxy in development to bypass CORS
      if (window.location.hostname === 'localhost') {
        const proxyUrl = `http://localhost:3001/firebase-storage/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(FIREBASE_FILES.textures.floor.file)}?alt=media&token=${FIREBASE_FILES.textures.floor.token}`;
        console.log(`🎨 Using proxy texture URL: ${proxyUrl}`);
        return await getCachedFile(proxyUrl);
      }

      // Direct Firebase Storage URL for production
      const directUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o/${encodeURIComponent(FIREBASE_FILES.textures.floor.file)}?alt=media&token=${FIREBASE_FILES.textures.floor.token}`;
      console.log(`🎨 Using direct texture URL: ${directUrl}`);
      return await getCachedFile(directUrl);
    } catch (error) {
      console.error('Failed to get floor texture:', error);
      return null;
    }
  },

  // Check if model exists for floor
  checkModelExists: async (floorName: string): Promise<boolean> => {
    try {
      const url = await threeDService.getFloorModelUrl(floorName);
      return !!url;
    } catch {
      return false;
    }
  },

  // Test if proxy server is available
  isProxyAvailable: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(1000) // 1 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Clear cache (for debugging)
  clearCache: (): void => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('realestate_3d_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keys.length} cached files`);
  }
};

// Enhanced cache management functions for external use
export const cacheManager = {
  getStats: (): { totalSize: string; fileCount: number; files: Array<{key: string; size: string; age: string}> } => {
    const stats = getCacheStats();
    return {
      totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
      fileCount: stats.fileCount,
      files: stats.files.map(f => ({
        key: f.key.replace('realestate_3d_', '').substring(0, 50) + '...',
        size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
        age: `${Math.round((Date.now() - f.timestamp) / (1000 * 60 * 60))}h`
      }))
    };
  },
  
  clearCache: (): void => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('realestate_3d_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keys.length} cached files`);
  },
  
  cleanup: (): void => {
    cleanupCache();
  }
}; 