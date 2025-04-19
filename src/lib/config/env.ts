/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Log all available environment variables (excluding sensitive data)
console.log('Available Vite env variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓ (set)' : '✗ (not set)',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ (set)' : '✗ (not set)',
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
});

// Environment variable configuration
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Validate required environment variables
const requiredEnvVars = {
  'VITE_SUPABASE_URL': env.supabase.url,
  'VITE_SUPABASE_ANON_KEY': env.supabase.anonKey,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Environment variable ${key} is missing or empty`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Log configuration (without sensitive data)
console.log('Environment configuration:', {
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
  supabaseUrl: env.supabase.url ? '✓ (configured)' : '✗ (not configured)',
});

export default env; 