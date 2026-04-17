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

const ENV_FALLBACKS: Record<string, string> = {
  VITE_SUPABASE_URL: 'https://cmostfufcenskkmnghlj.supabase.co',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_KW4B_JNaFDKgF9JAa1f2Pw_xEHT3ka_',
  VITE_SUPABASE_PROJECT_ID: 'cmostfufcenskkmnghlj',
};

function getEnvVar(key: string, defaultValue?: string): string {
  const fallbackValue = defaultValue ?? ENV_FALLBACKS[key];
  const value = import.meta.env[key] || fallbackValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (!import.meta.env[key] && ENV_FALLBACKS[key]) {
    console.warn(`[env] ${key} não foi definido no ambiente; usando fallback interno.`);
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
  const required = {
    VITE_SUPABASE_URL: env.supabase.url,
    VITE_SUPABASE_PUBLISHABLE_KEY: env.supabase.publishableKey,
    VITE_SUPABASE_PROJECT_ID: env.supabase.projectId,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env file and make sure all required variables are set.'
    );
  }
}
