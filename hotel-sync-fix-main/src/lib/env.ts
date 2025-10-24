/**
 * Environment configuration and validation
 */

interface EnvConfig {
  supabase: {
    url: string;
    publishableKey: string;
    projectId: string;
  };
  app: {
    env: 'development' | 'staging' | 'production';
    name: string;
    version: string;
  };
  features: {
    analytics: boolean;
    errorReporting: boolean;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getBooleanEnv(key: string, defaultValue = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    publishableKey: getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY'),
    projectId: getEnvVar('VITE_SUPABASE_PROJECT_ID'),
  },
  app: {
    env: (getEnvVar('VITE_APP_ENV', 'development') as any),
    name: getEnvVar('VITE_APP_NAME', 'Sistema Hoteleiro'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },
  features: {
    analytics: getBooleanEnv('VITE_ENABLE_ANALYTICS'),
    errorReporting: getBooleanEnv('VITE_ENABLE_ERROR_REPORTING'),
  },
};

export const isDevelopment = env.app.env === 'development';
export const isProduction = env.app.env === 'production';
export const isStaging = env.app.env === 'staging';

// Validate required environment variables on app start
export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_SUPABASE_PROJECT_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env file and make sure all required variables are set.'
    );
  }
}
