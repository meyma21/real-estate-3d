// Cache management utilities for the 3D real estate application

export interface CacheStats {
  totalSize: string;
  fileCount: number;
  files: Array<{
    key: string;
    size: string;
    age: string;
    url: string;
  }>;
  storageUsage: {
    used: string;
    percentage: number;
  };
}

export const cacheUtils = {
  // Get detailed cache statistics
  getStats: (): CacheStats => {
    const files: Array<{key: string; size: number; timestamp: number; url: string}> = [];
    let totalSize = 0;
    let totalStorageSize = 0;
    
    // Calculate total localStorage usage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        totalStorageSize += key.length + value.length;
        
        // Process our cache entries
        if (key.startsWith('realestate_3d_')) {
          try {
            const data = JSON.parse(value);
            const size = new Blob([value]).size;
            files.push({ 
              key, 
              size, 
              timestamp: data.timestamp || 0,
              url: data.url || 'unknown'
            });
            totalSize += size;
          } catch (e) {
            // Invalid cache entry, could be removed
            console.warn('Invalid cache entry found:', key);
          }
        }
      }
    }
    
    const estimatedLimit = 10 * 1024 * 1024; // 10MB estimate
    const percentage = Math.round((totalStorageSize / estimatedLimit) * 100);
    
    return {
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      fileCount: files.length,
      files: files.map(f => ({
        key: f.key.replace('realestate_3d_', '').substring(0, 60) + '...',
        size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
        age: `${Math.round((Date.now() - f.timestamp) / (1000 * 60 * 60))}h`,
        url: f.url
      })),
      storageUsage: {
        used: `${(totalStorageSize / 1024 / 1024).toFixed(2)}MB`,
        percentage: percentage
      }
    };
  },

  // Clear all cache entries
  clearCache: (): number => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('realestate_3d_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${keys.length} cached files`);
    return keys.length;
  },

  // Clear only large files (over specified size)
  clearLargeFiles: (maxSizeMB: number = 2): number => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('realestate_3d_'));
    let removedCount = 0;
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        const size = new Blob([value]).size;
        const sizeMB = size / 1024 / 1024;
        
        if (sizeMB > maxSizeMB) {
          localStorage.removeItem(key);
          removedCount++;
          console.log(`🗑️ Removed large cached file: ${key.substring(0, 50)}... (${sizeMB.toFixed(2)}MB)`);
        }
      }
    });
    
    console.log(`✅ Cleared ${removedCount} large files over ${maxSizeMB}MB`);
    return removedCount;
  },

  // Clear expired entries
  clearExpired: (maxAgeHours: number = 24): number => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('realestate_3d_'));
    let removedCount = 0;
    const now = Date.now();
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const data = JSON.parse(value);
          const ageHours = (now - (data.timestamp || 0)) / (1000 * 60 * 60);
          
          if (ageHours > maxAgeHours) {
            localStorage.removeItem(key);
            removedCount++;
            console.log(`🗑️ Removed expired cached file: ${key.substring(0, 50)}... (${ageHours.toFixed(1)}h old)`);
          }
        } catch (e) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
          removedCount++;
        }
      }
    });
    
    console.log(`✅ Cleared ${removedCount} expired files older than ${maxAgeHours}h`);
    return removedCount;
  },

  // Smart cleanup - remove old and large files when storage is getting full
  smartCleanup: (): void => {
    const stats = cacheUtils.getStats();
    console.log(`📊 Current cache stats: ${stats.totalSize}, ${stats.fileCount} files, ${stats.storageUsage.percentage}% storage used`);
    
    if (stats.storageUsage.percentage > 80) {
      console.log('⚠️ Storage usage high, performing cleanup...');
      
      // First, clear expired files
      const expiredRemoved = cacheUtils.clearExpired(12); // 12 hours
      
      // Then clear large files if still needed
      const updatedStats = cacheUtils.getStats();
      if (updatedStats.storageUsage.percentage > 70) {
        const largeRemoved = cacheUtils.clearLargeFiles(1); // 1MB
        console.log(`🧹 Smart cleanup completed: ${expiredRemoved + largeRemoved} files removed`);
      }
    } else {
      console.log('✅ Storage usage is acceptable, no cleanup needed');
    }
  }
};

// Console helper for debugging
if (typeof window !== 'undefined') {
  (window as any).cacheUtils = cacheUtils;
  console.log('🔧 Cache utilities available in console as window.cacheUtils');
} 