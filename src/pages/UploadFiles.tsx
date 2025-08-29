import React, { useState } from 'react';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UploadFiles: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadResults([]);
    const results: string[] = [];

    for (const file of Array.from(files)) {
      try {
        console.log(`📤 Uploading: ${file.name}`);
        results.push(`📤 Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Determine the storage path based on file type
        let storagePath = '';
        if (file.name.toLowerCase().includes('floor') && file.name.toLowerCase().endsWith('.glb')) {
          // 3D model files go to floors/
          const floorName = file.name.toLowerCase().replace('.glb', '');
          storagePath = `floors/${floorName}.glb`;
        } else if (file.name.toLowerCase().endsWith('.glb')) {
          // Other 3D models
          storagePath = `models/${file.name}`;
        } else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
          // Images
          storagePath = `images/${file.name}`;
        } else if (file.name.toLowerCase().endsWith('.exr')) {
          // Environment maps
          storagePath = `environments/${file.name}`;
        } else {
          // Default location
          storagePath = `uploads/${file.name}`;
        }

        console.log(`📁 Upload path: ${storagePath}`);
        results.push(`📁 Upload path: ${storagePath}`);

        // Create storage reference
        const storageRef = ref(storage, storagePath);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        console.log(`✅ Upload completed: ${storagePath}`);
        results.push(`✅ Upload completed: ${storagePath}`);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`🔗 Download URL: ${downloadURL}`);
        results.push(`🔗 Download URL: ${downloadURL}`);
        results.push(''); // Empty line for separation

      } catch (error) {
        console.error(`❌ Upload failed for ${file.name}:`, error);
        results.push(`❌ Upload failed for ${file.name}: ${error}`);
        results.push(''); // Empty line for separation
      }
    }

    setUploadResults(results);
    setUploading(false);
  };

  const testFileAccess = async () => {
    const testFiles = [
      'floors/ground-floor.glb',
      'floors/first-floor.glb',
      'floors/second-floor.glb',
      'floors/third-floor.glb'
    ];

    const results: string[] = [];
    results.push('🧪 Testing file access...');

    for (const filePath of testFiles) {
      try {
        // Test via proxy
        const proxyUrl = `http://localhost:3001/firebase-storage/v0/b/real-estate-vis-management-sys.appspot.com/o/${encodeURIComponent(filePath)}?alt=media`;
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        
        if (response.ok) {
          results.push(`✅ ${filePath} - Accessible via proxy`);
        } else {
          results.push(`❌ ${filePath} - Not found (${response.status})`);
        }
      } catch (error) {
        results.push(`❌ ${filePath} - Error: ${error}`);
      }
    }

    setUploadResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📤 Upload 3D Model Files</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Files to Firebase Storage</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select 3D Model Files (.glb files)
            </label>
            <input
              type="file"
              multiple
              accept=".glb,.gltf,.jpg,.jpeg,.png,.webp,.exr"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="space-x-4">
            <button
              onClick={testFileAccess}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test File Access
            </button>
          </div>

          {uploading && (
            <div className="mt-4 text-blue-600">
              📤 Uploading files...
            </div>
          )}
        </div>

        {uploadResults.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <h3 className="text-white font-semibold mb-2">Upload Results:</h3>
            <div className="max-h-96 overflow-y-auto">
              {uploadResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-blue-700 space-y-2 list-decimal list-inside">
            <li>Select your 3D model files (.glb format)</li>
            <li>Files with "floor" in the name will be uploaded to the <code>floors/</code> folder</li>
            <li>Other files will be organized by type automatically</li>
            <li>Use "Test File Access" to verify uploaded files are accessible</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Files:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• <strong>ground-floor.glb</strong> → floors/ground-floor.glb</li>
            <li>• <strong>first-floor.glb</strong> → floors/first-floor.glb</li>
            <li>• <strong>second-floor.glb</strong> → floors/second-floor.glb</li>
            <li>• <strong>third-floor.glb</strong> → floors/third-floor.glb</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadFiles; 