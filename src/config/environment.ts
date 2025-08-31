// Environment configuration - Force production for deployed app
export const config = {
  // Development
  development: {
    apiUrl: 'http://localhost:8081/api'
  },
  // Production - Railway backend URL
  production: {
    apiUrl: 'https://real-estate-3d-production.up.railway.app/api'
  }
};

// Force production mode for deployed app - More direct approach
const hostname = window.location.hostname;
const isDeployed = hostname.includes('web.app') || hostname.includes('railway.app') || hostname.includes('firebaseapp.com');
const env = isDeployed ? 'production' : 'development';

// Export current config
export const currentConfig = config[env as keyof typeof config] || config.development;

// Debug logging
console.log('🌍 Environment detected:', env);
console.log('🔗 API URL:', currentConfig.apiUrl);
console.log('📍 Hostname:', hostname);
console.log('🚀 Is Deployed:', isDeployed);
