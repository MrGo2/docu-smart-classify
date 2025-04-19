/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Environment variable configuration
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '//hshepgzbhetelxqzmvvb.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sbp_e61e8ec3aa909c98ef64a25819f1fc1e00257f49',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? '',
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
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default env; 