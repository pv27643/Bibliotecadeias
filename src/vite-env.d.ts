/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK: string;
  readonly VITE_N8N_PATH_EXTRACT_BRAND: string;
  readonly VITE_N8N_PATH_GENERATE_POST: string;
  readonly VITE_N8N_PATH_GENERATE_VISUAL: string;
  readonly VITE_N8N_PATH_GENERATE_CAROUSEL: string;
  readonly VITE_N8N_PATH_REPURPOSE: string;
  readonly VITE_N8N_PATH_WEEKLY_BATCH: string;
  readonly VITE_N8N_PATH_GENERATE_BIO: string;
  readonly VITE_N8N_PATH_DESIGN_AGENT: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_SUPABASE_PUBLIC_ANON_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
