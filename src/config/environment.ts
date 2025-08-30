// Environment configuration
export const config = {
  // Development
  development: {
    apiUrl: 'http://localhost:8081/api'
  },
  // Production - Update this with your actual backend URL
  production: {
    apiUrl: 'https://real-estate-3d-production.up.railway.app/api'
  }
};

// Get current environment
const env = import.meta.env.MODE || 'development';

// Export current config
export const currentConfig = config[env as keyof typeof config] || config.development;
