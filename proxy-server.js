import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy Firebase Storage requests (simplified route)
app.use('/firebase', createProxyMiddleware({
  target: 'https://firebasestorage.googleapis.com',
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Extract the file path from the request
    const filePath = path.replace('/firebase/', '');
    
    // Map file paths to their tokens
    const tokens = {
      'floors/ground-floor.glb': 'c859e710-8888-472e-a2e0-19f844cdbf37',
      'floors/first-floor.glb': '001ec21d-b21f-4be4-8983-9c683a2f7f33',
      'floors/second-floor.glb': '08d99c83-25ef-49e6-9cc5-dd8ca63f0df4',
      'floors/third-floor.glb': '61efcece-8072-4f67-9c44-b18f45c5f2c9',
      'environments/my_sky_panorama.exr': '230334bb-3aae-4563-a5be-2a9b98d03d82',
      'textures/floor-texture.jpg': '070ae9b3-e861-4786-a11c-aed3a5618404'
    };
    
    const token = tokens[filePath];
    if (!token) {
      console.log(`❌ No token found for file: ${filePath}`);
      return path; // Return original path if no token found
    }
    
    // Construct the proper Firebase Storage URL path
    const newPath = `/v0/b/real-estate-vis-management-sys.firebasestorage.app/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
    console.log(`🔄 Rewriting: ${path} -> ${newPath}`);
    return newPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 Proxying: ${req.method} ${req.url}`);
    console.log(`🎯 Target: ${proxyReq.protocol}//${proxyReq.getHeader('host')}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`📥 Response: ${proxyRes.statusCode} for ${req.url}`);
    proxyRes.headers['access-control-allow-origin'] = '*';
    proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, HEAD, OPTIONS';
    proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    res.status(500).json({
      error: 'Proxy error',
      message: err.message,
      url: req.url
    });
  }
}));

// Proxy Firebase Storage requests
app.use('/firebase-storage', createProxyMiddleware({
  target: 'https://firebasestorage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/firebase-storage': '', // Remove /firebase-storage prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📡 Proxying: ${req.method} ${req.url}`);
    console.log(`🎯 Target: https://firebasestorage.googleapis.com${req.url}`);
    
    // Add headers to bypass potential issues
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    proxyReq.setHeader('Accept', '*/*');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`📥 Response: ${proxyRes.statusCode} for ${req.url}`);
    
    // Add CORS headers to the response
    proxyRes.headers['access-control-allow-origin'] = '*';
    proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, HEAD, OPTIONS';
    proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    res.status(500).json({
      error: 'Proxy error',
      message: err.message,
      url: req.url
    });
  },
  logLevel: 'debug'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CORS Proxy server is running'
  });
});

// Test endpoint for Firebase Storage
app.get('/test-firebase', async (req, res) => {
  try {
    // Try both Firebase domains
    const testUrls = [
      'https://firebasestorage.googleapis.com/v0/b/real-estate-vis-management-sys.firebasestorage.app/o/floors%2Fground-floor.glb?alt=media',
      'https://firebasestorage.googleapis.com/v0/b/real-estate-vis-management-sys.appspot.com/o/floors%2Fground-floor.glb?alt=media'
    ];
    
    const fetch = (await import('node-fetch')).default;
    const results = [];
    
    for (const testUrl of testUrls) {
      console.log('🧪 Testing direct access to:', testUrl);
      
      try {
        const response = await fetch(testUrl);
        
        console.log('📊 Test response status:', response.status);
        console.log('📊 Test response headers:', Object.fromEntries(response.headers.entries()));
        
        results.push({
          url: testUrl,
          status: response.status,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error) {
        console.error('❌ Test error for', testUrl, ':', error.message);
        results.push({
          url: testUrl,
          status: 'error',
          success: false,
          error: error.message
        });
      }
    }
    
    const successfulResult = results.find(r => r.success);
    
    if (successfulResult) {
      res.json({
        status: 'success',
        message: 'Firebase Storage is accessible',
        results: results
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Firebase Storage not accessible on any domain',
        results: results
      });
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// List Firebase Storage files endpoint
app.get('/list-files', async (req, res) => {
  try {
    console.log('📁 Server-side: Listing Firebase Storage files...');
    const fetch = (await import('node-fetch')).default;
    
    // List files in different folders
    const folders = ['floors', 'models', 'environments', 'textures', ''];
    const allFiles = [];
    
    for (const folder of folders) {
      try {
        const listUrl = folder 
          ? `https://firebasestorage.googleapis.com/v0/b/real-estate-vis-management-sys.appspot.com/o?prefix=${folder}/&delimiter=/`
          : `https://firebasestorage.googleapis.com/v0/b/real-estate-vis-management-sys.appspot.com/o?delimiter=/`;
        
        console.log(`📂 Checking folder: ${folder || 'root'}`);
        const response = await fetch(listUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 Found in ${folder || 'root'}:`, data.items?.length || 0, 'files');
          
          if (data.items) {
            data.items.forEach(item => {
              allFiles.push({
                name: item.name,
                fullPath: item.name,
                size: item.size,
                contentType: item.contentType,
                timeCreated: item.timeCreated,
                downloadUrl: `https://firebasestorage.googleapis.com/v0/b/real-estate-vis-management-sys.appspot.com/o/${encodeURIComponent(item.name)}?alt=media`
              });
            });
          }
          
          if (data.prefixes) {
            console.log(`📁 Subfolders in ${folder || 'root'}:`, data.prefixes);
          }
        } else {
          console.log(`❌ Failed to list ${folder || 'root'}: ${response.status}`);
        }
      } catch (folderError) {
        console.log(`❌ Error listing folder ${folder}:`, folderError.message);
      }
    }
    
    console.log(`📊 Total files found: ${allFiles.length}`);
    allFiles.forEach(file => {
      console.log(`  📄 ${file.fullPath} (${file.size} bytes, ${file.contentType})`);
    });
    
    res.json({
      status: 'success',
      totalFiles: allFiles.length,
      files: allFiles,
      message: 'Files listed successfully'
    });
    
  } catch (error) {
    console.error('❌ List files error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy server running on http://localhost:${PORT}`);
  console.log(`📁 Firebase Storage accessible via: http://localhost:${PORT}/firebase-storage/`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test Firebase: http://localhost:${PORT}/test-firebase`);
}); 