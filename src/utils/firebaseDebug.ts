import { storage } from '../config/firebase';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { getStorage } from 'firebase/storage';

export const debugFirebaseStorage = async () => {
  console.log('🔍 Debugging Firebase Storage...');
  
  try {
    // List all files in root
    console.log('📁 Listing root files...');
    const rootRef = ref(storage);
    const rootList = await listAll(rootRef);
    
    console.log('Root folders:', rootList.prefixes.map(p => p.name));
    console.log('Root files:', rootList.items.map(i => i.name));
    
    // Check floors folder specifically
    console.log('📁 Checking floors/ folder...');
    const floorsRef = ref(storage, 'floors');
    const floorsList = await listAll(floorsRef);
    
    console.log('Floors files:', floorsList.items.map(i => i.name));
    
    // Try to get download URL for ground-floor.glb
    if (floorsList.items.some(item => item.name === 'ground-floor.glb')) {
      console.log('✅ ground-floor.glb found in floors/');
      const fileRef = ref(storage, 'floors/ground-floor.glb');
      try {
        const url = await getDownloadURL(fileRef);
        console.log('✅ Download URL obtained:', url);
        return url;
      } catch (urlError) {
        console.error('❌ Error getting download URL:', urlError);
      }
    } else {
      console.log('❌ ground-floor.glb NOT found in floors/');
    }
    
  } catch (error) {
    console.error('❌ Firebase Storage debug error:', error);
  }
};

export const testDirectAccess = async (url: string) => {
  console.log('🌐 Testing direct access to:', url);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors'
    });
    console.log('✅ Direct access successful:', response.status);
    return true;
  } catch (error) {
    console.error('❌ Direct access failed:', error);
    return false;
  }
};

// Test Firebase Storage access for 3D models
export const testFirebaseStorageAccess = async () => {
  console.log('🧪 Testing Firebase Storage Access...');
  
  try {
    // Test files that should exist
    const testFiles = [
      'floors/ground-floor.glb',
      'floors/first-floor.glb',
      'floors/second-floor.glb'
    ];
    
    for (const filePath of testFiles) {
      console.log(`📁 Testing access to: ${filePath}`);
      
      try {
        const storageRef = ref(storage, filePath);
        const url = await getDownloadURL(storageRef);
        console.log(`✅ Success: ${filePath}`);
        console.log(`   URL: ${url}`);
        
        // Test if the URL is actually accessible
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'cors'
          });
          
          if (response.ok) {
            console.log(`✅ File accessible via CORS: ${filePath}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            console.log(`   Content-Length: ${response.headers.get('content-length')}`);
          } else {
            console.warn(`⚠️ File exists but not accessible via CORS: ${filePath}`);
            console.warn(`   Status: ${response.status} ${response.statusText}`);
          }
        } catch (corsError) {
          console.error(`❌ CORS Error for ${filePath}:`, corsError);
        }
        
      } catch (storageError: any) {
        console.error(`❌ Storage Error for ${filePath}:`, storageError);
        
        if (storageError.code === 'storage/object-not-found') {
          console.log(`   → File does not exist in Firebase Storage`);
        } else if (storageError.code === 'storage/retry-limit-exceeded') {
          console.log(`   → CORS configuration issue or network problem`);
        }
      }
    }
    
    // Test CORS configuration
    console.log('\n🔧 CORS Configuration Test:');
    console.log('If you see CORS errors above, run this command:');
    console.log('gsutil cors set cors.json gs://real-estate-vis-management-sys.appspot.com');
    
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
  }
};

export const listAllFiles = async () => {
  console.log('📁 Listing ALL files in Firebase Storage...');
  
  try {
    const storage = getStorage();
    const listRef = ref(storage);
    
    console.log('🔍 Getting list of all files...');
    const result = await listAll(listRef);
    
    console.log(`📊 Found ${result.items.length} files and ${result.prefixes.length} folders`);
    
    // List all folders
    if (result.prefixes.length > 0) {
      console.log('📂 Folders found:');
      result.prefixes.forEach((folderRef) => {
        console.log(`  📁 ${folderRef.fullPath}`);
      });
      
      // List files in each folder
      for (const folderRef of result.prefixes) {
        console.log(`\n📂 Files in ${folderRef.fullPath}:`);
        try {
          const folderResult = await listAll(folderRef);
          if (folderResult.items.length === 0) {
            console.log('  (empty folder)');
          } else {
            for (const itemRef of folderResult.items) {
              console.log(`  📄 ${itemRef.fullPath}`);
              
              // Try to get metadata
              try {
                const metadata = await getMetadata(itemRef);
                console.log(`    📊 Size: ${metadata.size} bytes, Type: ${metadata.contentType}`);
              } catch (metaError) {
                console.log(`    ❌ Could not get metadata: ${metaError}`);
              }
            }
          }
        } catch (folderError) {
          console.log(`  ❌ Error listing folder: ${folderError}`);
        }
      }
    }
    
    // List files in root
    if (result.items.length > 0) {
      console.log('\n📄 Files in root:');
      result.items.forEach((itemRef) => {
        console.log(`  📄 ${itemRef.fullPath}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error listing files:', error);
    throw error;
  }
}; 