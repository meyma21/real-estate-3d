import React, { useState } from 'react';
import { debugFirebaseStorage, testFirebaseStorageAccess, listAllFiles } from '../utils/firebaseDebug';

const DebugStorage: React.FC = () => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const captureConsoleLogs = (fn: () => Promise<void>) => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(`LOG: ${args.join(' ')}`);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };
    
    console.warn = (...args) => {
      logs.push(`WARN: ${args.join(' ')}`);
      originalWarn(...args);
    };
    
    return { logs, restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }};
  };

  const handleDebug = async () => {
    setIsDebugging(true);
    setResults([]);
    
    console.log('🔍 Starting Firebase Storage debug...');
    
    const { logs, restore } = captureConsoleLogs(async () => {});
    
    try {
      await debugFirebaseStorage();
      await testFirebaseStorageAccess();
    } catch (error) {
      logs.push(`EXCEPTION: ${error}`);
    }
    
    restore();
    setResults(logs);
    setIsDebugging(false);
  };

  const handleListAllFiles = async () => {
    setIsListing(true);
    setResults([]);
    
    console.log('📁 Listing all files in Firebase Storage...');
    
    const { logs, restore } = captureConsoleLogs(async () => {});
    
    try {
      // Try server-side listing first (bypasses CORS)
      console.log('🔧 Trying server-side file listing...');
      const response = await fetch('http://localhost:3001/list-files');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server-side listing successful!');
        console.log(`📊 Found ${data.totalFiles} files:`);
        
        data.files.forEach((file: any) => {
          console.log(`  📄 ${file.fullPath}`);
          console.log(`    📊 Size: ${file.size} bytes`);
          console.log(`    📊 Type: ${file.contentType}`);
          console.log(`    🔗 URL: ${file.downloadUrl}`);
        });
        
        // Test access to specific files we need
        const expectedFiles = [
          'floors/ground-floor.glb',
          'floors/first-floor.glb', 
          'floors/second-floor.glb',
          'floors/third-floor.glb'
        ];
        
        console.log('\n🎯 Checking for expected 3D model files:');
        expectedFiles.forEach(expectedFile => {
          const found = data.files.find((file: any) => file.fullPath === expectedFile);
          if (found) {
            console.log(`✅ Found: ${expectedFile} (${found.size} bytes)`);
          } else {
            console.log(`❌ Missing: ${expectedFile}`);
          }
        });
        
      } else {
        console.error('❌ Server-side listing failed:', response.status);
        // Fallback to client-side listing
        await listAllFiles();
      }
    } catch (error) {
      console.error('❌ Server-side listing error:', error);
      logs.push(`SERVER ERROR: ${error}`);
      
      // Fallback to client-side listing
      try {
        await listAllFiles();
      } catch (clientError) {
        logs.push(`CLIENT ERROR: ${clientError}`);
      }
    }
    
    restore();
    setResults(logs);
    setIsListing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Firebase Storage Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Firebase Storage</h2>
          <p className="text-gray-600 mb-4">
            This will check what files exist in your Firebase Storage and test access to them.
          </p>
          
          <div className="space-x-4">
            <button
              onClick={handleDebug}
              disabled={isDebugging || isListing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isDebugging ? 'Debugging...' : 'Test 3D Files'}
            </button>
            
            <button
              onClick={handleListAllFiles}
              disabled={isDebugging || isListing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isListing ? 'Listing...' : 'List All Files'}
            </button>
          </div>
        </div>
        
        {results.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <h3 className="text-white font-semibold mb-2">Debug Results:</h3>
            <div className="max-h-96 overflow-y-auto">
              {results.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Files:</h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• floors/ground-floor.glb</li>
            <li>• floors/first-floor.glb</li>
            <li>• floors/second-floor.glb</li>
            <li>• floors/third-floor.glb</li>
            <li>• environments/sky-background.exr</li>
            <li>• textures/floor-texture.jpg</li>
          </ul>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click "List All Files" to see exactly what files exist in Firebase Storage</li>
            <li>Click "Test 3D Files" to test access to the expected 3D model files</li>
            <li>Check the console output below for detailed information</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugStorage; 