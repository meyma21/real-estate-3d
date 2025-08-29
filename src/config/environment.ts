// Environment configuration
export const config = {
  // Development
  development: {
    apiUrl: 'http://localhost:8081/api'
  },
  // Production - Update this with your actual backend URL
  production: {
    apiUrl: 'https://your-backend-url.onrender.com/api'
  }
};

// Get current environment
const env = import.meta.env.MODE || 'development';

// Export current config
export const currentConfig = config[env as keyof typeof config] || config.development;
